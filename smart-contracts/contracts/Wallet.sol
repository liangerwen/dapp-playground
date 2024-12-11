// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

error Wallet__TransactionNotExists();
error Wallet__TransactionAlreadyConfirmed();
error Wallet__TransactionAlreadySent();
error Wallet__TransactionIsCanceled();
error Wallet__TransactionNotConfirmed();
error Wallet__RequestorCannotConfirm();
error Wallet__OnlyRequestorCanSend();
error Wallet__OnlyRequestorCanCancel();
error Wallet__OnlyOwnner();
error Wallet__NotEnoughBalance();
error Wallet__OwnersIsRequired();
error Wallet__ConfirmNumIsRequired();
error Wallet__ConfirmNumCannotMoreThanOwners();
error Wallet__AmountCannotBeZero();
error Wallet__TransactionSendFailed();

import {UserWalletStorage} from "./UserWalletStorage.sol";
import {WalletTransactionStorage} from "./WalletTransactionStorage.sol";

// 用户创建钱包 生成钱包地址
contract Wallet {
    enum ConfirmStatus {
        WAIT,
        AGREE,
        REJECT
    }

    UserWalletStorage private userWalletStorage =
        new UserWalletStorage();
    WalletTransactionStorage private walletTransactionStorage =
        new WalletTransactionStorage();

    mapping(bytes32 => mapping(address => mapping(bytes32 => ConfirmStatus)))
        private walletTransactionConfirmStatus;

    mapping(bytes32 => Deposit[]) private walletDeposits;

    event WalletCreated(
        bytes32 indexed walletId,
        UserWalletStorage.WalletType walletType,
        address[] indexed owners,
        uint256 needComfirmCount
    );
    event DepositAmount(
        bytes32 indexed walletId,
        address indexed userAddress,
        uint256 amount,
        uint256 timestamp
    );
    event TransactionRequested(
        bytes32 indexed walletId,
        bytes32 transactionId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );
    event TransactionConfirmed(
        bytes32 indexed walletId,
        bytes32 transactionId,
        ConfirmStatus status,
        address indexed userAddress,
        uint256 timestamp
    );
    event TransactionCanceled(
        bytes32 indexed walletId,
        address indexed from,
        bytes32 transactionId,
        uint256 timestamp
    );
    event TransactionSend(
        bytes32 indexed walletId,
        address indexed from,
        bytes32 transactionId,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    struct Deposit {
        bytes32 id;
        address owner;
        uint256 amount;
        uint256 timestamp;
    }

    modifier onlyWalletOwner(bytes32 _walletId) {
        if (!userWalletStorage.isExists(msg.sender, _walletId)) {
            revert Wallet__OnlyOwnner();
        }
        _;
    }

    modifier onlyExistsTransaction(bytes32 _walletId, bytes32 _transactionId) {
        if (!walletTransactionStorage.isExists(_walletId, _transactionId)) {
            revert Wallet__TransactionNotExists();
        }
        _;
    }

    modifier onlyEnabledTransaction(bytes32 _walletId, bytes32 _transactionId) {
        WalletTransactionStorage.Transaction memory t = walletTransactionStorage
            .getTransactionById(_walletId, _transactionId);
        if (t.status == WalletTransactionStorage.TransactionStatus.CANCELED) {
            revert Wallet__TransactionIsCanceled();
        }
        if (t.status == WalletTransactionStorage.TransactionStatus.SENT) {
            revert Wallet__TransactionAlreadySent();
        }
        _;
    }

    function createWallet(
        address[] memory _owners,
        string memory _name,
        uint256 _needComfirmCount
    ) external payable {
        if (_owners.length == 0) {
            revert Wallet__OwnersIsRequired();
        }
        if (_needComfirmCount == 0) {
            revert Wallet__ConfirmNumIsRequired();
        }
        if (_needComfirmCount > _owners.length) {
            revert Wallet__ConfirmNumCannotMoreThanOwners();
        }
        UserWalletStorage.UserWallet memory wallet = userWalletStorage
            .createWallet(_name, _owners, _needComfirmCount);
        userWalletStorage.setWalletBalance(
            msg.sender,
            wallet.id,
            wallet.balance + msg.value
        );
        emit WalletCreated(
            wallet.id,
            wallet.walletType,
            _owners,
            _needComfirmCount
        );
    }

    function deposit(
        bytes32 _walletId
    ) external payable onlyWalletOwner(_walletId) {
        if (msg.value == 0) {
            revert Wallet__AmountCannotBeZero();
        }
        bytes32 depositId = keccak256(
            abi.encodePacked(block.timestamp, msg.sender, msg.value)
        );
        Deposit memory d = Deposit(
            depositId,
            msg.sender,
            msg.value,
            block.timestamp
        );
        UserWalletStorage.UserWallet memory wallet = userWalletStorage
            .getWalletById(msg.sender, _walletId);
        userWalletStorage.setWalletBalance(
            msg.sender,
            _walletId,
            wallet.balance + msg.value
        );
        walletDeposits[_walletId].push(d);
        emit DepositAmount(_walletId, msg.sender, msg.value, block.timestamp);
    }

    function requestTransaction(
        bytes32 _walletId,
        address _to,
        uint256 _amount,
        string memory _description
    ) external onlyWalletOwner(_walletId) {
        UserWalletStorage.UserWallet memory wallet = userWalletStorage
            .getWalletById(msg.sender, _walletId);
        if (_amount == 0) {
            revert Wallet__AmountCannotBeZero();
        }
        if (wallet.balance < _amount) {
            revert Wallet__NotEnoughBalance();
        }
        WalletTransactionStorage.Transaction memory t = walletTransactionStorage
            .createTransaction(
                _walletId,
                msg.sender,
                _to,
                _amount,
                wallet.needComfirmCount <= 1
                    ? WalletTransactionStorage.TransactionStatus.CONFIRMED
                    : WalletTransactionStorage.TransactionStatus.REQUESTED,
                _description
            );
        emit TransactionRequested(
            _walletId,
            t.id,
            msg.sender,
            _to,
            _amount,
            block.timestamp
        );
    }

    function confirmTransaction(
        bytes32 _walletId,
        bytes32 _transactionId,
        bool _confirm
    )
        external
        onlyWalletOwner(_walletId)
        onlyExistsTransaction(_walletId, _transactionId)
        onlyEnabledTransaction(_walletId, _transactionId)
    {
        UserWalletStorage.UserWallet memory wallet = userWalletStorage
            .getWalletById(msg.sender, _walletId);
        WalletTransactionStorage.Transaction memory t = walletTransactionStorage
            .getTransactionById(_walletId, _transactionId);
        if (t.status == WalletTransactionStorage.TransactionStatus.CONFIRMED) {
            revert Wallet__TransactionAlreadyConfirmed();
        }
        if (t.from == msg.sender) {
            revert Wallet__RequestorCannotConfirm();
        }
        if (
            walletTransactionConfirmStatus[_walletId][msg.sender][
                _transactionId
            ] != ConfirmStatus.WAIT
        ) {
            revert Wallet__TransactionAlreadyConfirmed();
        }
        ConfirmStatus _status = _confirm
            ? ConfirmStatus.AGREE
            : ConfirmStatus.REJECT;
        walletTransactionConfirmStatus[_walletId][msg.sender][
            _transactionId
        ] = _status;
        if (_confirm) {
            uint256 nextComfirmedCount = t.confirmedCount + 1;
            walletTransactionStorage.setTransactionConfrimedCount(
                _walletId,
                _transactionId,
                nextComfirmedCount
            );
            if (nextComfirmedCount == wallet.needComfirmCount) {
                walletTransactionStorage.setTransactionStatus(
                    _walletId,
                    _transactionId,
                    WalletTransactionStorage.TransactionStatus.CONFIRMED
                );
            }
        }
        emit TransactionConfirmed(
            _walletId,
            _transactionId,
            _status,
            msg.sender,
            block.timestamp
        );
    }

    function cancelTransaction(
        bytes32 _walletId,
        bytes32 _transactionId
    )
        external
        onlyWalletOwner(_walletId)
        onlyExistsTransaction(_walletId, _transactionId)
        onlyEnabledTransaction(_walletId, _transactionId)
    {
        WalletTransactionStorage.Transaction memory t = walletTransactionStorage
            .getTransactionById(_walletId, _transactionId);
        if (msg.sender != t.from) {
            revert Wallet__OnlyRequestorCanCancel();
        }
        walletTransactionStorage.setTransactionStatus(
            _walletId,
            _transactionId,
            WalletTransactionStorage.TransactionStatus.CANCELED
        );
        emit TransactionCanceled(
            _walletId,
            t.from,
            _transactionId,
            t.timestamp
        );
    }

    function sendTransaction(
        bytes32 _walletId,
        bytes32 _transactionId
    )
        external
        onlyWalletOwner(_walletId)
        onlyExistsTransaction(_walletId, _transactionId)
        onlyEnabledTransaction(_walletId, _transactionId)
    {
        UserWalletStorage.UserWallet memory wallet = userWalletStorage
            .getWalletById(msg.sender, _walletId);
        WalletTransactionStorage.Transaction memory t = walletTransactionStorage
            .getTransactionById(_walletId, _transactionId);
        if (t.from != msg.sender) {
            revert Wallet__OnlyRequestorCanSend();
        }
        if (t.status != WalletTransactionStorage.TransactionStatus.CONFIRMED) {
            revert Wallet__TransactionNotConfirmed();
        }
        if (wallet.balance < t.amount) {
            revert Wallet__NotEnoughBalance();
        }
        walletTransactionStorage.setTransactionStatus(
            _walletId,
            _transactionId,
            WalletTransactionStorage.TransactionStatus.SENT
        );
        userWalletStorage.setWalletBalance(
            msg.sender,
            _walletId,
            wallet.balance - t.amount
        );
        (bool success, ) = t.to.call{value: t.amount}("");
        if (!success) {
            revert Wallet__TransactionSendFailed();
        }
        emit TransactionSend(
            _walletId,
            t.from,
            _transactionId,
            t.to,
            t.amount,
            block.timestamp
        );
    }

    /** getters */

    function getWalletTransactions(
        bytes32 _walletId
    )
        public
        view
        returns (
            WalletTransactionStorage.Transaction[] memory,
            ConfirmStatus[] memory
        )
    {
        WalletTransactionStorage.Transaction[]
            memory _transactions = walletTransactionStorage.getTransactions(
                _walletId
            );
        ConfirmStatus[] memory _comfirmStatus = new ConfirmStatus[](
            _transactions.length
        );
        for (uint256 i = 0; i < _transactions.length; i++) {
            bytes32 _transactionId = _transactions[i].id;
            _comfirmStatus[i] = walletTransactionConfirmStatus[_walletId][
                msg.sender
            ][_transactionId];
        }
        return (_transactions, _comfirmStatus);
    }

    function getWalletDeposits(
        bytes32 _walletId
    ) public view returns (Deposit[] memory deposits) {
        return walletDeposits[_walletId];
    }

    function getUserWallets()
        public
        view
        returns (UserWalletStorage.UserWallet[] memory)
    {
        return userWalletStorage.getWallets(msg.sender);
    }
}

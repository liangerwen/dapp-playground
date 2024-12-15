// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletTransactionStorage {
    mapping(bytes32 => Transaction[]) private walletTransactions;
    mapping(bytes32 => mapping(bytes32 => uint256))
        private walletTransactionIdx;

    enum TransactionStatus {
        REQUESTED,
        CONFIRMED,
        CANCELED,
        SENT
    }

    struct Transaction {
        bytes32 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        TransactionStatus status;
        string description;
        uint256 confirmedCount;
    }

    function createTransaction(
        bytes32 _walletId,
        address _from,
        address _to,
        uint256 _amount,
        TransactionStatus _status,
        string memory _description
    ) external returns (Transaction memory) {
        uint256 idx = walletTransactions[_walletId].length;
        bytes32 id = keccak256(
            abi.encodePacked(
                idx,
                _walletId,
                _from,
                _to,
                _amount,
                block.timestamp,
                _description
            )
        );
        Transaction memory transaction = Transaction(
            id,
            _from,
            _to,
            _amount,
            block.timestamp,
            _status,
            _description,
            1
        );
        walletTransactions[_walletId].push(transaction);
        walletTransactionIdx[_walletId][id] = idx;
        return transaction;
    }

    function getTransactionById(
        bytes32 _walletId,
        bytes32 _id
    ) external view returns (Transaction memory) {
        return _getTransactionById(_walletId, _id);
    }

    function _getTransactionById(
        bytes32 _walletId,
        bytes32 _id
    ) internal view returns (Transaction storage) {
        uint256 idx = walletTransactionIdx[_walletId][_id];
        return walletTransactions[_walletId][idx];
    }

    function getTransactions(
        bytes32 _walletId
    ) external view returns (Transaction[] memory) {
        return walletTransactions[_walletId];
    }

    function setTransactionStatus(
        bytes32 _walletId,
        bytes32 _id,
        TransactionStatus _status
    ) external {
        Transaction storage transaction = _getTransactionById(_walletId, _id);
        transaction.status = _status;
    }

    function setTransactionConfrimedCount(
        bytes32 _walletId,
        bytes32 _id,
        uint256 _confrimedCount
    ) external {
        Transaction storage transaction = _getTransactionById(_walletId, _id);
        transaction.confirmedCount = _confrimedCount;
    }

    function isExists(
        bytes32 _walletId,
        bytes32 _id
    ) external view returns (bool exist) {
        uint256 idx = walletTransactionIdx[_walletId][_id];
        exist =
            _id != bytes32(0) &&
            (idx > 0 || walletTransactions[_walletId][idx].id == _id);
    }
}

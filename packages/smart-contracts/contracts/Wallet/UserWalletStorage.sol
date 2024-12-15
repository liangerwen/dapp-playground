// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserWalletStorage {
    UserWallet[] private wallets;
    mapping(address => bytes32[]) private userWallets;
    mapping(address => mapping(bytes32 => uint256)) private userWalletIdx;

    enum WalletType {
        SINGLE,
        MULTI
    }

    struct UserWallet {
        bytes32 id;
        string name;
        WalletType walletType;
        address[] owners;
        uint256 balance;
        uint256 needComfirmCount;
        uint256 timestamp;
    }

    function createWallet(
        string memory _name,
        address[] memory _owners,
        uint256 _needComfirmCount
    ) external payable returns (UserWallet memory) {
        uint256 walletIdx = wallets.length;
        bytes32 id = keccak256(
            abi.encodePacked(
                walletIdx,
                _name,
                _owners,
                _needComfirmCount,
                block.timestamp
            )
        );
        UserWallet memory wallet = UserWallet(
            id,
            _name,
            _owners.length == 1 ? WalletType.SINGLE : WalletType.MULTI,
            _owners,
            msg.value,
            _needComfirmCount,
            block.timestamp
        );
        for (uint256 i = 0; i < _owners.length; i++) {
            address user = _owners[i];
            userWalletIdx[user][id] = walletIdx;
            userWallets[user].push(id);
        }
        wallets.push(wallet);
        return wallet;
    }

    function setWalletBalance(
        address _user,
        bytes32 _id,
        uint256 _balance
    ) external {
        UserWallet storage wallet = _getWalletById(_user, _id);
        wallet.balance = _balance;
    }

    function _getWalletById(
        address _user,
        bytes32 _id
    ) internal view returns (UserWallet storage) {
        uint256 idx = userWalletIdx[_user][_id];
        return wallets[idx];
    }

    function getWalletById(
        address _user,
        bytes32 _id
    ) external view returns (UserWallet memory) {
        return _getWalletById(_user, _id);
    }

    function getWallets(
        address _user
    ) external view returns (UserWallet[] memory) {
        bytes32[] memory ids = userWallets[_user];
        UserWallet[] memory userWalletList = new UserWallet[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            bytes32 id = ids[i];
            uint256 idx = userWalletIdx[_user][id];
            userWalletList[i] = wallets[idx];
        }
        return userWalletList;
    }

    function isExists(
        address _user,
        bytes32 _id
    ) external view returns (bool exist) {
        uint256 idx = userWalletIdx[_user][_id];
        exist = _id != bytes32(0) && (idx > 0 || userWallets[_user][idx] == _id);
    }
}

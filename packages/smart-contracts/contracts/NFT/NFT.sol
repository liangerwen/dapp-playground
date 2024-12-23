// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is
  ERC721,
  ERC721Enumerable,
  ERC721URIStorage,
  ERC721Burnable,
  Ownable
{
  uint256 private _nextTokenId;

  struct Token {
    uint256 tokenId;
    string name;
    string description;
    string uri;
  }

  constructor() ERC721("BrownDustToken", "BDT") Ownable(msg.sender) {}

  function safeMint(address to, string memory uri) public onlyOwner {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(
    address account,
    uint128 value
  ) internal override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    override(ERC721, ERC721Enumerable, ERC721URIStorage)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function getNFTs(address _owner) public view returns (Token[] memory) {
    uint256 balance = balanceOf(_owner);
    Token[] memory tokens = new Token[](balance);
    for (uint256 i = 0; i < balance; i++) {
      tokens[i] = Token({
        tokenId: tokenOfOwnerByIndex(_owner, i),
        name: name(),
        description: "",
        uri: tokenURI(tokenOfOwnerByIndex(_owner, i))
      });
    }
    return tokens;
  }
}

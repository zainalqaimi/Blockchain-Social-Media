pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NewoData is ERC721Enumerable, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) private profileStreamIds;
    // need a mapping from token id to friends stream id
    mapping(uint256 => string) private friendStreamIds;
    // need a mapping from token id to posts stream id
    mapping(uint256 => string) private postStreamIds;

    // need a mapping from token owner address to token id
    mapping(address => uint256) private addressToTokenId;

    constructor() ERC721("NewoData", "NEWO") {

    }


    function mintNewo(string memory profile, string memory friends, string memory posts) public {

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        profileStreamIds[newTokenId] = profile;
        friendStreamIds[newTokenId] = friends;
        postStreamIds[newTokenId] = posts;
        
        _safeMint(msg.sender, newTokenId);

    }

    function getProfile(uint256 tokId) public view returns (string memory) {
        require(
            _exists(tokId),
            "Token does not exist"
        );
        return profileStreamIds[tokId];
    }

    function getFriends(uint256 tokId) public view returns (string memory) {
        require(
            _exists(tokId),
            "Token does not exist"
        );

        return friendStreamIds[tokId];
    }

    function getPosts(uint256 tokId) public view returns (string memory) {
        require(
            _exists(tokId),
            "Token does not exist"
        );

        return postStreamIds[tokId];
    }
}
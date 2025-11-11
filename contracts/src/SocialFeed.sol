// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SocialFeed is Ownable(msg.sender) {
    uint256 private _postIdCounter;

    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }

    struct UserProfile {
        string username;
        string bio;
        uint256 followerCount;
        uint256 followingCount;
        bool exists;
    }

    Post[] public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes; // postId => user => liked
    mapping(address => mapping(address => bool)) public follows; // follower => followed => following
    mapping(address => UserProfile) public profiles;
    mapping(address => uint256[]) public userPosts;

    event PostCreated(uint256 indexed postId, address indexed author, string content, uint256 timestamp);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 totalLikes);
    event PostUnliked(uint256 indexed postId, address indexed unliker, uint256 totalLikes);
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed follower, address indexed unfollowed);
    event ProfileUpdated(address indexed user, string username, string bio);

    constructor() {}

    function createPost(string memory content) public {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(bytes(content).length <= 280, "Content too long (max 280 chars)");

        uint256 postId = _postIdCounter;
        _postIdCounter++;

        posts.push(Post(postId, msg.sender, content, block.timestamp, 0));
        userPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, content, block.timestamp);
    }

    function likePost(uint256 postId) public {
        require(postId < posts.length, "Post does not exist");
        require(!postLikes[postId][msg.sender], "Already liked");

        postLikes[postId][msg.sender] = true;
        posts[postId].likes++;

        emit PostLiked(postId, msg.sender, posts[postId].likes);
    }

    function unlikePost(uint256 postId) public {
        require(postId < posts.length, "Post does not exist");
        require(postLikes[postId][msg.sender], "Not liked yet");

        postLikes[postId][msg.sender] = false;
        posts[postId].likes--;

        emit PostUnliked(postId, msg.sender, posts[postId].likes);
    }

    function followUser(address userToFollow) public {
        require(userToFollow != msg.sender, "Cannot follow yourself");
        require(!follows[msg.sender][userToFollow], "Already following");

        follows[msg.sender][userToFollow] = true;
        profiles[userToFollow].followerCount++;
        profiles[msg.sender].followingCount++;

        emit UserFollowed(msg.sender, userToFollow);
    }

    function unfollowUser(address userToUnfollow) public {
        require(follows[msg.sender][userToUnfollow], "Not following");

        follows[msg.sender][userToUnfollow] = false;
        profiles[userToUnfollow].followerCount--;
        profiles[msg.sender].followingCount--;

        emit UserUnfollowed(msg.sender, userToUnfollow);
    }

    function updateProfile(string memory username, string memory bio) public {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 50, "Username too long");
        require(bytes(bio).length <= 160, "Bio too long");

        profiles[msg.sender] = UserProfile(username, bio, profiles[msg.sender].followerCount, profiles[msg.sender].followingCount, true);

        emit ProfileUpdated(msg.sender, username, bio);
    }

    function getPosts(uint256 offset, uint256 limit) public view returns (Post[] memory) {
        require(offset < posts.length, "Offset out of bounds");

        uint256 actualLimit = limit;
        if (offset + limit > posts.length) {
            actualLimit = posts.length - offset;
        }

        Post[] memory result = new Post[](actualLimit);
        for (uint256 i = 0; i < actualLimit; i++) {
            result[i] = posts[posts.length - 1 - offset - i]; // Most recent first
        }
        return result;
    }

    function getUserPosts(address user, uint256 offset, uint256 limit) public view returns (Post[] memory) {
        uint256[] memory userPostIds = userPosts[user];
        require(offset < userPostIds.length, "Offset out of bounds");

        uint256 actualLimit = limit;
        if (offset + limit > userPostIds.length) {
            actualLimit = userPostIds.length - offset;
        }

        Post[] memory result = new Post[](actualLimit);
        for (uint256 i = 0; i < actualLimit; i++) {
            uint256 postId = userPostIds[userPostIds.length - 1 - offset - i];
            result[i] = posts[postId];
        }
        return result;
    }

    function getPostCount() public view returns (uint256) {
        return posts.length;
    }

    function isFollowing(address follower, address followed) public view returns (bool) {
        return follows[follower][followed];
    }

    function hasLiked(uint256 postId, address user) public view returns (bool) {
        return postLikes[postId][user];
    }
}

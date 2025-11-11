// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/SocialFeed.sol";

contract SocialFeedTest is Test {
    SocialFeed public socialFeed;

    address public user1 = address(0x123);
    address public user2 = address(0x456);
    address public user3 = address(0x789);

    function setUp() public {
        socialFeed = new SocialFeed();
    }

    function testCreatePost() public {
        vm.prank(user1);
        socialFeed.createPost("Hello, world!");

        SocialFeed.Post[] memory posts = socialFeed.getPosts(0, 10);
        assertEq(posts.length, 1);
        assertEq(posts[0].author, user1);
        assertEq(posts[0].content, "Hello, world!");
        assertEq(posts[0].likes, 0);
    }

    function testLikePost() public {
        vm.prank(user1);
        socialFeed.createPost("Test post");

        vm.prank(user2);
        socialFeed.likePost(0);

        SocialFeed.Post[] memory posts = socialFeed.getPosts(0, 10);
        assertEq(posts[0].likes, 1);

        assertTrue(socialFeed.hasLiked(0, user2));
    }

    function testUnlikePost() public {
        vm.prank(user1);
        socialFeed.createPost("Test post");

        vm.prank(user2);
        socialFeed.likePost(0);

        vm.prank(user2);
        socialFeed.unlikePost(0);

        SocialFeed.Post[] memory posts = socialFeed.getPosts(0, 10);
        assertEq(posts[0].likes, 0);

        assertFalse(socialFeed.hasLiked(0, user2));
    }

    function testFollowUser() public {
        vm.prank(user1);
        socialFeed.followUser(user2);

        assertTrue(socialFeed.isFollowing(user1, user2));

        (string memory username, string memory bio, uint256 followers, uint256 following, bool exists) = socialFeed.profiles(user2);
        assertEq(followers, 1);

        (username, bio, followers, following, exists) = socialFeed.profiles(user1);
        assertEq(following, 1);
    }

    function testUnfollowUser() public {
        vm.prank(user1);
        socialFeed.followUser(user2);

        vm.prank(user1);
        socialFeed.unfollowUser(user2);

        assertFalse(socialFeed.isFollowing(user1, user2));

        (string memory username, string memory bio, uint256 followers, uint256 following, bool exists) = socialFeed.profiles(user2);
        assertEq(followers, 0);
    }

    function testUpdateProfile() public {
        vm.prank(user1);
        socialFeed.updateProfile("Alice", "Web3 developer");

        (string memory username, string memory bio, uint256 followers, uint256 following, bool exists) = socialFeed.profiles(user1);
        assertEq(username, "Alice");
        assertEq(bio, "Web3 developer");
        assertTrue(exists);
    }

    function testGetPostsPagination() public {
        vm.prank(user1);
        socialFeed.createPost("Post 1");

        vm.prank(user1);
        socialFeed.createPost("Post 2");

        vm.prank(user1);
        socialFeed.createPost("Post 3");

        SocialFeed.Post[] memory posts = socialFeed.getPosts(0, 2);
        assertEq(posts.length, 2);
        assertEq(posts[0].content, "Post 3"); // Most recent first
        assertEq(posts[1].content, "Post 2");

        posts = socialFeed.getPosts(2, 2);
        assertEq(posts.length, 1);
        assertEq(posts[0].content, "Post 1");
    }

    function testGetUserPosts() public {
        vm.prank(user1);
        socialFeed.createPost("User1 Post 1");

        vm.prank(user2);
        socialFeed.createPost("User2 Post 1");

        vm.prank(user1);
        socialFeed.createPost("User1 Post 2");

        SocialFeed.Post[] memory userPosts = socialFeed.getUserPosts(user1, 0, 10);
        assertEq(userPosts.length, 2);
        assertEq(userPosts[0].content, "User1 Post 2");
        assertEq(userPosts[1].content, "User1 Post 1");
    }

    function testRevertEmptyContent() public {
        vm.prank(user1);
        vm.expectRevert("Content cannot be empty");
        socialFeed.createPost("");
    }

    function testRevertContentTooLong() public {
        string memory longContent = new string(281);
        for (uint i = 0; i < 281; i++) {
            longContent = string(abi.encodePacked(longContent, "a"));
        }
        vm.prank(user1);
        vm.expectRevert("Content too long (max 280 chars)");
        socialFeed.createPost(longContent);
    }

    function testRevertLikeNonexistentPost() public {
        vm.prank(user1);
        vm.expectRevert("Post does not exist");
        socialFeed.likePost(0);
    }

    function testRevertDoubleLike() public {
        vm.prank(user1);
        socialFeed.createPost("Test");

        vm.prank(user2);
        socialFeed.likePost(0);

        vm.prank(user2);
        vm.expectRevert("Already liked");
        socialFeed.likePost(0);
    }

    function testRevertFollowSelf() public {
        vm.prank(user1);
        vm.expectRevert("Cannot follow yourself");
        socialFeed.followUser(user1);
    }

    function testRevertDoubleFollow() public {
        vm.prank(user1);
        socialFeed.followUser(user2);

        vm.prank(user1);
        vm.expectRevert("Already following");
        socialFeed.followUser(user2);
    }
}

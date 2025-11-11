// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/SocialFeed.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        SocialFeed socialFeed = new SocialFeed();

        vm.stopBroadcast();

        console.log("SocialFeed deployed to:", address(socialFeed));
    }
}

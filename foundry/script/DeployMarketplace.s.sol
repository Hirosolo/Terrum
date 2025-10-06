// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/marketPlace.sol";

contract DeployMarketplace is Script {
    
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get fee recipient address (can be the deployer or a different address)
        address feeRecipient = vm.envOr("FEE_RECIPIENT", vm.addr(deployerPrivateKey));
        
        console.log("Starting Marketplace deployment...");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Fee Recipient:", feeRecipient);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Marketplace
        Marketplace marketplace = new Marketplace(feeRecipient);
        
        vm.stopBroadcast();
        console.log("Marketplace deployed at:", address(marketplace));
    }
}
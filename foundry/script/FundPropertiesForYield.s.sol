// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/mock/mockStableToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILand {
    function getYieldEconomics() external view returns (uint256 totalTokens, uint256 pricePerTokenInUSDT, uint256 expectedAnnualYieldInUSDT);
}

contract FundPropertiesForYield is Script {
    address constant USDT_ADDRESS = 0x5Df5E5FD5396e1387A982a7A7450D0c7CEaB40B8;
    
    // All deployed property addresses on U2U testnet
    address[] public propertyAddresses = [
        0xC6141Ff111AeB43731EC2d528E779175Ecdd818b, // Property 1 - Saigon Pearl Residence
        0x811CFbb8d921DfBF0e24c922EE1Bca3cc4b91c96, // Property 2 - Hanoi Horizon Towers
        0x20C6924E9A2831FD58aa10cFb9b782A31865b470, // Property 3 - Da Nang Marina Bay
        0xEA2D22e92b8a2B7ed4cfA7C92a92F6b2D519c740, // Property 4 - Nha Trang Skyline
        0xBeE606a6c95A4B93EcccCA6aA9009F4cB5D07c45, // Property 5 - Mekong Riverside Villas
        0xD09D0800747F245350e5DE632b688f3a6667aAD9, // Property 6 - Hue Imperial Garden
        0xa3085bBc40168Ca4295e567a8a1c16470CD89F8D, // Property 7 - Phu Quoc Oceanfront Estate
        0xa3628A37656aaEedF8BaA6B8A129731Fd62E707B  // Property 8 - Sapa Highland Retreat
    ];
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        mockStableToken usdt = mockStableToken(USDT_ADDRESS);
        
        console.log("=== FUNDING PROPERTIES FOR YIELD TESTING ===");
        console.log("USDT Contract:", USDT_ADDRESS);
        console.log("Properties to fund:", propertyAddresses.length);
        
        // Fund each property with mock USDT for yield testing
        uint256 fundingAmount = 100000e18; // 100k USDT per property (18 decimals)
        
        for (uint256 i = 0; i < propertyAddresses.length; i++) {
            console.log("\n--- Property", i + 1, "---");
            console.log("Address:", propertyAddresses[i]);
            
            // Mint USDT to the property contract
            usdt.mint(propertyAddresses[i], fundingAmount);
            
            // Verify new balance
            uint256 newBalance = usdt.balanceOf(propertyAddresses[i]);
            console.log("Funded with (USDT):", fundingAmount / 1e18);
            console.log("New property balance:", newBalance / 1e18, "USDT");
            console.log("SUCCESS: Property funded!");
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== FUNDING SUMMARY ===");
        
        // Check balances after funding
        for (uint256 i = 0; i < propertyAddresses.length; i++) {
            uint256 balance = IERC20(USDT_ADDRESS).balanceOf(propertyAddresses[i]);
            console.log("Property balance (USDT):", balance / 1e18);
        }
        
        console.log("\n=== SUCCESS ===");
        console.log("All 8 properties have been funded with USDT for yield testing!");
    }
    
    // Helper function to fund a single property
    function fundSingleProperty(address propertyAddress, uint256 amount) public {
        vm.startBroadcast();
        
        mockStableToken usdt = mockStableToken(USDT_ADDRESS);
        
        console.log("Funding property with (USDT):", amount / 1e18);
        usdt.mint(propertyAddress, amount);
        
        uint256 newBalance = usdt.balanceOf(propertyAddress);
        console.log("New property balance:", newBalance / 1e18, "USDT");
        
        vm.stopBroadcast();
    }
    
    // Emergency funding function
    function emergencyFundProperty(address propertyAddress, uint256 amount) public {
        vm.startBroadcast();
        
        mockStableToken usdt = mockStableToken(USDT_ADDRESS);
        console.log("Emergency funding property (USDT):", amount / 1e18);
        usdt.mint(propertyAddress, amount);
        
        vm.stopBroadcast();
    }
}
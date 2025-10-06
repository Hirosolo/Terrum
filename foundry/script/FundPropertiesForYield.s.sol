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
    
    // All deployed property addresses on U2U testnet (Updated October 6, 2025)
    address[] public propertyAddresses = [
        0xf476D12Dd460ee9D48ED7d95234D8F2a5C894e99, // Property 1 - Saigon Pearl Residence
        0xFC7cf639b8168Ce8715F788887B731A244c5885E, // Property 2 - Hanoi Horizon Towers
        0x4A0e3FCADBA7c97F9AC10aB7Bc9B32a3eF754b76, // Property 3 - Da Nang Marina Bay
        0x7Fa2E1f819047033971C9E282148c8744AA9FE3A, // Property 4 - Nha Trang Skyline
        0xb5C684098b5295f131fb50A377cf4FC3831dd8c9, // Property 5 - Mekong Riverside Villas
        0xf9F560e8EBB7B5Dc3C4AfACF860a98cA44DFe01c, // Property 6 - Hue Imperial Garden
        0x19052aC0EF38517C1C4Fcf02CCf37807dcEE864F, // Property 7 - Phu Quoc Oceanfront Estate
        0xB2a5Aa1629C176F97Dc5fA117D9075Ac4a3fFC63, // Property 8 - Sapa Highland Retreat
        0xaC0eF002C9bbF33ee88C0D042733F9F4abd3dB28, // Property 9 - Saigon Gateway
        0x710e0494762c52ee06fA10400227Ce7a9CFE0429  // Property 10 - The East Gate (NEW)
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
        console.log("All 10 properties have been funded with USDT for yield testing!");
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
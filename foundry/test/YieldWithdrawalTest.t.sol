// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/landTokenizer.sol";
import "../src/land.sol";
import "../src/mock/mockStableToken.sol";

contract YieldWithdrawalTest is Test {
    LandTokenizer public tokenizer;
    mockStableToken public usdt;
    Land public landContract;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 constant TOTAL_VALUE = 1000000e18; // 1M USDT
    uint256 constant TOTAL_SUPPLY = 1000; // 1000 NFTs
    uint256 constant TOKEN_PRICE = TOTAL_VALUE / TOTAL_SUPPLY; // 1000 USDT per NFT
    uint256 constant YIELD_RATE = 1e15; // Yield per block per token

    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        usdt = new mockStableToken(owner, "Mock USDT", "USDT");
        tokenizer = new LandTokenizer();
        tokenizer.addSupportedStablecoin(address(usdt));
        
        // Deploy property with start date in the future, then we'll advance blocks
        address propertyAddress = tokenizer.tokenizeProperty(
            address(usdt),
            "Test Property",
            "TPROP",
            TOTAL_VALUE,
            TOTAL_SUPPLY,
            YIELD_RATE,
            block.number + 1000, // Start in 1000 blocks
            1 // Land type
        );
        landContract = Land(propertyAddress);
        
        vm.stopPrank();
        
        // Give users USDT and approve spending
        uint256 userBalance = 10000000e18; // 10M USDT each
        vm.startPrank(owner);
        usdt.mint(user1, userBalance);
        usdt.mint(user2, userBalance);
        vm.stopPrank();
        
        vm.prank(user1);
        usdt.approve(address(landContract), userBalance);
        vm.prank(user2);
        usdt.approve(address(landContract), userBalance);
    }

    function testRealtimeYieldWithdrawal() public {
        console.log("\n=== Testing Real-time Yield Withdrawal ===");
        
        // User1 mints 10 tokens (minting is allowed before start date)
        vm.startPrank(user1);
        for(uint i = 0; i < 10; i++) {
            landContract.mint(user1);
        }
        vm.stopPrank();
        
        // Now advance blocks past start date so yield begins
        vm.roll(block.number + 1001); // Advance past start date
        
        console.log("User1 tokens:", landContract.balanceOf(user1));
        
        // Check initial yield info
        (
            uint256 tokensOwned,
            uint256 lastWithdrawBlock,
            uint256 yieldPerBlockPerToken,
            uint256 blocksSinceLastWithdraw,
            uint256 currentYieldAccrued
        ) = landContract.getUserYieldInfo(user1);
        
        console.log("Initial yield info:");
        console.log("- Tokens owned:", tokensOwned);
        console.log("- Last withdraw block:", lastWithdrawBlock);
        console.log("- Yield per block per token:", yieldPerBlockPerToken);
        console.log("- Blocks since last withdraw:", blocksSinceLastWithdraw);
        console.log("- Current yield accrued:", currentYieldAccrued);
        
        // Advance some blocks to accumulate yield
        vm.roll(block.number + 50);
        
        // Check available yield
        (uint256 yieldAmount, bool canWithdraw, bool hasBalance) = landContract.getAvailableYield(user1);
        console.log("\nAfter 50 blocks:");
        console.log("- Available yield:", yieldAmount);
        console.log("- Can withdraw:", canWithdraw);
        console.log("- Has balance:", hasBalance);
        
        // Fund contract for yield payments (owner deposits some USDT)
        vm.startPrank(owner);
        uint256 yieldFunding = 100000e18; // Fund with 100k USDT
        usdt.mint(owner, yieldFunding);
        usdt.transfer(address(landContract), yieldFunding);
        vm.stopPrank();
        
        // Check balance again
        (yieldAmount, canWithdraw, hasBalance) = landContract.getAvailableYield(user1);
        console.log("\nAfter funding contract:");
        console.log("- Available yield:", yieldAmount);
        console.log("- Can withdraw:", canWithdraw);  
        console.log("- Has balance:", hasBalance);
        
        // Now user1 should be able to withdraw yield
        assertTrue(canWithdraw, "User should be able to withdraw");
        assertTrue(hasBalance, "Contract should have sufficient balance");
        assertTrue(yieldAmount > 0, "Yield amount should be greater than 0");
        
        // Withdraw yield
        uint256 balanceBefore = usdt.balanceOf(user1);
        vm.prank(user1);
        landContract.withdrawYield();
        uint256 balanceAfter = usdt.balanceOf(user1);
        
        uint256 withdrawnAmount = balanceAfter - balanceBefore;
        console.log("- Withdrawn amount:", withdrawnAmount);
        assertEq(withdrawnAmount, yieldAmount, "Withdrawn amount should match available yield");
        
        // Advance more blocks and withdraw again
        vm.roll(block.number + 25);
        
        (uint256 newYieldAmount, bool canWithdrawAgain,) = landContract.getAvailableYield(user1);
        console.log("\nAfter 25 more blocks:");
        console.log("- New available yield:", newYieldAmount);
        console.log("- Can withdraw again:", canWithdrawAgain);
        
        assertTrue(canWithdrawAgain, "User should be able to withdraw again");
        assertTrue(newYieldAmount > 0, "New yield should have accumulated");
        
        // Withdraw again
        uint256 balanceBefore2 = usdt.balanceOf(user1);
        vm.prank(user1);
        landContract.withdrawYield();
        uint256 balanceAfter2 = usdt.balanceOf(user1);
        
        uint256 withdrawnAmount2 = balanceAfter2 - balanceBefore2;
        console.log("- Second withdrawn amount:", withdrawnAmount2);
        assertEq(withdrawnAmount2, newYieldAmount, "Second withdrawn amount should match new available yield");
        
        console.log("\nReal-time yield withdrawal working correctly!");
    }
    
    function testMultipleUsersYieldWithdrawal() public {
        console.log("\n=== Testing Multiple Users Yield Withdrawal ===");
        
        // User1 mints 5 tokens (minting is allowed before start date)
        vm.startPrank(user1);
        for(uint i = 0; i < 5; i++) {
            landContract.mint(user1);
        }
        vm.stopPrank();
        
        // User2 mints 3 tokens
        vm.startPrank(user2);
        for(uint i = 0; i < 3; i++) {
            landContract.mint(user2);
        }
        vm.stopPrank();
        
        // Now advance blocks past start date so yield begins  
        vm.roll(block.number + 1001); // Advance past start date
        
        console.log("User1 tokens:", landContract.balanceOf(user1));
        console.log("User2 tokens:", landContract.balanceOf(user2));
        
        // Advance blocks to accumulate yield
        vm.roll(block.number + 100);
        
        // Fund contract
        vm.startPrank(owner);
        uint256 yieldFunding = 100000e18;
        usdt.mint(owner, yieldFunding);
        usdt.transfer(address(landContract), yieldFunding);
        vm.stopPrank();
        
        // Check available yield for both users
        (uint256 yield1, bool canWithdraw1,) = landContract.getAvailableYield(user1);
        (uint256 yield2, bool canWithdraw2,) = landContract.getAvailableYield(user2);
        
        console.log("User1 available yield:", yield1);
        console.log("User2 available yield:", yield2);
        
        assertTrue(canWithdraw1, "User1 should be able to withdraw");
        assertTrue(canWithdraw2, "User2 should be able to withdraw");
        
        // Both users should have proportional yield based on their token count
        // User1: 5 tokens, User2: 3 tokens, ratio should be 5:3
        uint256 expectedRatio = (yield1 * 3) / (yield2 * 5);
        console.log("Yield ratio (should be close to 1):", expectedRatio);
        
        // The ratio should be close to 1 (allowing for small rounding differences)
        assertApproxEqRel(yield1 * 3, yield2 * 5, 0.01e18); // 1% tolerance
        
        // Both users withdraw
        vm.prank(user1);
        landContract.withdrawYield();
        
        vm.prank(user2);
        landContract.withdrawYield();
        
        console.log("Multiple users yield withdrawal working correctly!");
    }
}
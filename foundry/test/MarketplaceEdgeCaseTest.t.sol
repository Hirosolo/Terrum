// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/marketPlace.sol";
import "../src/landTokenizer.sol";
import "../src/land.sol";
import "../src/mock/mockStableToken.sol";

contract MarketplaceEdgeCaseTest is Test {
    Marketplace public marketplace;
    LandTokenizer public tokenizer;
    Land public landContract;
    mockStableToken public usdt;
    
    address public deployer = address(this);
    address public seller = address(0x1);
    address public buyer = address(0x2);
    address public feeRecipient = address(0x3);
    
    uint256 public constant PROPERTY_VALUE = 100000e6;
    uint256 public constant TOTAL_SUPPLY = 500;
    uint256 public constant YIELD_RATE = 1e6;
    uint256 public constant LISTING_PRICE = 250e6;

    function setUp() public {
        usdt = new mockStableToken(address(this), "Mock USDT", "USDT");
        marketplace = new Marketplace(feeRecipient);
        tokenizer = new LandTokenizer();
        tokenizer.addSupportedStablecoin(address(usdt));
        
        uint256 startDate = block.number + 1000;
        vm.prank(deployer);
        tokenizer.tokenizeProperty(
            address(usdt),
            "Test Property",
            "TPROP",
            PROPERTY_VALUE,
            TOTAL_SUPPLY,
            YIELD_RATE,
            startDate,
            1
        );
        
        address landAddress = tokenizer.getPropertyInfo(1).landContract;
        landContract = Land(landAddress);
        
        usdt.mint(seller, 1000000e6);
        usdt.mint(buyer, 1000000e6);
    }

    function test_ApprovalRevokedAfterListing() public {
        console.log("\n=== TESTING: Approval revoked after listing ===");
        
        // Seller mints NFT
        vm.startPrank(seller);
        uint256 nftPrice = PROPERTY_VALUE / TOTAL_SUPPLY;
        usdt.approve(address(landContract), nftPrice);
        landContract.mint(seller);
        
        // Seller lists NFT
        landContract.approve(address(marketplace), 1);
        marketplace.listNFT(address(landContract), 1, address(usdt), LISTING_PRICE);
        
        // Seller revokes approval after listing
        landContract.approve(address(0), 1); // Revoke specific approval
        
        vm.stopPrank();
        
        // Buyer tries to purchase - should fail with clear error
        vm.startPrank(buyer);
        usdt.approve(address(marketplace), LISTING_PRICE);
        
        vm.expectRevert("Marketplace no longer approved to transfer NFT");
        marketplace.purchaseNFT(1);
        
        vm.stopPrank();
        
        console.log("SUCCESS: Purchase correctly failed when approval was revoked");
        
        // Re-approve and purchase should work
        vm.prank(seller);
        landContract.approve(address(marketplace), 1);
        
        vm.startPrank(buyer);
        marketplace.purchaseNFT(1);
        vm.stopPrank();
        
        // Verify purchase succeeded
        assertEq(landContract.ownerOf(1), buyer);
        console.log("SUCCESS: Purchase worked after re-approval");
    }
    
    function test_ApprovedForAllStillWorks() public {
        console.log("\n=== TESTING: ApprovedForAll still works ===");
        
        // Seller mints NFT
        vm.startPrank(seller);
        uint256 nftPrice = PROPERTY_VALUE / TOTAL_SUPPLY;
        usdt.approve(address(landContract), nftPrice);
        landContract.mint(seller);
        
        // Use setApprovalForAll instead of approve
        landContract.setApprovalForAll(address(marketplace), true);
        marketplace.listNFT(address(landContract), 1, address(usdt), LISTING_PRICE);
        
        vm.stopPrank();
        
        // Buyer purchases - should work
        vm.startPrank(buyer);
        usdt.approve(address(marketplace), LISTING_PRICE);
        marketplace.purchaseNFT(1);
        vm.stopPrank();
        
        // Verify purchase succeeded
        assertEq(landContract.ownerOf(1), buyer);
        console.log("SUCCESS: ApprovedForAll works correctly");
    }

    function test_NFTTransferredDirectly() public {
        console.log("\n=== TESTING: NFT transferred directly (not through marketplace) ===");
        
        // Seller mints NFT
        vm.startPrank(seller);
        uint256 nftPrice = PROPERTY_VALUE / TOTAL_SUPPLY;
        usdt.approve(address(landContract), nftPrice);
        landContract.mint(seller);
        
        // Seller lists NFT
        landContract.approve(address(marketplace), 1);
        marketplace.listNFT(address(landContract), 1, address(usdt), LISTING_PRICE);
        
        // Seller transfers NFT directly to someone else
        landContract.transferFrom(seller, address(0x999), 1);
        
        vm.stopPrank();
        
        // Buyer tries to purchase - should fail
        vm.startPrank(buyer);
        usdt.approve(address(marketplace), LISTING_PRICE);
        
        vm.expectRevert("NFT no longer owned by seller");
        marketplace.purchaseNFT(1);
        
        vm.stopPrank();
        
        console.log("SUCCESS: Purchase correctly failed when NFT was transferred directly");
    }
    
    function test_ZeroPlatformFee() public {
        console.log("\n=== TESTING: Zero platform fee edge case ===");
        
        // Set platform fee to 0
        marketplace.setPlatformFee(0);
        
        // Seller mints and lists NFT
        vm.startPrank(seller);
        uint256 nftPrice = PROPERTY_VALUE / TOTAL_SUPPLY;
        usdt.approve(address(landContract), nftPrice);
        landContract.mint(seller);
        
        landContract.approve(address(marketplace), 1);
        marketplace.listNFT(address(landContract), 1, address(usdt), LISTING_PRICE);
        
        vm.stopPrank();
        
        // Record balances
        uint256 sellerBalanceBefore = usdt.balanceOf(seller);
        uint256 feeRecipientBalanceBefore = usdt.balanceOf(feeRecipient);
        
        // Buyer purchases
        vm.startPrank(buyer);
        usdt.approve(address(marketplace), LISTING_PRICE);
        marketplace.purchaseNFT(1);
        vm.stopPrank();
        
        // Verify seller got full amount, fee recipient got nothing
        assertEq(usdt.balanceOf(seller), sellerBalanceBefore + LISTING_PRICE);
        assertEq(usdt.balanceOf(feeRecipient), feeRecipientBalanceBefore);
        
        console.log("SUCCESS: Zero platform fee works correctly");
    }
}
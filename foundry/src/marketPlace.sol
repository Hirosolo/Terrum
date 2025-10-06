// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Simple NFT Marketplace
 * @dev A straightforward marketplace for listing and purchasing Land NFTs
 */
contract Marketplace is Ownable, ReentrancyGuard, Pausable {

    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// STATES ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    struct Listing {
        address seller;         // Who is selling the NFT
        address nftContract;    // Address of the NFT contract
        uint256 tokenId;        // Token ID being sold
        address paymentToken;   // Payment token (USDT)
        uint256 price;          // Listing price
        bool active;            // Whether listing is active
        uint256 listedAt;       // When it was listed
    }

    // Mapping from listing ID to listing details
    mapping(uint256 => Listing) public listings;
    
    // Counter for listing IDs
    uint256 public listingCounter;
    
    // Platform fee percentage (basis points: 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant MAX_FEE = 1000; // 10% max
    
    // Fee recipient
    address public feeRecipient;

    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// EVENTS ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        address paymentToken,
        uint256 price
    );

    event NFTPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFeeAmount
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////// MODIFIERS ///////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    modifier validListing(uint256 listingId) {
        require(listingId > 0 && listingId <= listingCounter, "Invalid listing ID");
        require(listings[listingId].active, "Listing not active");
        _;
    }

    modifier onlySeller(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "Not the seller");
        _;
    }

    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    ////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// MAIN FUNCTIONS ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev List an NFT for sale
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to sell
     * @param paymentToken Payment token address (USDT)
     * @param price Listing price
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        address paymentToken,
        uint256 price
    ) external nonReentrant whenNotPaused {
        require(nftContract != address(0), "Invalid NFT contract");
        require(paymentToken != address(0), "Invalid payment token");
        require(price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved to transfer NFT"
        );

        listingCounter++;
        
        listings[listingCounter] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            paymentToken: paymentToken,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        emit NFTListed(
            listingCounter,
            msg.sender,
            nftContract,
            tokenId,
            paymentToken,
            price
        );
    }

    /**
     * @dev Purchase a listed NFT
     * @param listingId ID of the listing to purchase
     */
    function purchaseNFT(uint256 listingId) 
        external 
        nonReentrant 
        whenNotPaused 
        validListing(listingId) 
    {
        Listing storage listing = listings[listingId];
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        IERC721 nft = IERC721(listing.nftContract);
        require(nft.ownerOf(listing.tokenId) == listing.seller, "NFT no longer owned by seller");
        
        // Re-check approval before purchase (seller might have revoked approval)
        require(
            nft.isApprovedForAll(listing.seller, address(this)) || 
            nft.getApproved(listing.tokenId) == address(this),
            "Marketplace no longer approved to transfer NFT"
        );

        IERC20 paymentToken = IERC20(listing.paymentToken);
        
        // Calculate platform fee
        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - platformFeeAmount;

        // Transfer payment from buyer
        require(
            paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount),
            "Payment to seller failed"
        );

        if (platformFeeAmount > 0) {
            require(
                paymentToken.transferFrom(msg.sender, feeRecipient, platformFeeAmount),
                "Platform fee payment failed"
            );
        }

        // Transfer NFT to buyer
        nft.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // Mark listing as inactive
        listing.active = false;

        emit NFTPurchased(
            listingId,
            msg.sender,
            listing.seller,
            listing.price,
            platformFeeAmount
        );
    }

    /**
     * @dev Cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) 
        external 
        nonReentrant 
        validListing(listingId) 
        onlySeller(listingId) 
    {
        listings[listingId].active = false;
        
        emit ListingCancelled(listingId, msg.sender);
    }

    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// VIEW FUNCTIONS /////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Get listing details
     * @param listingId ID of the listing
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        require(listingId > 0 && listingId <= listingCounter, "Invalid listing ID");
        return listings[listingId];
    }

    /**
     * @dev Get all active listings (expensive, use with caution)
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].active) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }

    /**
     * @dev Get listings by seller
     * @param seller Address of the seller
     */
    function getListingsBySeller(address seller) external view returns (uint256[] memory) {
        uint256 sellerListingCount = 0;
        
        // Count seller's listings
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].seller == seller && listings[i].active) {
                sellerListingCount++;
            }
        }
        
        // Create array of seller's listing IDs
        uint256[] memory sellerListings = new uint256[](sellerListingCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].seller == seller && listings[i].active) {
                sellerListings[index] = i;
                index++;
            }
        }
        
        return sellerListings;
    }

    /**
     * @dev Check if an NFT is listed
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     */
    function isNFTListed(address nftContract, uint256 tokenId) external view returns (bool, uint256) {
        for (uint256 i = 1; i <= listingCounter; i++) {
            Listing memory listing = listings[i];
            if (
                listing.active &&
                listing.nftContract == nftContract &&
                listing.tokenId == tokenId
            ) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    ////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// ADMIN FUNCTIONS ///////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points (100 = 1%)
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update fee recipient (only owner)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid fee recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Pause the marketplace (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the marketplace (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to cancel any listing (only owner)
     * @param listingId ID of the listing to cancel
     */
    function emergencyCancelListing(uint256 listingId) external onlyOwner {
        require(listingId > 0 && listingId <= listingCounter, "Invalid listing ID");
        require(listings[listingId].active, "Listing not active");
        
        listings[listingId].active = false;
        emit ListingCancelled(listingId, listings[listingId].seller);
    }
}
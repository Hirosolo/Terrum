"use client";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import MarketplaceHeader from "@/app/components/investment/header";
import SearchBar from "../components/investment/searchBar";
import FilterSidebar from "../components/investment/filterSidebar";
import DashBoardPropertyCard from "../components/dashBoard/dashBoardPropertyCard";
import { useActiveListings } from "../components/dashBoard/useMarketplaceListings";
import { usePurchaseNFT, useApproveUSDT, useCancelListing } from "../components/dashBoard/useMarketplaceHooks";
import { formatUSDT, parseUSDT, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { PropertyData } from "@/lib/hooks";
import { useAccount } from "wagmi";
import { Toast, useToast } from "@/components/Toast";

// Mock data (replace with API later)
const properties = [
  {
    id: 1,
    city: "Ho Chi Minh",
    name: "Saigon Pearl Residence",
    totalValue: 150000, // $150k property value
    totalShares: 1250, // Makes each NFT worth $120
    availableShares: 500,
    status: "Active",
    type: "Residential",
    image: "/image-property.png",
    listed: "false",
    apy: 5.2,
  },
  {
    id: 2,
    city: "Ho Chi Minh",
    name: "Empire City Tower",
    totalValue: 180000, // $180k property value
    totalShares: 1500, // Makes each NFT worth $120
    availableShares: 300,
    status: "Active",
    type: "Commercial",
    image: "/image-property.png",
    listed: "true",
    apy: 6.8,
  },
];

// Map mock to PropertyData for card
function toPropertyData(p: (typeof properties)[number]): PropertyData {
  const usdt = (amount: number) => BigInt(Math.round(amount * 1e18)); // Convert to USDT (18 decimals to match utils)
  const soldShares = p.totalShares - p.availableShares;
  const sharePrice = p.totalValue / p.totalShares; // $120 per NFT
  const soldPercentage = (soldShares / p.totalShares) * 100;
  const availabilityPercentage = (p.availableShares / p.totalShares) * 100;

  return {
    id: p.id,
    contractAddress: "0x0000000000000000000000000000000000000000",
    propertyOwner: "0x0000000000000000000000000000000000000000",
    propertyName: p.name,
    propertySymbol: p.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
    totalValue: usdt(p.totalValue).toString(),
    totalShares: BigInt(p.totalShares).toString(),
    availableShares: BigInt(p.availableShares).toString(),
    remainingShares: BigInt(p.availableShares).toString(),
    soldShares: BigInt(soldShares).toString(),
    yieldPerBlock: BigInt(0).toString(),
    yieldReserve: BigInt(0).toString(),
    propertyType:
      p.type === "Residential" ? BigInt(1).toString() : BigInt(2).toString(),
    propertyTypeName: p.type,
    isActive: p.status !== "Expired",
    createdAt: BigInt(Date.now()).toString(),
    sharePrice: usdt(sharePrice).toString(),
    soldPercentage: Math.round(soldPercentage),
    availabilityPercentage: Math.round(availabilityPercentage),
    apy: p.apy,
  };
}

export default function Marketplace() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedForListing, setSelectedForListing] = useState<
    Record<number, boolean>
  >({});

  // Get marketplace data
  const { data: activeListings, isLoading } = useActiveListings();
  const { purchaseNFT, isPurchasing } = usePurchaseNFT();
  const { approveUSDT, isApproving } = useApproveUSDT();
  const { cancelListing, isCancelling } = useCancelListing();
  const { address } = useAccount();
  const { toast, showToast, hideToast } = useToast();

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  // Convert marketplace listings to PropertyData format for display
  const convertListingToPropertyData = (listing: any): PropertyData => {
    return {
      id: listing.listingId,
      contractAddress: listing.nftContract,
      propertyOwner: listing.seller,
      propertyName: `Property NFT #${listing.tokenId}`,
      propertySymbol: `NFT${listing.tokenId}`,
      totalValue: listing.price, // price is already a string
      totalShares: "1",
      availableShares: "1", 
      remainingShares: "1",
      soldShares: "0",
      yieldPerBlock: "0",
      yieldReserve: "0",
      propertyType: "1",
      propertyTypeName: "NFT",
      isActive: listing.active,
      createdAt: listing.listedAt.toString(),
      sharePrice: listing.price, // price is already a string
      soldPercentage: 0,
      availabilityPercentage: 100,
      apy: 5.0,
    };
  };

  const handlePurchase = async (listingId: number, priceString: string) => {
    if (!address) {
      showToast("Please connect your wallet", "warning");
      return;
    }

    try {
      // Convert price string to BigInt
      const price = BigInt(priceString);
      
      // First approve USDT if needed
      // In production, you'd check current allowance first
      await approveUSDT(price);
      
      // Then purchase the NFT
      await purchaseNFT(listingId);
      
      showToast("NFT purchased successfully! 🎉", "success");
    } catch (error) {
      console.error("Failed to purchase NFT:", error);
      showToast("Failed to purchase NFT. Please check your USDT balance and try again.", "error");
    }
  };

  const handleCancelListing = async (listingId: number, propertyName: string) => {
    if (!address) {
      showToast("Please connect your wallet", "warning");
      return;
    }

    try {
      await cancelListing(listingId);
      showToast(`Successfully cancelled listing for ${propertyName}! ✅`, "success");
    } catch (error) {
      console.error("Failed to cancel listing:", error);
      showToast("Failed to cancel listing. Please try again.", "error");
    }
  };

  // Show only real marketplace listings (no mock data)
  const allProperties = [
    ...(activeListings || []).map((listing: any) => ({ 
      ...convertListingToPropertyData(listing), 
      isListing: true,
      listing 
    }))
  ];

  return (
    <LayoutGroup>
      <div>
        <MarketplaceHeader />

        {/* Hero section */}
        <section className="bg-[url('/image-marketplaceBackground.png')] bg-cover bg-center text-white py-30">
          <div className="max-w-4xl mx-auto text-center px-4 rounded-2xl p-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              Invest in Tokenized Real Estate
            </h1>
            <p className="mt-4 text-sm md:text-base font-medium">
              Invest in fractional ownership of premium real estate globally
              with full transparency on blockchain
            </p>
          </div>
        </section>

        {/* search + filter */}
        <SearchBar onFilterToggle={toggleFilter} isFilterOpen={isFilterOpen} />

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 px-4">
          {isLoading && (
            <div className="col-span-full text-center py-8">
              <p>Loading marketplace listings...</p>
            </div>
          )}
          
          {allProperties.map((property: any) => {
            const isRealListing = property.isListing;
            const listingData = property.listing;
            
            // Check if this NFT was listed by the current user
            const isOwnListing = address && listingData && 
              listingData.seller.toLowerCase() === address.toLowerCase();
            
            return (
              <motion.div
                key={`marketplace-${property.id}`}
                layoutId={`marketplace-property-${property.id}`}
                onClick={() => setSelectedId(property.id)}
              >
                <DashBoardPropertyCard
                  property={property}
                  propertyName={isRealListing ? 
                    `${property.propertyName} (Listed)` : 
                    property.propertyName
                  }
                  isListed={true}
                  buyPrice={property.sharePrice}
                  statusOverride="Active"
                  selected={!!selectedForListing[property.id]}
                  onToggleSelect={(id) => {
                    setSelectedForListing((prev) => ({
                      ...prev,
                      [Number(id)]: !prev[Number(id)],
                    }));
                  }}
                  // Show different actions based on ownership
                  onBuy={!isOwnListing ? () => {
                    if (isRealListing && listingData) {
                      handlePurchase(listingData.listingId, listingData.price);
                    } else {
                      console.log("buy mock property", property.id);
                    }
                  } : undefined}
                  onCancelListing={isOwnListing ? () => {
                    if (listingData) {
                      handleCancelListing(listingData.listingId, property.propertyName);
                    }
                  } : undefined}
                  onRedeem={() => console.log("redeem", property.id)}
                />
              </motion.div>
            );
          })}
          
          {!isLoading && allProperties.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p>No properties available for purchase at the moment.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </LayoutGroup>
  );
}

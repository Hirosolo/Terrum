"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { PROPERTY_ADDRESSES } from "@/lib/contracts";
import PropertyNFTs from "./PropertyNFTs";
import ListingModal from "./ListingModal";
import { useListNFT, useApproveNFT, useNFTApproval, useCancelListing } from "./useMarketplaceHooks";
import { FiSearch } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import { Toast, useToast } from "@/components/Toast";

export default function MyPositionSection() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedForListing, setSelectedForListing] = useState<
    Record<string, boolean>
  >({});
  
  // Listing modal state
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listingNFT, setListingNFT] = useState<{
    nftContract: string;
    tokenId: number;
    name: string;
    currentPrice: string; // Changed from bigint to string
  } | null>(null);

    // Get connected wallet address
  const { address: userAddress } = useAccount();
  const { toast, showToast, hideToast } = useToast();
  
  // Initialize marketplace hooks
  const queryClient = useQueryClient();
  const { listNFT, isListing, isSuccess: isListingSuccess } = useListNFT();
  const { approveNFT, isApproving } = useApproveNFT();
  const { cancelListing, isCancelling, isSuccess: isCancelSuccess } = useCancelListing();

    // Invalidate queries when listing is successful
  useEffect(() => {
    if (isListingSuccess) {
      queryClient.invalidateQueries({ queryKey: ["activeListings"] });
      queryClient.invalidateQueries({ queryKey: ["userNFTListings"] });
      queryClient.invalidateQueries({ queryKey: ["listingCounter"] });
    }
  }, [isListingSuccess, queryClient]);

  // Invalidate queries when cancel listing is successful
  useEffect(() => {
    if (isCancelSuccess) {
      queryClient.invalidateQueries({ queryKey: ["activeListings"] });
      queryClient.invalidateQueries({ queryKey: ["userNFTListings"] });
      queryClient.invalidateQueries({ queryKey: ["listingCounter"] });
    }
  }, [isCancelSuccess, queryClient]);

  // Handle listing NFT
  const handleListForSale = (nftContract: string, tokenId: number, name: string, currentPrice: bigint) => {
    setListingNFT({ nftContract, tokenId, name, currentPrice: currentPrice.toString() });
    setIsListingModalOpen(true);
  };

  const handleConfirmListing = async (priceUSDT: string) => {
    if (!listingNFT) return;
    
    try {
      // Step 1: First approve the NFT for marketplace (if not already approved)
      console.log("Approving NFT for marketplace...");
      await approveNFT(listingNFT.nftContract, listingNFT.tokenId);
      
      // Wait a bit for the approval transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 2: Then list the NFT
      console.log("Listing NFT on marketplace...");
      await listNFT(listingNFT.nftContract, listingNFT.tokenId, priceUSDT);
      
      // Success will be handled by the useEffect hook when isListingSuccess becomes true
      // This avoids the need for window.location.reload()
      
    } catch (error) {
      console.error("Failed to list NFT:", error);
      showToast("Failed to list NFT. The process requires two transactions: 1) Approve NFT for marketplace, 2) List NFT. Please try again.", "error");
    }
  };

    const handleCancelListing = async (nftContract: string, listingId: number, name: string) => {
    try {
      await cancelListing(listingId);
      showToast(`Successfully cancelled listing for ${name}! ✅`, "success");
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["activeListings"] });
      queryClient.invalidateQueries({ queryKey: ["userNFTListings"] });
      queryClient.invalidateQueries({ queryKey: ["listingCounter"] });
      
    } catch (error) {
      console.error("Failed to cancel listing:", error);
      showToast("Failed to cancel listing. Please try again.", "error");
    }
  };

  // If wallet not connected, show connect message
  if (!userAddress) {
    return (
      <section className="bg-green p-6 md:p-8 min-h-screen">
        <h1 className="text-white text-2xl md:text-[28px] font-extrabold tracking-wide mb-6">
          MY POSITION
        </h1>
        <div className="bg-white rounded-[12px] p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-500">
            Connect your wallet to view your NFT portfolio
          </p>
        </div>
      </section>
    );
  }

  return (
    <LayoutGroup>
      <section className="bg-green p-6 md:p-8 min-h-screen">
        {/* Title */}
        <h1 className="text-white text-2xl md:text-[28px] font-extrabold tracking-wide mb-6">
          MY POSITION
        </h1>

        {/* Filter + Search row */}
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 mb-6">
          <button className="h-[48px] w-full md:w-[280px] bg-white text-left px-4 rounded-[10px] border border-transparent hover:border-white/80 text-sm font-medium text-green">
            Show filters
          </button>

          {/* Search box */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search your properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[48px] pl-12 pr-4 rounded-[10px] border border-gray-200 focus:border-white focus:ring-2 focus:ring-white/20 text-sm"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select className="h-[48px] w-full md:w-[180px] bg-white text-left px-4 pr-8 rounded-[10px] border border-transparent hover:border-white/80 text-sm font-medium text-green appearance-none cursor-pointer">
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="value-asc">Value Low-High</option>
              <option value="value-desc">Value High-Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
          </div>
        </div>

        {/* Cards Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {PROPERTY_ADDRESSES.map((propertyAddress) => (
            <PropertyNFTs
              key={propertyAddress}
              propertyAddress={propertyAddress}
              userAddress={userAddress}
              selectedForListing={selectedForListing}
              onToggleSelect={(id: string) => {
                setSelectedForListing((prev) => ({
                  ...prev,
                  [id]: !prev[id],
                }));
              }}
              onSelect={(id: string) => setSelectedId(id)}
              onListForSale={handleListForSale}
              onCancelListing={handleCancelListing}
            />
          ))}
        </motion.div>

        {/* Listing Modal */}
        {listingNFT && (
          <ListingModal
            isOpen={isListingModalOpen}
            onClose={() => {
              setIsListingModalOpen(false);
              setListingNFT(null);
            }}
            onConfirm={handleConfirmListing}
            nftName={listingNFT.name}
            currentPrice={listingNFT.currentPrice}
            isListing={isListing}
          />
        )}
      </section>
      
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

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useActiveListings, type MarketplaceListing } from "./useMarketplaceListings";

// Hook to get listings for the current user's NFTs
export function useUserNFTListingStatus() {
  const { address } = useAccount();
  const { data: activeListings } = useActiveListings();
  
  return useQuery({
    queryKey: ["userNFTListings", address, activeListings?.length],
    queryFn: () => {
      if (!address || !activeListings) return {};
      
      // Create a map of nftContract:tokenId -> listingId for user's listed NFTs
      const userListings: Record<string, { listingId: number; price: string }> = {};
      
      activeListings
        .filter((listing: MarketplaceListing) => listing.seller.toLowerCase() === address.toLowerCase())
        .forEach((listing: MarketplaceListing) => {
          const key = `${listing.nftContract}:${listing.tokenId}`;
          userListings[key] = {
            listingId: listing.listingId,
            price: listing.price,
          };
        });
      
      return userListings;
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Helper function to check if a specific NFT is listed
export function useIsNFTListed(nftContract: string, tokenId: number) {
  const { data: userListings } = useUserNFTListingStatus();
  
  const key = `${nftContract}:${tokenId}`;
  const listingInfo = userListings?.[key];
  
  return {
    isListed: !!listingInfo,
    listingId: listingInfo?.listingId,
    listingPrice: listingInfo?.price ? BigInt(listingInfo.price) : undefined,
  };
}
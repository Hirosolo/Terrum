"use client";

import { useReadContract } from "wagmi";
import { MarketplaceABI } from "@/lib/abis";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { useQuery } from "@tanstack/react-query";

export interface MarketplaceListing {
  listingId: number;
  seller: string;
  nftContract: string;
  tokenId: number;
  paymentToken: string;
  price: string; // Changed from bigint to string to avoid serialization issues
  active: boolean;
  listedAt: number;
}

// Hook to get total listing count
export function useListingCounter() {
  const { data: counter } = useReadContract({
    abi: MarketplaceABI,
    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
    functionName: "listingCounter",
  });

  // Convert BigInt to number to avoid serialization issues
  return { listingCounter: counter ? Number(counter) : 0 };
}

// Hook to get a specific listing
export function useListing(listingId: number) {
  const { data, isLoading, error } = useReadContract({
    abi: MarketplaceABI,
    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
    functionName: "getListing",
    args: [BigInt(listingId)],
    query: {
      enabled: listingId > 0,
    },
  });

  // Type the marketplace listing as a tuple based on contract return
  const listing = data as [string, string, bigint, string, bigint, boolean] | undefined;
  
  if (!listing) return { listing: null, isLoading, error };

  // Destructure the tuple
  const [seller, nftContract, tokenId, paymentToken, price, active] = listing;

  return {
    listing: {
      listingId,
      seller,
      nftContract,
      tokenId: Number(tokenId),
      paymentToken,
      price: price.toString(), // Convert BigInt to string
      active,
      listedAt: Date.now(), // Use current timestamp as placeholder
    } as MarketplaceListing,
    isLoading,
    error,
  };
}

// Hook to get all active listings
export function useActiveListings() {
  const { listingCounter } = useListingCounter();
  
  return useQuery({
    queryKey: ["activeListings", listingCounter],
    queryFn: async () => {
      if (listingCounter === 0) return [];
      
      const listings: MarketplaceListing[] = [];
      
      // Fetch all listings and filter for active ones
      // Note: In a production app, you'd want to use events or a subgraph for better performance
      for (let i = 1; i <= listingCounter; i++) {
        try {
          const response = await fetch("/api/marketplace/listing/" + i, { 
            method: "GET",
          });
          
          if (response.ok) {
            const listing = await response.json();
            if (listing.active) {
              listings.push({
                listingId: i,
                ...listing,
                tokenId: Number(listing.tokenId),
                price: listing.price, // Keep as string to avoid BigInt serialization issues
                listedAt: Number(listing.listedAt),
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch listing ${i}:`, error);
        }
      }
      
      return listings;
    },
    enabled: listingCounter > 0,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new listings quickly
  });
}

// Hook to get listings by a specific seller
export function useSellerListings(sellerAddress: string) {
  const { data: allListings } = useActiveListings();
  
  const sellerListings = allListings?.filter(
    (listing: MarketplaceListing) => listing.seller.toLowerCase() === sellerAddress.toLowerCase()
  ) || [];
  
  return { listings: sellerListings };
}
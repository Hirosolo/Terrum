"use client";

import { useRealPropertyData } from "./useRealPropertyData";
import IndividualNFTCard from "./IndividualNFTCard";

interface PropertyNFTsProps {
  propertyAddress: string;
  userAddress: string;
  selectedForListing: Record<string, boolean>;
  onToggleSelect: (id: string) => void;
  onSelect: (id: string) => void;
  onListForSale: (nftContract: string, tokenId: number, name: string, currentPrice: bigint) => void;
  onCancelListing: (nftContract: string, tokenId: number, name: string) => void;
}

export default function PropertyNFTs({
  propertyAddress,
  userAddress,
  selectedForListing,
  onToggleSelect,
  onSelect,
  onListForSale,
  onCancelListing,
}: PropertyNFTsProps) {
  const { data: propertyData } = useRealPropertyData({
    propertyAddress,
    userAddress,
  });

  // Don't render if user doesn't own any NFTs for this property
  if (!propertyData || propertyData.amount === 0) {
    return null;
  }

  // Create array for the number of NFTs the user owns
  const nftCards = Array.from({ length: propertyData.amount }, (_, index) => (
    <IndividualNFTCard
      key={`${propertyAddress}-${index}`}
      propertyAddress={propertyAddress}
      userAddress={userAddress}
      tokenIndex={index}
      selectedForListing={selectedForListing}
      onToggleSelect={onToggleSelect}
      onSelect={onSelect}
      onListForSale={onListForSale}
      onCancelListing={onCancelListing}
    />
  ));

  return <>{nftCards}</>;
}

"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUSDT, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { MarketplaceABI, LandABI, MockUSDTABI } from "@/lib/abis";

export function useListNFT() {
  const [isListing, setIsListing] = useState(false);
  
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listNFT = async (
    nftContract: string,
    tokenId: number,
    priceUSDT: string
  ) => {
    setIsListing(true);
    try {
      const priceWei = parseUSDT(priceUSDT);
      
      await writeContract({
        abi: MarketplaceABI,
        address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
        functionName: "listNFT",
        args: [
          nftContract as `0x${string}`,
          BigInt(tokenId),
          CONTRACT_ADDRESSES.USDT as `0x${string}`,
          priceWei,
        ],
      });
    } catch (err) {
      console.error("Failed to list NFT:", err);
      setIsListing(false);
      throw err;
    }
  };

  // Reset loading state when transaction completes
  if (!isConfirming && isListing && hash) {
    setIsListing(false);
  }

  return {
    listNFT,
    isListing: isListing || isConfirming,
    isSuccess: isSuccess && !isConfirming,
    error,
    hash,
  };
}

export function useCancelListing() {
  const [isCancelling, setIsCancelling] = useState(false);
  
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelListing = async (listingId: number) => {
    setIsCancelling(true);
    try {
      await writeContract({
        abi: MarketplaceABI,
        address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
        functionName: "cancelListing",
        args: [BigInt(listingId)],
      });
    } catch (err) {
      console.error("Failed to cancel listing:", err);
      setIsCancelling(false);
      throw err;
    }
  };

  // Reset loading state when transaction completes
  if (!isConfirming && isCancelling && hash) {
    setIsCancelling(false);
  }

  return {
    cancelListing,
    isCancelling: isCancelling || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function usePurchaseNFT() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const purchaseNFT = async (listingId: number) => {
    setIsPurchasing(true);
    try {
      await writeContract({
        abi: MarketplaceABI,
        address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
        functionName: "purchaseNFT",
        args: [BigInt(listingId)],
      });
    } catch (err) {
      console.error("Failed to purchase NFT:", err);
      setIsPurchasing(false);
      throw err;
    }
  };

  // Reset loading state when transaction completes
  if (!isConfirming && isPurchasing && hash) {
    setIsPurchasing(false);
  }

  return {
    purchaseNFT,
    isPurchasing: isPurchasing || isConfirming,
    error,
    hash,
  };
}

export function useApproveNFT() {
  const [isApproving, setIsApproving] = useState(false);
  
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const approveNFT = async (nftContract: string, tokenId: number) => {
    setIsApproving(true);
    try {
      await writeContract({
        abi: LandABI,
        address: nftContract as `0x${string}`,
        functionName: "approve",
        args: [
          CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
          BigInt(tokenId),
        ],
      });
    } catch (err) {
      console.error("Failed to approve NFT:", err);
      setIsApproving(false);
      throw err;
    }
  };

  // Reset loading state when transaction completes
  if (!isConfirming && isApproving && hash) {
    setIsApproving(false);
  }

  return {
    approveNFT,
    isApproving: isApproving || isConfirming,
    error,
    hash,
  };
}

export function useApproveUSDT() {
  const [isApproving, setIsApproving] = useState(false);
  
  const { writeContract, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const approveUSDT = async (amount: bigint) => {
    setIsApproving(true);
    try {
      await writeContract({
        abi: MockUSDTABI,
        address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
        functionName: "approve",
        args: [
          CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
          amount,
        ],
      });
    } catch (err) {
      console.error("Failed to approve USDT:", err);
      setIsApproving(false);
      throw err;
    }
  };

  // Reset loading state when transaction completes
  if (!isConfirming && isApproving && hash) {
    setIsApproving(false);
  }

  return {
    approveUSDT,
    isApproving: isApproving || isConfirming,
    error,
    hash,
  };
}

// Hook to check if NFT is approved for marketplace
export function useNFTApproval(nftContract: string, tokenId: number) {
  const { data: approvedAddress } = useReadContract({
    abi: LandABI,
    address: nftContract as `0x${string}`,
    functionName: "getApproved",
    args: [BigInt(tokenId)],
  });

  const isApproved = approvedAddress === CONTRACT_ADDRESSES.MARKETPLACE;
  
  return { isApproved, approvedAddress };
}
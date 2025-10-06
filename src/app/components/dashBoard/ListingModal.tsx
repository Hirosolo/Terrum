"use client";

import { useState } from "react";
import { parseUSDT, formatUSDT } from "@/lib/contracts";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (priceUSDT: string) => Promise<void>;
  nftName: string;
  currentPrice: string; // Changed from bigint to string
  isListing: boolean;
}

export default function ListingModal({
  isOpen,
  onClose,
  onConfirm,
  nftName,
  currentPrice,
  isListing,
}: ListingModalProps) {
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(price);
      onClose();
      setPrice("");
    } catch (error) {
      console.error("Failed to list NFT:", error);
      // Error is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedPrice = formatUSDT(BigInt(currentPrice)).replace('$', '').replace(',', '');

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          List NFT for Sale
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">NFT: <span className="font-semibold">{nftName}</span></p>
          <p className="text-gray-600 mb-4">
            Current value: <span className="font-semibold">{formatUSDT(BigInt(currentPrice))}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Listing Price (USDT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={suggestedPrice}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-black"
                disabled={isSubmitting}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggested: ${suggestedPrice} (current market value)
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Two transactions required:</strong>
              <br />1. Approve marketplace to transfer your NFT
              <br />2. List NFT for sale
              <br />
              <br />A 2.5% platform fee will be deducted from the sale.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setError("");
                setPrice("");
              }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Listing..." : "List NFT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
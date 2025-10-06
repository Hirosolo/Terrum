"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useAccount } from "wagmi";
import {
  usePropertyBalance,
  usePropertyName,
  useGetTokenStats,
} from "@/lib/hooks";
import { PROPERTY_ADDRESSES, getPropertyMetadata } from "@/lib/contracts";
import { FiSearch } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

// Component for individual NFT holding
function NFTHolding({
  propertyAddress,
  userAddress,
}: {
  propertyAddress: string;
  userAddress: string;
}) {
  const { data: balance } = usePropertyBalance(propertyAddress, userAddress);
  const { data: propertyName } = usePropertyName(propertyAddress);
  const { data: tokenStats } = useGetTokenStats(propertyAddress);
  
  // Get property metadata for diverse display
  const metadata = getPropertyMetadata(propertyAddress);

  // Don't render if user has no NFTs for this property
  if (!balance || Number(balance) === 0) {
    return null;
  }

  const nftBalance = Number(balance);
  const displayName =
    (propertyName as string) ||
    `Property ${propertyAddress.slice(0, 6)}...${propertyAddress.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Image
              src={metadata.image}
              alt={`${metadata.name} Property`}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {metadata.name}
            </h3>
            <p className="text-sm text-gray-500">
              {metadata.location}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{nftBalance}</div>
          <div className="text-sm text-gray-500">NFTs Owned</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Active</div>
          <div className="text-sm text-green-600">Status</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Not Listed</div>
          <div className="text-sm text-gray-500">Market Status</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {tokenStats && Array.isArray(tokenStats) && tokenStats.length > 1
              ? Number(tokenStats[1])
              : "N/A"}
          </div>
          <div className="text-sm text-gray-500">Total Supply</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function UserNFTPortfolio() {
  const [search, setSearch] = useState("");
  const { address: userAddress } = useAccount();

  if (!userAddress) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-500">
          Connect your wallet to view your NFT portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Positions</h2>
          <p className="text-gray-500">
            Your NFT holdings across all properties
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* NFT Holdings */}
      <LayoutGroup>
        <div className="grid gap-4">
          {PROPERTY_ADDRESSES.map((propertyAddress) => (
            <NFTHolding
              key={propertyAddress}
              propertyAddress={propertyAddress}
              userAddress={userAddress}
            />
          ))}
        </div>
      </LayoutGroup>

      {/* Empty State - if no NFTs found */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No NFTs Found
        </h3>
        <p className="text-gray-500 mb-4">
          You don&apos;t own any property NFTs yet. Visit the marketplace to
          start investing.
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Explore Marketplace
        </button>
      </div>
    </div>
  );
}

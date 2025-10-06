"use client";
import Image from "next/image";
import { useState } from "react";
import { useGetAllProperties, usePurchaseShares } from "@/lib/hooks";
import { useAccount } from "wagmi";
import type { PropertyData } from "@/lib/hooks";
import { formatUSDTSafe, toBigInt } from "@/lib/utils";
import { getPropertyMetadata } from "@/lib/contracts";

type PropertyInfoContentProps = {
  propertyId: number | string;
  propertyData?: PropertyData;
};

export default function PropertyInfoContent({
  propertyId,
  propertyData,
}: PropertyInfoContentProps) {
  const { data: properties, isLoading } = useGetAllProperties();
  const [shareAmount, setShareAmount] = useState(1);
  const {
    investInProperty: purchaseShares,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = usePurchaseShares();
  const { address } = useAccount();

  // Prefer passed-in property data from the clicked card; fallback to hook data
  const property = propertyData ?? properties?.find((p) => p.id === propertyId);

  // Get property metadata for diverse display
  const metadata = property ? getPropertyMetadata(property.contractAddress) : null;

  if ((isLoading && !propertyData) || !property) {
    return (
      <div className=" bg-beige-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Calculate values using your formula
  const totalValue = toBigInt(property.totalValue);
  const totalShares = toBigInt(property.totalShares);
  const availableShares = toBigInt(property.availableShares);
  const soldShares = totalShares - availableShares;

  // Project raised calculation: (totalValue / totalShares) * soldShares
  const sharePrice = totalShares > 0 ? totalValue / totalShares : BigInt(0);
  const projectRaised = sharePrice * soldShares;
  const goal = totalValue;
  const progress = goal > 0 ? Number((projectRaised * BigInt(100)) / goal) : 0;

  // Investment details calculations
  const nftPrice = sharePrice;
  const rentalYield = property.apy;
  const mockAnnualReturn = 10.36; // As discussed, keep this mocked
  const mockProjectLength = "90 days"; // Mock value

  // Calculate total cost based on selected amount
  const totalCost = nftPrice * BigInt(shareAmount);

  // Handle purchase
  const handlePurchase = async () => {
    if (!address) {
      console.error("Wallet not connected");
      return;
    }
    try {
      await purchaseShares(property.contractAddress, shareAmount, address);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  return (
    <div className=" bg-beige-100 p-6 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="col-span-2 space-y-4">
          <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md">
            <Image
              src={metadata?.image || "/image-property.png"}
              alt={`${metadata?.name || property.propertyName} Property`}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(metadata?.galleryImages || ["/image-property.png", "/image-property.png", "/image-property.png"]).slice(0, 3).map((image, i) => (
              <div
                key={i}
                className="relative w-full h-28 rounded-xl overflow-hidden shadow"
              >
                <Image
                  src={image}
                  alt={`${metadata?.name || property.propertyName} Gallery ${i + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ))}
          </div>

          {/* Property Details */}
          <div className="bg-beigi-100 rounded-2xl shadow p-4 space-y-4 text-moss-600">
            <h2 className="text-xl font-semibold">Properties Details</h2>
            <p className="flex items-center space-x-2 text-moss-600">
              <span>📍</span>
              <span>Ho Chi Minh</span>
            </p>
            <div className="flex space-x-3">
              <span className="px-3 py-1 bg-moss-600 rounded-full text-sm font-medium text-beige-100">
                {property.propertyTypeName}
              </span>
              <span className="px-3 py-1 bg-moss-600 rounded-full text-sm font-medium text-beige-100">
                3 Bedrooms
              </span>
              <span className="px-3 py-1 bg-moss-600 rounded-full text-sm font-medium text-beige-100">
                2 Bathrooms
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Property #{property.id} - A premium real estate investment
              opportunity featuring modern amenities and excellent location.
              This property offers fractional ownership through blockchain
              technology, providing transparent and secure investment
              opportunities with competitive rental yields. The property is
              strategically located in Ho Chi Minh City, one of the
              fastest-growing markets in Southeast Asia, offering significant
              potential for both rental income and capital appreciation.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-1 space-y-6">
          {/* Top Offer Section */}
          <div className="bg-moss-500 p-4 rounded-2xl shadow">
            <div className="grid grid-cols-3 text-center text-beige-100">
              <div>
                <p className="text-sm font-medium">Top offer</p>
                <p className="text-lg font-bold">-</p>
              </div>
              <div>
                <p className="text-sm font-medium">Collection floor</p>
                <p className="text-lg font-bold">{formatUSDTSafe(nftPrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last sale</p>
                <p className="text-lg font-bold">-</p>
              </div>
            </div>
            <div className="flex justify-between mt-4 space-x-3">
              <button className="flex-1 bg-moss-700 hover:bg-moss-800 text-beige-100 py-2 rounded-xl font-semibold transition-colors">
                List for sale
              </button>
              <button className="flex-1 bg-beige-100 hover:bg-gray-200 text-moss-700 py-2 rounded-xl font-semibold transition-colors">
                Send
              </button>
            </div>
          </div>

          {/* Financial Returns */}
          <div className="bg-moss-500 p-6 rounded-2xl shadow space-y-4">
            <h3 className="font-semibold text-lg text-beige-100">
              Financial Returns
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-beige-100 text-base">
              <p className="font-semibold">Monthly Earned</p>
              <p className="text-right">{formatUSDTSafe(nftPrice)}</p>
              <p className="font-semibold">Annually Earned</p>
              <p className="text-right">{formatUSDTSafe(nftPrice)}</p>
              <p className="font-semibold">Start Date</p>
              <p className="text-right">TBA</p>
              <p className="font-semibold">End Date</p>
              <p className="text-right">TBA</p>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-moss-500 p-4 rounded-2xl shadow space-y-4">
            <h3 className="font-semibold text-lg text-beige-100">
              Investment Details
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700 truncate">
                  {formatUSDTSafe(totalValue)}
                </p>
                <p className="text-xs text-moss-700">Property Value</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700 ">
                  {Number(totalShares)}
                </p>
                <p className="text-xs text-moss-700">Total Supply</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700">
                  {formatUSDTSafe(nftPrice)}
                </p>
                <p className="text-xs text-moss-700">NFT Price</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700">
                  {rentalYield.toFixed(2)}%
                </p>
                <p className="text-xs text-moss-700">Rental Yield</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700">{mockAnnualReturn}%</p>
                <p className="text-xs text-moss-700">Annual Return</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700">{mockProjectLength}</p>
                <p className="text-xs text-moss-700">Project Length</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { PropertyData, useGetTokenStats } from "@/lib/hooks";
import { formatUSDTSafe, toBigInt } from "@/lib/utils";
import { getPropertyMetadata } from "@/lib/contracts";
import Image from "next/image";
import { motion } from "framer-motion";

type PropertyCardProps = {
  property: PropertyData;
  onBuy?: (property: PropertyData) => void;
};

// Function to get property type styling
const getPropertyTypeStyles = (typeName: string): string => {
  switch (typeName.toLowerCase()) {
    case "residential":
      return "bg-green-100 text-green-700";
    case "apartment":
      return "bg-blue-100 text-blue-700";
    case "co-living":
      return "bg-purple-100 text-purple-700";
    case "hospitality":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function PropertyCard({ property, onBuy }: PropertyCardProps) {
  // Get property metadata for diverse display
  const metadata = getPropertyMetadata(property.contractAddress);

  // Debug: log what property type name we're actually receiving
  console.log(
    `PropertyCard for property ${property.id}:`,
    {
      propertyTypeName: property.propertyTypeName,
      sharePrice: property.sharePrice,
      totalValue: property.totalValue,
      totalShares: property.totalShares,
      apy: property.apy
    }
  );

  // Get real-time token statistics from Land contract
  const { data: tokenStats } = useGetTokenStats(property.contractAddress);

  // Safely convert values to BigInt for calculations, using real-time data when available
  const totalValue = toBigInt(property.totalValue);
  const statsArray = tokenStats as bigint[] | undefined;
  const totalShares =
    statsArray && statsArray[2]
      ? BigInt(statsArray[2].toString())
      : toBigInt(property.totalShares); // maxSupply
  const availableShares =
    statsArray && statsArray[3]
      ? BigInt(statsArray[3].toString())
      : toBigInt(property.availableShares); // remainingToMint

  const availabilityPercentage =
    totalShares > 0 ? Number((availableShares * BigInt(100)) / totalShares) : 0;

  console.log(`Property ${property.id} stats:`, {
    tokenStats: statsArray,
    totalShares: totalShares.toString(),
    availableShares: availableShares.toString(),
    availabilityPercentage,
  });

  // Mock annual return as requested
  const mockAnnualReturn = 10.36;

  return (
    <motion.div
      className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white cursor-pointer transition-transform duration-200 hover:shadow-xl hover:scale-[1.01]"
      onClick={() => onBuy?.(property)}
      role="button"
      tabIndex={0}
      layoutId={`property-${property.id}`}
    >
      {/* Image with overlay text */}
      <div className="relative">
        <Image
          className="w-full h-60 object-cover"
          src={metadata.image}
          alt={`${metadata.name} Property`}
          width={400}
          height={240}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Location link */}
        <a
          href="https://maps.app.goo.gl/uHn6UMmqy2U7zu3S8"
          className="absolute bottom-3 left-3 flex items-center text-white text-sm font-medium drop-shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-4 h-4 mr-1 text-green-400"
          >
            <path d="M12 21c4.97-4.97 8-8.03 8-11.5A8 8 0 004 9.5C4 13 7.03 16.03 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          {metadata.location}
        </a>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-4">
        {/* Property title + type */}
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {property.propertyName}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {property.propertySymbol}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${getPropertyTypeStyles(
              property.propertyTypeName
            )}`}
          >
            {property.propertyTypeName}
          </span>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-gray-500 text-xs">Property Value</p>
            <p className="font-bold text-gray-900 text-sm">
              {formatUSDTSafe(totalValue)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">APY</p>
            <p className="font-bold text-green-600 text-sm">
              {property.apy > 0 ? property.apy.toFixed(2) : "0.00"}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Mint Price</p>
            <p className="font-bold text-gray-900 text-sm">
              {formatUSDTSafe(toBigInt(property.sharePrice))}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1 text-xs">
            <span className="text-green-600 font-medium">
              {availabilityPercentage.toFixed(1)}% Available
            </span>
            <span className="text-gray-600">
              {Number(availableShares)}/{Number(totalShares)} shares
            </span>
          </div>
        </div>

        {/* Invest button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBuy?.(property);
          }}
          className="w-full bg-green-800 hover:bg-green-800 text-white text-sm font-semibold px-4 py-3 rounded-md shadow hover:cursor-pointer"
        >
          INVEST NOW
        </button>
      </div>
    </motion.div>
  );
}

"use client";

import { PropertyData, useGetTokenStats } from "@/lib/hooks";
import { formatUSDTSafe, toBigInt } from "@/lib/utils";
import { getPropertyMetadata } from "@/lib/contracts";
import Image from "next/image";

type PropertyCardProps = {
  property: PropertyData;
  onBuy?: (property: PropertyData) => void;
};

export default function LandingPagePropertyCard({
  property,
  onBuy,
}: PropertyCardProps) {
  // Get property metadata for diverse display
  const metadata = getPropertyMetadata(property.contractAddress);

  // Get real-time token statistics from Land contract
  const { data: tokenStats } = useGetTokenStats(property.contractAddress);

  const totalValue = toBigInt(property.totalValue);

  // Use real-time data when available
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

  const mockAnnualReturn = 10.36;

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white pointer-events-none">
      {/* Image */}
      <div className="relative select-none">
        <Image
          className="w-full h-60 object-cover pointer-events-none"
          src={metadata.image}
          alt={`${metadata.name} Property`}
          width={400}
          height={240}
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Location */}
        <a
          href="https://maps.app.goo.gl/uHn6UMmqy2U7zu3S8"
          className="absolute bottom-3 left-3 flex items-center text-white text-sm font-medium drop-shadow pointer-events-auto"
          tabIndex={-1}
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

      {/* Body */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">{property.propertyName}</h3>
          <span className="text-xs bg-moss-100 text-gray-700 font-semibold px-3 py-1 rounded-full">
            {property.propertyTypeName}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-gray-500 text-xs">Property Value</p>
            <p className="font-bold text-gray-900">
              {formatUSDTSafe(totalValue)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Rental Yield</p>
            <p className="font-bold text-gray-900">
              {property.apy.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Annual Return</p>
            <p className="font-bold text-gray-900">{mockAnnualReturn}%</p>
          </div>
        </div>

        <div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1 text-xs">
            <span className="text-green font-medium">Available</span>
            <span className="text-gray-600">
              {Number(availableShares)}/{Number(totalShares)} shares
            </span>
          </div>
        </div>

        <button
          onClick={() => onBuy?.(property)}
          className="w-full bg-green-800 hover:bg-green-700 text-white text-sm font-semibold px-4 py-3 rounded-md shadow hover:cursor-pointer pointer-events-auto"
        >
          INVEST NOW
        </button>
      </div>
    </div>
  );
}

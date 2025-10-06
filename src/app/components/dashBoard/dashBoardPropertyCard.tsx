"use client";
import { PropertyData } from "@/lib/hooks";
import { formatUSDTSafe, toBigInt } from "@/lib/utils";
import Image from "next/image";

type PropertyCardProps = {
  property: PropertyData;
  propertyName: string;
  onBuy?: (id: number | string) => void;
  onListForSale?: (id: number | string) => void;
  onCancelListing?: (id: number | string) => void;
  onRedeem?: (id: number | string) => void;
  isListed?: boolean;
  buyPrice?: bigint | string | number;
  statusOverride?: "Active" | "Expired";
  selected?: boolean;
  onToggleSelect?: (id: number | string) => void;
};

export default function DashBoardPropertyCard({
  property,
  propertyName,
  onBuy,
  onListForSale,
  onCancelListing,
  onRedeem,
  isListed,
  buyPrice,
  statusOverride,
  selected,
  onToggleSelect,
}: PropertyCardProps) {
  const totalValue =
    property.totalValue !== undefined && property.totalValue !== null
      ? toBigInt(property.totalValue)
      : BigInt(0);
  const availableShares =
    property.availableShares !== undefined && property.availableShares !== null
      ? toBigInt(property.availableShares)
      : BigInt(0);
  const totalShares =
    property.totalShares !== undefined && property.totalShares !== null
      ? toBigInt(property.totalShares)
      : BigInt(0);

  const mockAnnualReturn = 10.36;

  const totalValueStr =
    property.totalValue !== undefined && property.totalValue !== null
      ? formatUSDTSafe(totalValue)
      : "NaN";
  const apyStr =
    property.apy !== undefined && property.apy !== null
      ? property.apy.toFixed(2) + "%"
      : "NaN";

  const computedExpired = !property.isActive;
  const isExpired = statusOverride
    ? statusOverride === "Expired"
    : computedExpired;
  const listed = Boolean(isListed);
  const effectiveBuyPrice =
    buyPrice !== undefined
      ? toBigInt(buyPrice)
      : property.sharePrice !== undefined
      ? toBigInt(property.sharePrice)
      : BigInt(0);

  return (
    <div
      className={`group relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg border bg-white cursor-pointer transition-transform duration-200 hover:shadow-xl hover:scale-[1.01] ${
        selected ? "border-5 border-green-600" : "border-gray-200"
      }`}
      role="button"
      tabIndex={0}
    >
      {/* Image */}
      <div className="relative">
        <Image
          className="w-full h-60 object-cover"
          src={property.image || "/image-property.png"}
          alt={`${propertyName} Property Image`}
          width={400}
          height={240}
        />
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Plus/select icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(property.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow ${
            selected ? "bg-green-700" : "bg-black/50 hover:bg-black/60"
          }`}
          aria-label="Toggle select for listing"
        >
          {selected ? "✓" : "+"}
        </button>
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
          Ho Chi Minh
        </a>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-gray-900 text-base break-words flex-1">
            {propertyName}
          </h3>
          <div className="shrink-0 flex flex-col gap-1 items-end">
            <span className="text-xs bg-moss-100 text-gray-700 font-semibold px-3 py-1 rounded-full">
              {property.propertyTypeName}
            </span>
          
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-gray-500 text-xs">Property Value</p>
            <p className="font-bold text-gray-900">{totalValueStr}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Rental Yield</p>
            <p className="font-bold text-gray-900">{apyStr}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Annual Return</p>
            <p className="font-bold text-gray-900">{mockAnnualReturn}%</p>
          </div>
        </div>

        {/* Listed NFT - show listed price and action button */}
        {!isExpired && listed && (
          <div className="pt-6 px-1 flex w-full justify-between relative">
            <p className="text-xl font-semibold text-moss-700">Listed for</p>
            <p className="text-xl font-semibold text-moss-700 self-end">
              {formatUSDTSafe(effectiveBuyPrice)}
            </p>

            {/* Hover overlay button - depends on ownership */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {/* Show Cancel listing if user owns this NFT */}
              {onCancelListing && (
                <div className="absolute inset-0 z-10 bg-red-600 text-white flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelListing(property.id);
                    }}
                    className="w-full h-full font-semibold"
                  >
                    Cancel listing
                  </button>
                </div>
              )}
              
              {/* Show Buy now if user doesn't own this NFT */}
              {onBuy && !onCancelListing && (
                <div className="absolute inset-0 z-10 bg-green-600 text-white flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy(property.id);
                    }}
                    className="w-full h-full font-semibold"
                  >
                    Buy now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expired Redeem button */}
        {isExpired && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRedeem?.(property.id);
              }}
              className="px-6 py-3 bg-moss-700 hover:bg-moss-800 text-beige-100 font-semibold rounded-2xl shadow-sm"
            >
              Redeem
            </button>
          </div>
        )}

        {/* List for sale (if not listed and not expired) */}
        {!isExpired && !listed && (
          <div className="pt-2 flex justify-center relative h-14">
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 z-10 bg-green-700 text-white flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onListForSale?.(property.id);
                  }}
                  className="w-full h-full font-semibold"
                >
                  List for sale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

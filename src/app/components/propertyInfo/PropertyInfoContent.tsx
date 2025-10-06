"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  PropertyData,
  usePurchaseShares,
  useUSDTAllowance,
  useApproveUSDT,
  useGetTokenStats,
} from "@/lib/hooks";
import { formatUSDTSafe, toBigInt } from "@/lib/utils";

type PropertyInfoContentProps = {
  property: PropertyData;
};

export default function PropertyInfoContent({
  property,
}: PropertyInfoContentProps) {
  const [shareAmount, setShareAmount] = useState(1);
  const { address: userAddress, isConnected } = useAccount();
  const { investInProperty, isPending, isConfirming, isSuccess, error } =
    usePurchaseShares();

  // Get real-time token statistics from Land contract
  const { data: tokenStats, refetch: refetchTokenStats } = useGetTokenStats(
    property.contractAddress
  );

  // Debug token stats
  console.log("Token Stats:", tokenStats);

  // USDT approval hooks
  const { data: allowance, refetch: refetchAllowance } = useUSDTAllowance(
    userAddress,
    property.contractAddress
  );
  const {
    approveUSDT,
    isPending: isApproving,
    isConfirming: isApprovingConfirming,
    isSuccess: isApprovalSuccess,
    error: approvalError,
  } = useApproveUSDT();

  // Calculate values using real-time data when available
  const totalValue = toBigInt(property.totalValue);

  // Parse tokenStats array: [activeTokens, totalEverMinted, maxSupply, remainingToMint, mintingOpen, tokenPrice]
  const statsArray = tokenStats as bigint[] | undefined;
  const totalShares =
    statsArray && statsArray[2]
      ? BigInt(statsArray[2].toString())
      : toBigInt(property.totalShares); // maxSupply
  const availableShares =
    statsArray && statsArray[3]
      ? BigInt(statsArray[3].toString())
      : toBigInt(property.availableShares); // remainingToMint
  const soldShares = totalShares - availableShares;

  // Project raised calculation: (totalValue / totalShares) * soldShares
  const sharePrice = totalShares > 0 ? totalValue / totalShares : BigInt(0);
  const projectRaised = sharePrice * soldShares;
  const goal = totalValue;
  const progress = goal > 0 ? Number((projectRaised * BigInt(100)) / goal) : 0;

  // Investment details calculations
  const nftPrice = sharePrice;
  const rentalYield = property.apy;
  const mockAnnualReturn = 10.36;
  const mockProjectLength = "90 days";

  // Calculate total cost
  const totalCost = nftPrice * BigInt(shareAmount);

  // Check if approval is needed
  const needsApproval =
    allowance !== undefined && totalCost > (allowance as bigint);

  // Debug logging
  console.log("Property Debug:", {
    tokenStats: statsArray,
    allowance: allowance?.toString(),
    totalCost: totalCost.toString(),
    sharePrice: sharePrice.toString(),
    shareAmount,
    totalValue: totalValue.toString(),
    totalShares: totalShares.toString(),
    availableShares: availableShares.toString(),
    soldShares: soldShares.toString(),
    needsApproval,
    isApprovalSuccess,
  });

  // Refetch allowance after successful approval
  useEffect(() => {
    if (isApprovalSuccess) {
      console.log("Approval successful, refetching allowance...");
      setTimeout(() => {
        refetchAllowance();
      }, 1000); // Wait 1 second for blockchain confirmation
    }
  }, [isApprovalSuccess, refetchAllowance]);

  // Refetch token stats after successful investment
  useEffect(() => {
    if (isSuccess) {
      console.log("Investment successful, refetching token stats...");
      setTimeout(() => {
        refetchTokenStats();
      }, 2000); // Wait 2 seconds for blockchain confirmation
    }
  }, [isSuccess, refetchTokenStats]);

  // Handle approval
  const handleApproval = async () => {
    if (!isConnected || !userAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      // Approve either the exact cost needed or a large standard amount
      const approvalAmount =
        totalCost > BigInt(0) ? totalCost : BigInt("100000000000"); // 100k USDT fallback
      console.log("Approving USDT spending:", {
        spender: property.contractAddress,
        amount: approvalAmount.toString(),
        totalCost: totalCost.toString(),
      });
      approveUSDT(property.contractAddress, approvalAmount);
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!isConnected || !userAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    if (needsApproval) {
      alert("Please approve USDT spending first!");
      return;
    }

    try {
      await investInProperty(
        property.contractAddress,
        shareAmount,
        userAddress
      );
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  return (
    <div className=" bg-beige-100 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="col-span-2 space-y-4">
          <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/image-property.png"
              alt={`Property ${property.id}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative w-full h-28 rounded-xl overflow-hidden shadow"
              >
                <Image
                  src={`/image-property.png`}
                  alt={`Thumbnail ${i}`}
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
        <div className="space-y-6">
          {/* Project Raised */}
          <div className="bg-moss-500 p-4 rounded-2xl shadow space-y-3">
            <h3 className="font-semibold text-lg">Project Raised</h3>
            <div className="w-full bg-[#78787833] rounded-full h-2.5">
              <div
                className="bg-moss-700 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-100">
              {formatUSDTSafe(projectRaised)}/{formatUSDTSafe(goal)}
            </p>
          </div>

          {/* Financial Returns */}
          <div className="bg-moss-500 p-6 rounded-2xl shadow space-y-6">
            <h3 className="font-semibold text-xl text-moss-900">
              Financial Returns
            </h3>
            <div className="flex items-stretch space-x-2">
              <div className="flex w-full rounded-xl overflow-hidden border border-moss-700">
                <input
                  type="number"
                  value={shareAmount}
                  onChange={(e) =>
                    setShareAmount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                  max={Number(availableShares)}
                  className="w-full py-3 px-3 text-lg font-semibold bg-beige-100 focus:outline-none text-moss-700"
                />
                <span className="flex items-center px-4 font-bold text-moss-700 bg-beige-100">
                  NFT
                </span>
              </div>
              {needsApproval ? (
                <button
                  onClick={handleApproval}
                  disabled={
                    !isConnected || isApproving || isApprovingConfirming
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 h-12 rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : isApproving
                    ? "Confirm Approval..."
                    : isApprovingConfirming
                    ? "Processing Approval..."
                    : "APPROVE USDT"}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={
                    !isConnected ||
                    isPending ||
                    isConfirming ||
                    shareAmount > Number(availableShares) ||
                    shareAmount < 1
                  }
                  className="bg-moss-700 hover:bg-moss-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-beige-100 px-6 h-12 rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : isPending
                    ? "Confirm..."
                    : isConfirming
                    ? "Processing..."
                    : "INVEST"}
                </button>
              )}
            </div>

            {/* Show success/error messages */}
            {isApprovalSuccess && needsApproval && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                USDT spending approved! You can now invest.
              </div>
            )}
            {isSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Successfully purchased {shareAmount} share
                {shareAmount !== 1 ? "s" : ""}!
              </div>
            )}
            {approvalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Approval Error: {approvalError.message}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {error.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-2 text-beige-100 text-base">
              <p className="font-semibold">Total Paid</p>
              <p className="text-right">{formatUSDTSafe(totalCost)}</p>
              <p className="font-semibold">Monthly Earned</p>
              <p className="text-right">TBA</p>
              <p className="font-semibold">Annually Earned</p>
              <p className="text-right">TBA</p>
              <p className="font-semibold">Start Date</p>
              <p className="text-right">TBA</p>
              <p className="font-semibold">End Date</p>
              <p className="text-right">TBA</p>
              <p className="font-semibold">Total Profit</p>
              <p className="text-right">TBA</p>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-moss-500 p-4 rounded-2xl shadow space-y-4">
            <h3 className="font-semibold text-lg">Investment Details</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700">
                  {formatUSDTSafe(totalValue)}
                </p>
                <p className="text-xs text-moss-700">Property Value</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-moss-700">{Number(totalShares)}</p>
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

"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { LandABI } from "@/lib/abis";
import { PROPERTY_ADDRESSES } from "@/lib/contracts";
import { u2uTestnet } from "@/lib/wagmi";
import { createPublicClient, http } from "viem";
import { motion } from "framer-motion";

interface HarvestModalProps {
  onClose: () => void;
  availableToClaim: number;
}

interface PropertyWithNFTs {
  address: string;
  name: string;
  balance: number;
  availableYield: number;
  canWithdraw: boolean;
  isHarvesting: boolean;
  isComplete: boolean;
  hash?: `0x${string}`;
}

export function HarvestModal({ onClose, availableToClaim }: HarvestModalProps) {
  const { address: userAddress } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [properties, setProperties] = useState<PropertyWithNFTs[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  const { isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Scan for properties with NFTs when modal opens
  useEffect(() => {
    const scanProperties = async () => {
      if (!userAddress) return;

      const client = createPublicClient({
        chain: u2uTestnet,
        transport: http("https://rpc-nebulas-testnet.uniultra.xyz"),
      });

      const propertiesWithNFTs: PropertyWithNFTs[] = [];

      for (const propertyAddress of PROPERTY_ADDRESSES) {
        try {
          const [balance, propertyName, yieldResult] = await Promise.all([
            client.readContract({
              address: propertyAddress as `0x${string}`,
              abi: LandABI,
              functionName: "balanceOf",
              args: [userAddress as `0x${string}`],
            }),
            client.readContract({
              address: propertyAddress as `0x${string}`,
              abi: LandABI,
              functionName: "name",
              args: [],
            }),
            client.readContract({
              address: propertyAddress as `0x${string}`,
              abi: LandABI,
              functionName: "getAvailableYield",
              args: [userAddress as `0x${string}`],
            }).catch(() => [BigInt(0), false, false]) // Fallback if yield call fails
          ]);

          if (Number(balance) > 0) {
            const [yieldAmount, canWithdraw] = yieldResult as [bigint, boolean, boolean];
            const yieldInUSDT = Number(yieldAmount) / 1e18;
            
            propertiesWithNFTs.push({
              address: propertyAddress,
              name: propertyName as string,
              balance: Number(balance),
              availableYield: yieldInUSDT,
              canWithdraw: canWithdraw,
              isHarvesting: false,
              isComplete: false,
            });
          }
        } catch (error) {
          console.error(
            `Error checking balance for ${propertyAddress}:`,
            error
          );
        }
      }

      setProperties(propertiesWithNFTs);
      setIsScanning(false);
    };

    scanProperties();
  }, [userAddress]);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      setProperties((prev) =>
        prev.map((p) =>
          p.isHarvesting ? { ...p, isHarvesting: false, isComplete: true } : p
        )
      );
    }
  }, [isConfirmed, hash]);

  const harvestFromProperty = (propertyAddress: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.address === propertyAddress ? { ...p, isHarvesting: true } : p
      )
    );

    writeContract({
      abi: LandABI,
      address: propertyAddress as `0x${string}`,
      functionName: "withdrawYield",
      args: [],
      chainId: u2uTestnet.id,
    });
  };



  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Harvest Yield</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Available to claim:{" "}
            <span className="font-bold text-green-600">
              ${availableToClaim.toFixed(2)}
            </span>
          </p>
        </div>

        {isScanning ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Scanning properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You don&apos;t own any NFTs yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Visit the Investment page to purchase property NFTs
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Found {properties.length} properties with NFTs
              </p>
            </div>

            {properties.map((property) => (
              <div key={property.address} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {property.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {property.address.slice(0, 10)}...
                      {property.address.slice(-8)}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        {property.balance} NFT{property.balance !== 1 ? 's' : ''}
                      </span>
                      <span className={`font-medium ${property.availableYield > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        ${property.availableYield.toFixed(4)} yield
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${property.canWithdraw && property.availableYield > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {property.canWithdraw && property.availableYield > 0 ? 'Ready' : 'Accumulating'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => harvestFromProperty(property.address)}
                    disabled={
                      property.isHarvesting || 
                      property.isComplete || 
                      !property.canWithdraw || 
                      property.availableYield <= 0
                    }
                    className={`px-3 py-1 text-sm rounded ml-3 transition-colors ${
                      property.isComplete
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : property.isHarvesting
                        ? 'bg-blue-500 text-white cursor-wait'
                        : property.canWithdraw && property.availableYield > 0
                        ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {property.isComplete
                      ? "✅ Claimed"
                      : property.isHarvesting
                      ? "Claiming..."
                      : property.canWithdraw && property.availableYield > 0
                      ? "Claim Now"
                      : property.availableYield > 0
                      ? "Not Ready"
                      : "No Yield"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

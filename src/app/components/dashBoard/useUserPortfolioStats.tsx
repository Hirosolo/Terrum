"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { usePropertyBalance, useGetAllProperties, type PropertyData } from "@/lib/hooks";
import { PROPERTY_ADDRESSES } from "@/lib/contracts";

export function useUserPortfolioStats() {
  const { address: userAddress } = useAccount();
  const { data: allProperties } = useGetAllProperties();
  
  console.log("useUserPortfolioStats called", { 
    userAddress, 
    allPropertiesLength: allProperties?.length 
  });

  return useQuery({
    queryKey: ["userPortfolioStats", userAddress, allProperties],
    queryFn: async () => {
      console.log("Portfolio stats query starting...", {
        userAddress,
        propertiesCount: allProperties?.length
      });
      try {
        if (!userAddress || !allProperties) {
          return {
            totalInvestment: 0,
            availableToClaim: 0,
            totalBalance: 0,
            monthlyEarnings: 0, // No earnings without user or properties
          };
        }

        let totalInvestment = 0;
        let availableToClaim = 0;
        let monthlyEarnings = 0;

        // Import viem client to read balances directly
        const { createPublicClient, http } = await import("viem");
        const { u2uTestnet } = await import("@/lib/wagmi");
        const { LandABI } = await import("@/lib/abis");

        const client = createPublicClient({
          chain: u2uTestnet,
          transport: http("https://rpc-nebulas-testnet.uniultra.xyz"),
        });

      // Get balance for each property and calculate stats
      for (const propertyAddress of PROPERTY_ADDRESSES) {
        try {
          // Get user's NFT balance for this property directly from contract
          const balance = await client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: "balanceOf",
            args: [userAddress as `0x${string}`],
          });

          const nftBalance = Number(balance);

          if (nftBalance > 0) {
            // Find property data from allProperties
            const property = allProperties.find(
              (p: PropertyData) =>
                p.contractAddress.toLowerCase() ===
                propertyAddress.toLowerCase()
            );

            if (property) {
              // Calculate total investment: share price × number of NFTs owned
              const sharePrice = Number(property.sharePrice) / 1e18; // Convert from wei to USDT
              const investmentValue = sharePrice * nftBalance;
              totalInvestment += investmentValue;

              // Get property yield economics to calculate monthly earnings
              try {
                const yieldEconomics = await client.readContract({
                  address: propertyAddress as `0x${string}`,
                  abi: LandABI,
                  functionName: "getYieldEconomics",
                  args: [],
                });

                // yieldEconomics returns [yieldRatePerBlock, yieldRatePerMonth, totalSupplyBasis, actualMinted, monthlyYieldRequired, currentReserves]
                const [yieldRatePerBlock] = yieldEconomics as [bigint, bigint, bigint, bigint, bigint, bigint];
                
                // Calculate monthly earnings: yieldRatePerBlock × blocks per month × number of NFTs owned
                const MONTH_IN_BLOCKS = 216000; // 30 days at 12 seconds per block
                const monthlyYieldPerNFT = Number(yieldRatePerBlock) * MONTH_IN_BLOCKS / 1e18; // Convert to USDT
                const userMonthlyFromProperty = monthlyYieldPerNFT * nftBalance;
                monthlyEarnings += userMonthlyFromProperty;
                
                console.log(`Monthly yield for ${property.propertyName}:`, {
                  yieldRatePerBlock: yieldRatePerBlock.toString(),
                  monthlyYieldPerNFT: monthlyYieldPerNFT.toFixed(6),
                  nftBalance,
                  userMonthlyFromProperty: userMonthlyFromProperty.toFixed(6),
                });
              } catch (yieldEconomicsError) {
                console.warn(`Could not get yield economics for ${propertyAddress}:`, yieldEconomicsError);
              }

              // Get available yield using the getAvailableYield function from contract
              try {
                const yieldResult = await client.readContract({
                  address: propertyAddress as `0x${string}`,
                  abi: LandABI,
                  functionName: "getAvailableYield",
                  args: [userAddress as `0x${string}`],
                });

                // yieldResult returns [yieldAmount, canWithdraw, hasBalance]
                const [yieldAmount, canWithdraw] = yieldResult as [bigint, boolean, boolean];
                
                // Only add yield if it's available and user can withdraw
                if (canWithdraw && yieldAmount > 0n) {
                  const yieldInUSDT = Number(yieldAmount) / 1e18;
                  availableToClaim += yieldInUSDT;
                  
                  console.log(`Property ${propertyAddress}:`, {
                    name: property.propertyName,
                    balance: nftBalance,
                    sharePrice: sharePrice.toFixed(2),
                    investmentValue: investmentValue.toFixed(2),
                    availableYield: yieldInUSDT.toFixed(6),
                    canWithdraw,
                  });
                } else {
                  console.log(`Property ${propertyAddress}:`, {
                    name: property.propertyName,
                    balance: nftBalance,
                    sharePrice: sharePrice.toFixed(2),
                    investmentValue: investmentValue.toFixed(2),
                    availableYield: "0 (not yet available)",
                    canWithdraw,
                  });
                }
              } catch (yieldError) {
                console.warn(`Could not get yield for ${propertyAddress}:`, yieldError);
                // This is expected if project hasn't started or no yield available yet
                // Continue without adding to availableToClaim - this is normal
                console.log(`Property ${propertyAddress}:`, {
                  name: property.propertyName,
                  balance: nftBalance,
                  sharePrice: sharePrice.toFixed(2),
                  investmentValue: investmentValue.toFixed(2),
                  availableYield: "0 (error or not started)",
                });
              }
            }
          }
        } catch (error) {
          console.error(
            `Error calculating stats for ${propertyAddress}:`,
            error
          );
        }
      }

      const totalBalance = totalInvestment + availableToClaim;

      console.log("Portfolio Stats Summary:", {
        totalInvestment: totalInvestment.toFixed(2),
        availableToClaim: availableToClaim.toFixed(6),
        totalBalance: totalBalance.toFixed(2),
        monthlyEarnings: monthlyEarnings.toFixed(6),
      });

      return {
        totalInvestment,
        availableToClaim,
        totalBalance,
        monthlyEarnings, // Real calculated monthly earnings
      };
      
      } catch (error) {
        console.error("Error calculating portfolio stats:", error);
        // Return safe defaults if anything fails
        return {
          totalInvestment: 0,
          availableToClaim: 0,
          totalBalance: 0,
          monthlyEarnings: 0, // No earnings if no data
        };
      }
    },
    enabled: !!userAddress && !!allProperties,
    staleTime: 10000, // Refresh every 10 seconds to reduce RPC calls
    refetchInterval: 10000, // Auto-refresh every 10 seconds to show growing yield
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

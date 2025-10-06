"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { usePropertyBalance, useGetAllProperties } from "@/lib/hooks";
import { PROPERTY_ADDRESSES } from "@/lib/contracts";

export function useUserPortfolioStats() {
  const { address: userAddress } = useAccount();
  const { data: allProperties } = useGetAllProperties();

  return useQuery({
    queryKey: ["userPortfolioStats", userAddress, allProperties],
    queryFn: async () => {
      try {
        if (!userAddress || !allProperties) {
          return {
            totalInvestment: 0,
            availableToClaim: 0,
            totalBalance: 0,
            monthlyEarnings: 2.11, // Mock monthly earnings
          };
        }

        let totalInvestment = 0;
        let availableToClaim = 0;

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
              (p) =>
                p.contractAddress.toLowerCase() ===
                propertyAddress.toLowerCase()
            );

            if (property) {
              // Calculate total investment: share price × number of NFTs owned
              const sharePrice = Number(property.sharePrice) / 1e18; // Convert from wei to USDT
              const investmentValue = sharePrice * nftBalance;
              totalInvestment += investmentValue;

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
        monthlyEarnings: 2.11,
      });

      return {
        totalInvestment,
        availableToClaim,
        totalBalance,
        monthlyEarnings: 2.11, // Mock monthly earnings
      };
      
      } catch (error) {
        console.error("Error calculating portfolio stats:", error);
        // Return safe defaults if anything fails
        return {
          totalInvestment: 0,
          availableToClaim: 0,
          totalBalance: 0,
          monthlyEarnings: 2.11, // Mock monthly earnings
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

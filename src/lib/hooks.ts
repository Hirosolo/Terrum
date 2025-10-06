'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { LandTokenizerABI, LandABI, MockUSDTABI } from './abis'
import { CONTRACT_ADDRESSES, PROPERTY_TYPES, PROPERTY_ADDRESSES } from './contracts'
import { u2uTestnet } from './wagmi'

// Types for property data
export interface PropertyInfo {
  contractAddress: string;
  propertyOwner: string;
  propertyName: string;
  propertySymbol: string;
  totalValue: string;
  totalShares: string;
  availableShares: string;
  yieldPerBlock: string;
  yieldReserve: string;
  propertyType: string;
  isActive: boolean;
  createdAt: string;
  sharePrice: string;
}

export interface PropertyData {
  id: number;
  contractAddress: string;
  propertyOwner: string;
  propertyName: string;
  propertySymbol: string;
  totalValue: string;
  totalShares: string;
  availableShares: string;
  remainingShares: string;
  soldShares: string;
  yieldPerBlock: string;
  yieldReserve: string;
  propertyType: string;
  propertyTypeName: string;
  isActive: boolean;
  createdAt: string;
  sharePrice: string;
  soldPercentage: number;
  availabilityPercentage: number;
  apy: number;
}

export interface InvestmentOpportunity {
  id: number;
  ownerAddress: string;
  landContract: string;
  propertyName: string;
  propertySymbol: string;
  totalValue: string;
  totalShares: string;
  availableShares: string;
  remainingShares: string;
  soldShares: string;
  yieldPerBlock: string;
  yieldReserve: string;
  propertyType: string;
  propertyTypeName: string;
  isActive: boolean;
  createdAt: string;
  sharePrice: string;
  soldPercentage: number;
  availabilityPercentage: number;
  apy: number;
}

// Property type mapping imported from contracts.ts

// Hook to get total number of properties
export function useGetTotalProperties() {
  return useReadContract({
    abi: LandTokenizerABI,
    address: CONTRACT_ADDRESSES.LAND_TOKENIZER as `0x${string}`,
    functionName: 'getTotalProperties',
    chainId: u2uTestnet.id,
  })
}

// Hook to get property info from tokenizer contract
export function useGetPropertyInfo(propertyId: number) {
  return useReadContract({
    abi: LandTokenizerABI,
    address: CONTRACT_ADDRESSES.LAND_TOKENIZER as `0x${string}`,
    functionName: 'getPropertyInfo',
    args: [BigInt(propertyId)],
    chainId: u2uTestnet.id,
  })
}

// Optimized implementation using hardcoded addresses - no tokenizer dependency
export function useGetAllProperties() {
  return useQuery({
    queryKey: ['allProperties'],
    queryFn: async (): Promise<PropertyData[]> => {
      try {
        console.log('Fetching properties directly from hardcoded addresses...')
        
        // Import viem client here to avoid SSR issues
        const { createPublicClient, http } = await import('viem')
        
        const client = createPublicClient({
          chain: u2uTestnet,
          transport: http('https://rpc-nebulas-testnet.uniultra.xyz')
        })
        
        const results: PropertyData[] = []
        
        // Directly loop through our hardcoded property addresses
        for (let i = 0; i < PROPERTY_ADDRESSES.length; i++) {
          const propertyAddress = PROPERTY_ADDRESSES[i]
          const propertyId = i + 1
          
          try {
            console.log(`Fetching property ${propertyId} from ${propertyAddress}...`)
            
            // Get property data directly from the Land contract
            const [
              propertyName,
              propertySymbol,
              landType,
              initialValue,
              yieldRate,
              maxSupply
            ] = await Promise.all([
              client.readContract({
                address: propertyAddress as `0x${string}`,
                abi: LandABI,
                functionName: 'name',
              }),
              client.readContract({
                address: propertyAddress as `0x${string}`,
                abi: LandABI,
                functionName: 'symbol',
              }),
              client.readContract({
                address: propertyAddress as `0x${string}`,
                abi: LandABI,
                functionName: 'i_landType',
              }),
              client.readContract({
                address: propertyAddress as `0x${string}`,
                abi: LandABI,
                functionName: 'i_initialValue',
              }),
              client.readContract({
                address: propertyAddress as `0x${string}`,
                abi: LandABI,
                functionName: 'yieldRate',
              }),
              client.readContract({
                address: propertyAddress as `0x${string}`,
                abi: LandABI,
                functionName: 'i_totalSupply',
              })
            ])
            
            // Type cast the results
            const typedPropertyName = propertyName as string
            const typedPropertySymbol = propertySymbol as string
            const typedLandType = landType as bigint
            const typedInitialValue = initialValue as bigint
            const typedYieldRate = yieldRate as bigint
            const typedMaxSupply = maxSupply as bigint
            
            console.log(`Property ${propertyId}:`, {
              propertyName: typedPropertyName,
              propertySymbol: typedPropertySymbol,
              landType: typedLandType.toString(),
              initialValue: typedInitialValue.toString(),
              initialValueUSDT: Number(typedInitialValue) / 1e18,
              yieldRate: typedYieldRate.toString(),
              maxSupply: typedMaxSupply.toString()
            })
            
            // Calculate derived values (mint price = property value / max supply)
            const sharePrice = typedMaxSupply > BigInt(0) ? typedInitialValue / typedMaxSupply : BigInt(0)
            
            console.log(`Property ${propertyId} calculations:`, {
              sharePrice: sharePrice.toString(),
              sharePriceUSDT: Number(sharePrice) / 1e18,
              shouldBe: typedMaxSupply > BigInt(0) ? `${Number(typedInitialValue)} / ${Number(typedMaxSupply)} = ${Number(typedInitialValue) / Number(typedMaxSupply)}` : 'N/A'
            })
            const soldShares = BigInt(0) // For now, assume no shares are sold
            const availableShares = typedMaxSupply
            const soldPercentage = 0
            const availabilityPercentage = 100
            
            // Calculate APY from yield rate
            // Using same calculation as deployment script: 12 second blocks = 2,628,000 blocks per year
            const blocksPerYear = 2628000
            let apy = 0
            if (sharePrice > BigInt(0) && typedYieldRate > BigInt(0)) {
              const annualYieldPerToken = typedYieldRate * BigInt(blocksPerYear)
              apy = Number(annualYieldPerToken * BigInt(100)) / Number(sharePrice)
            }
            
            console.log(`Property ${propertyId} APY calculation:`, {
              sharePrice: sharePrice.toString(),
              yieldRate: typedYieldRate.toString(),
              blocksPerYear,
              annualYieldPerToken: typedYieldRate > BigInt(0) ? (typedYieldRate * BigInt(blocksPerYear)).toString() : '0',
              apy: apy
            })
            
            // Map land type to property type name
            const propertyTypeData = PROPERTY_TYPES[Number(typedLandType)]
            const propertyTypeName = propertyTypeData?.name || `Type ${Number(typedLandType)}`
            
            const propertyData: PropertyData = {
              id: propertyId,
              contractAddress: propertyAddress,
              propertyOwner: CONTRACT_ADDRESSES.DEPLOYER,
              propertyName: typedPropertyName,
              propertySymbol: typedPropertySymbol,
              totalValue: typedInitialValue.toString(),
              totalShares: typedMaxSupply.toString(),
              availableShares: typedMaxSupply.toString(),
              remainingShares: typedMaxSupply.toString(),
              soldShares: soldShares.toString(),
              yieldPerBlock: typedYieldRate.toString(),
              yieldReserve: "0",
              propertyType: typedLandType.toString(),
              propertyTypeName: propertyTypeName,
              isActive: true, // All our deployed properties are active
              createdAt: Date.now().toString(),
              sharePrice: sharePrice.toString(),
              soldPercentage,
              availabilityPercentage,
              apy
            }
            
            console.log(`Property ${propertyId} processed:`, {
              name: propertyData.propertyName,
              type: propertyData.propertyTypeName,
              apy: propertyData.apy
            })
            
            results.push(propertyData)
            
          } catch (propertyError) {
            console.error(`Error fetching property ${propertyId} at ${propertyAddress}:`, propertyError)
          }
        }
        
        console.log(`Successfully fetched ${results.length} properties using direct approach`)
        return results
        
      } catch (error) {
        console.error('Error fetching blockchain data:', error)
        return []
      }
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  })
}

// Mock properties for testing - keeping for fallback
function getMockProperties(): PropertyData[] {
  return [
    {
      id: 1,
      contractAddress: "0x123...",
      propertyOwner: CONTRACT_ADDRESSES.DEPLOYER,
      propertyName: "Saigon Pearl Residence",
      propertySymbol: "SAIGO",
      totalValue: "150000000000000000000000",
      totalShares: "500",
      availableShares: "500",
      remainingShares: "500",
      soldShares: "0",
      yieldPerBlock: "0",
      yieldReserve: "0",
      propertyType: "1",
      propertyTypeName: "Residential",
      isActive: true,
      createdAt: Date.now().toString(),
      sharePrice: "300000000000000000000",
      soldPercentage: 0,
      availabilityPercentage: 100,
      apy: 5.5
    }
  ]
}

// Get property details hook using direct address approach
export function useGetPropertyDetails(propertyId: number) {
  return useQuery({
    queryKey: ['propertyDetails', propertyId],
    queryFn: async (): Promise<PropertyInfo | null> => {
      try {
        // Check if propertyId is valid (1-8)
        if (propertyId < 1 || propertyId > PROPERTY_ADDRESSES.length) {
          console.error(`Invalid property ID: ${propertyId}`)
          return null
        }
        
        const propertyAddress = PROPERTY_ADDRESSES[propertyId - 1]
        
        const { createPublicClient, http } = await import('viem')
        
        const client = createPublicClient({
          chain: u2uTestnet,
          transport: http('https://rpc-nebulas-testnet.uniultra.xyz')
        })
        
        // Get property data directly from the Land contract
        const [
          propertyName,
          propertySymbol,
          landType,
          initialValue,
          yieldRate,
          maxSupply
        ] = await Promise.all([
          client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: 'name',
          }),
          client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: 'symbol',
          }),
          client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: 'i_landType',
          }),
          client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: 'i_initialValue',
          }),
          client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: 'yieldRate',
          }),
          client.readContract({
            address: propertyAddress as `0x${string}`,
            abi: LandABI,
            functionName: 'i_totalSupply',
          })
        ])
        
        // Type cast the results
        const typedPropertyName = propertyName as string
        const typedPropertySymbol = propertySymbol as string
        const typedLandType = landType as bigint
        const typedInitialValue = initialValue as bigint
        const typedYieldRate = yieldRate as bigint
        const typedMaxSupply = maxSupply as bigint
        
        return {
          contractAddress: propertyAddress,
          propertyOwner: CONTRACT_ADDRESSES.DEPLOYER,
          propertyName: typedPropertyName,
          propertySymbol: typedPropertySymbol,
          totalValue: typedInitialValue.toString(),
          totalShares: typedMaxSupply.toString(),
          availableShares: typedMaxSupply.toString(),
          yieldPerBlock: typedYieldRate.toString(),
          yieldReserve: "0",
          propertyType: typedLandType.toString(),
          isActive: true,
          createdAt: Date.now().toString(),
          sharePrice: (typedInitialValue / typedMaxSupply).toString()
        }
      } catch (error) {
        console.error('Error fetching property details:', error)
        return null
      }
    },
    enabled: propertyId > 0,
    staleTime: 30000,
  })
}

// Investment hook
export function useInvestInProperty() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const investInProperty = async (propertyAddress: string, shareAmount: number, userAddress: string) => {
    // Land contract's mint() function mints 1 NFT per call
    // For multiple NFTs, we need to call mint() multiple times
    // For now, let's mint just 1 NFT - enhance later for batch minting if needed
    
    if (shareAmount > 1) {
      console.warn(`Requested ${shareAmount} NFTs, but currently only minting 1 NFT per transaction.`)
    }
    
    writeContract({
      address: propertyAddress as `0x${string}`,
      abi: LandABI,
      functionName: 'mint',
      args: [userAddress as `0x${string}`], // mint(address to) - recipient address
      chainId: u2uTestnet.id,
    })
  }
  
  return {
    investInProperty,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Purchase shares hook (alias for investment hook)
export function usePurchaseShares() {
  return useInvestInProperty()
}

// Faucet hook for minting USDT
export function useMintUSDT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const mintUSDT = (to: string, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
      abi: MockUSDTABI,
      functionName: 'mint',
      args: [to, amount],
    })
  }
  
  return {
    mintUSDT,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Hook to get USDT balance
export function useUSDTBalance(address?: string) {
  return useReadContract({
    abi: MockUSDTABI,
    address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: u2uTestnet.id,
  })
}

// Hook to approve USDT spending
export function useApproveUSDT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const approveUSDT = (spender: string, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
      abi: MockUSDTABI,
      functionName: 'approve', 
      args: [spender, amount],
    })
  }
  
  return {
    approveUSDT,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Hook to check USDT allowance
export function useUSDTAllowance(owner?: string, spender?: string) {
  return useReadContract({
    abi: MockUSDTABI,
    address: CONTRACT_ADDRESSES.USDT as `0x${string}`,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    chainId: u2uTestnet.id,
  })
}

// Hook to get token statistics from Land contract
export function useGetTokenStats(landContractAddress?: string) {
  return useReadContract({
    abi: LandABI,
    address: landContractAddress as `0x${string}`,
    functionName: 'getTokenStats',
    args: [],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!landContractAddress,
    },
  })
}

// Hook to get NFT balance for a specific property
export function useNFTBalance(propertyAddress: string, userAddress?: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress && !!userAddress,
    },
  })
}

// Individual property balance hook
export function usePropertyBalance(propertyAddress: string, userAddress?: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress && !!userAddress,
    },
  })
}

// Hook to get property name
export function usePropertyName(propertyAddress: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'name',
    args: [],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress,
    },
  })
}

// Hook to get property symbol
export function usePropertySymbol(propertyAddress: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'symbol',
    args: [],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress,
    },
  })
}

// Hook to get property type
export function usePropertyType(propertyAddress: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'i_landType',
    args: [],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress,
    },
  })
}

// Hook to get property initial value
export function usePropertyValue(propertyAddress: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'i_initialValue',
    args: [],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress,
    },
  })
}

// Hook to get yield rate
export function usePropertyYieldRate(propertyAddress: string) {
  return useReadContract({
    abi: LandABI,
    address: propertyAddress as `0x${string}`,
    functionName: 'yieldRate',
    args: [],
    chainId: u2uTestnet.id,
    query: {
      enabled: !!propertyAddress,
    },
  })
}

// Hook to withdraw yield from a single property
export function useWithdrawYield(propertyAddress: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const withdrawYield = () => {
    writeContract({
      abi: LandABI,
      address: propertyAddress as `0x${string}`,
      functionName: 'withdrawYield',
      args: [],
      chainId: u2uTestnet.id,
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    withdrawYield,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
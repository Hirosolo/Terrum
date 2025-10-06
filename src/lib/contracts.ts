// Contract addresses on U2U testnet
export const CONTRACT_ADDRESSES = {
  USDT: "0x5Df5E5FD5396e1387A982a7A7450D0c7CEaB40B8",
  LAND_TOKENIZER: "0xb5A7CEB3195714e81082F8A8B0F8cd7470bB72f8",
  DEPLOYER: "0x7EA634e331CF7b503df2e224f77a7C589462F1F2",
  MARKETPLACE: "0x27651a68e2A17a6454d998704b60e3493B3c4C82"
} as const;

// All deployed property addresses on U2U testnet
export const PROPERTY_ADDRESSES = [
  "0xC6141Ff111AeB43731EC2d528E779175Ecdd818b", // Property 1 - Saigon Pearl Residence (starts in 2 hours)
  "0x811CFbb8d921DfBF0e24c922EE1Bca3cc4b91c96", // Property 2 - Hanoi Horizon Towers (starts in 2 hours)
  "0x20C6924E9A2831FD58aa10cFb9b782A31865b470", // Property 3 - Da Nang Marina Bay (starts in 2 hours)
  "0xEA2D22e92b8a2B7ed4cfA7C92a92F6b2D519c740", // Property 4 - Nha Trang Skyline (starts in 2 hours)
  "0xBeE606a6c95A4B93EcccCA6aA9009F4cB5D07c45", // Property 5 - Mekong Riverside Villas (starts in 8 hours)
  "0xD09D0800747F245350e5DE632b688f3a6667aAD9", // Property 6 - Hue Imperial Garden (starts in 8 hours)
  "0xa3085bBc40168Ca4295e567a8a1c16470CD89F8D", // Property 7 - Phu Quoc Oceanfront Estate (starts in 8 hours)
  "0xa3628A37656aaEedF8BaA6B8A129731Fd62E707B"  // Property 8 - Sapa Highland Retreat (starts in 8 hours)
] as const;

// Token metadata for Mock Stable Token
export const USDT_TOKEN = {
  address: CONTRACT_ADDRESSES.USDT,
  name: "Tether USD",
  symbol: "USDT",
  decimals: 18,
} as const;

// Property type mapping
export const PROPERTY_TYPES: { [key: number]: { name: string; color: string } } = {
  1: { name: "Residential", color: "bg-blue-500" },
  2: { name: "Apartment", color: "bg-green-500" },
  3: { name: "Co-living", color: "bg-purple-500" },
  4: { name: "Hospitality", color: "bg-orange-500" },
};

// Helper functions for USDT formatting (18 decimals for lzUSDT)
export const formatUSDT = (amount: bigint): string => {
  const value = Number(amount) / 1e18;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
};

export const parseUSDT = (amount: string): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * 1e18));
};

// Helper functions for calculations
export const calculateSharePrice = (totalValue: bigint, totalShares: bigint): bigint => {
  return totalValue / totalShares;
};

export const calculateOwnership = (shareAmount: bigint, totalShares: bigint): number => {
  return Number((shareAmount * BigInt(100)) / totalShares);
};

export const calculateAPY = (yieldPerBlock: bigint, sharePrice: bigint, sharePercentage: bigint): number => {
  const BLOCKS_PER_YEAR = BigInt((365 * 24 * 60 * 60) / 12); 
  const annualYield = yieldPerBlock * BLOCKS_PER_YEAR * sharePercentage / BigInt(10000);
  const apy = Number(annualYield * BigInt(100) / sharePrice);
  return apy;
};

// Contract addresses on U2U testnet
export const CONTRACT_ADDRESSES = {
  USDT: "0x5Df5E5FD5396e1387A982a7A7450D0c7CEaB40B8",
  LAND_TOKENIZER: "0xE77719De4D0921110DDcFb3497415Efd6F29f70B",
  DEPLOYER: "0x7EA634e331CF7b503df2e224f77a7C589462F1F2",
  MARKETPLACE: "0x27651a68e2A17a6454d998704b60e3493B3c4C82"
} as const;

// All deployed property addresses on U2U testnet (NEW DEPLOYMENT - Oct 6, 2025)
export const PROPERTY_ADDRESSES = [
  "0xBE2726BC0D98A3d14226cd363e694DdF486E5862", // Property 1 - Saigon Pearl Residence (5% APY - starts in ~20min)
  "0x064Eaa3Ae57DDFC5b2F2c38D19203eC2A60aF0c9", // Property 2 - Hanoi Horizon Towers (6% APY - starts in ~40min)
  "0xdC11a7325f679e7C96b435480CeBFaCb2858fE92", // Property 3 - Da Nang Marina Bay (7% APY - starts in ~60min)
  "0x571CBCf94E7e1867Aec79E095Ca08728453d7DA9", // Property 4 - Nha Trang Skyline (5% APY - starts in ~80min)
  "0x1EE9dFF2c51aC347C294c288608844Aa1FA2D430", // Property 5 - Mekong Riverside Villas (6% APY - starts in ~100min)
  "0x328B9cC675159C6C511C28D53b4C703aAabe64a3", // Property 6 - Hue Imperial Garden (7% APY - starts in ~120min)
  "0xD260f528BD8e5e0b45196f6573b46779200716a4", // Property 7 - Phu Quoc Oceanfront Estate (5% APY - starts in ~140min)
  "0xbD24f57e1c280847E019309E82f73440e251d77b"  // Property 8 - Sapa Highland Retreat (6% APY - starts in ~160min)
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

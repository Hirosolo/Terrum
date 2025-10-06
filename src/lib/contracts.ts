// Contract addresses on U2U testnet
export const CONTRACT_ADDRESSES = {
  USDT: "0x5Df5E5FD5396e1387A982a7A7450D0c7CEaB40B8",
  LAND_TOKENIZER: "0x5A6C7b515328E1598d3F1B62E2404f8B525D4E86",
  DEPLOYER: "0x7EA634e331CF7b503df2e224f77a7C589462F1F2",
  MARKETPLACE: "0x51163fF3ac2A2F10a25DFb226FCF2AD5D4ab4e95"
} as const;

// All deployed property addresses on U2U testnet (1000 BLOCK INTERVALS - Oct 6, 2025)
export const PROPERTY_ADDRESSES = [
  "0xf476D12Dd460ee9D48ED7d95234D8F2a5C894e99", // Property 1 - Saigon Pearl Residence (5% APY - starts in ~16min)
  "0xFC7cf639b8168Ce8715F788887B731A244c5885E", // Property 2 - Hanoi Horizon Towers (6% APY - starts in ~33min)
  "0x4A0e3FCADBA7c97F9AC10aB7Bc9B32a3eF754b76", // Property 3 - Da Nang Marina Bay (7% APY - starts in ~50min)
  "0x7Fa2E1f819047033971C9E282148c8744AA9FE3A", // Property 4 - Nha Trang Skyline (5% APY - starts in ~67min)
  "0xb5C684098b5295f131fb50A377cf4FC3831dd8c9", // Property 5 - Mekong Riverside Villas (6% APY - starts in ~84min)
  "0xf9F560e8EBB7B5Dc3C4AfACF860a98cA44DFe01c", // Property 6 - Hue Imperial Garden (7% APY - starts in ~100min)
  "0x19052aC0EF38517C1C4Fcf02CCf37807dcEE864F", // Property 7 - Phu Quoc Oceanfront Estate (5% APY - starts in ~117min)
  "0xB2a5Aa1629C176F97Dc5fA117D9075Ac4a3fFC63"  // Property 8 - Sapa Highland Retreat (6% APY - starts in ~134min)
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

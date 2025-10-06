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
  "0xB2a5Aa1629C176F97Dc5fA117D9075Ac4a3fFC63", // Property 8 - Sapa Highland Retreat (6% APY - starts in ~134min)
  "0xaC0eF002C9bbF33ee88C0D042733F9F4abd3dB28"  // Property 9 - Saigon Gateway (6% APY - active for minting now!)
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

// Property metadata mapping with diverse images and information
export const PROPERTY_METADATA: { [key: string]: { 
  name: string; 
  location: string;
  type: string;
  image: string;
  galleryImages: string[];
  description: string;
  features: string[];
} } = {
  "0xf476D12Dd460ee9D48ED7d95234D8F2a5C894e99": {
    name: "Saigon Pearl Residence",
    location: "Binh Thanh District, Ho Chi Minh City",
    type: "Residential",
    image: "/image-Property1.jpg",
    galleryImages: ["/image-Property1.jpg", "/image-Property2.jpg", "/image-Property3.jpg"],
    description: "Premium waterfront living in the heart of Saigon with stunning river views, world-class amenities, and direct access to the city's financial district.",
    features: ["River View", "Swimming Pool", "Gym", "24/7 Security", "Shopping Mall Access"]
  },
  "0xFC7cf639b8168Ce8715F788887B731A244c5885E": {
    name: "Hanoi Horizon Towers",
    location: "Cau Giay District, Hanoi",
    type: "Apartment",
    image: "/image-Property4.jpg",
    galleryImages: ["/image-Property4.jpg", "/image-Property5.jpg", "/image-Property6.jpg"],
    description: "Contemporary high-rise living in Hanoi's dynamic business district, featuring smart home technology and panoramic city views.",
    features: ["Smart Home", "City View", "Conference Center", "Rooftop Garden", "Metro Access"]
  },
  "0x4A0e3FCADBA7c97F9AC10aB7Bc9B32a3eF754b76": {
    name: "Da Nang Marina Bay",
    location: "Ngu Hanh Son District, Da Nang",
    type: "Co-living",
    image: "/image-Property7.jpg",
    galleryImages: ["/image-Property7.jpg", "/image-Property8.jpg", "/image-Property9.jpg"],
    description: "Luxury beachfront resort complex with private marina, offering unparalleled coastal living and investment opportunities in Central Vietnam.",
    features: ["Beach Access", "Private Marina", "Spa & Wellness", "Golf Course", "Restaurant & Bar"]
  },
  "0x7Fa2E1f819047033971C9E282148c8744AA9FE3A": {
    name: "Nha Trang Skyline",
    location: "Loc Tho Ward, Nha Trang",
    type: "Hospitality",
    image: "/image-Property10.jpg",
    galleryImages: ["/image-Property10.jpg", "/image-Property11.jpg", "/image-Property12.jpg"],
    description: "Iconic beachfront development combining residential luxury with resort amenities, perfectly positioned along Nha Trang's famous coastline.",
    features: ["Beachfront", "Infinity Pool", "Water Sports", "Spa Services", "Tourist Hub Access"]
  },
  "0xb5C684098b5295f131fb50A377cf4FC3831dd8c9": {
    name: "Mekong Riverside Villas",
    location: "Can Tho City, Mekong Delta",
    type: "Residential",
    image: "/image-Property13.jpg",
    galleryImages: ["/image-Property13.jpg", "/image-Property14.jpg", "/image-Property15.jpg"],
    description: "Sustainable luxury villas nestled along the Mekong River, offering eco-friendly living with authentic Vietnamese Delta experiences.",
    features: ["River Access", "Eco-Friendly", "Cultural Tours", "Organic Gardens", "Traditional Architecture"]
  },
  "0xf9F560e8EBB7B5Dc3C4AfACF860a98cA44DFe01c": {
    name: "Hue Imperial Garden",
    location: "Imperial City, Hue",
    type: "Apartment",
    image: "/image-Property16.jpg",
    galleryImages: ["/image-Property16.jpg", "/image-Property17.jpg", "/image-Property18.jpg"],
    description: "Historically inspired luxury accommodation within walking distance of Hue's Imperial City, blending cultural heritage with modern comfort.",
    features: ["Historical Location", "Cultural Heritage", "Traditional Gardens", "Royal Cuisine", "UNESCO Site Access"]
  },
  "0x19052aC0EF38517C1C4Fcf02CCf37807dcEE864F": {
    name: "Phu Quoc Oceanfront Estate",
    location: "Duong To Commune, Phu Quoc Island",
    type: "Co-living",
    image: "/image-Property19.jpg",
    galleryImages: ["/image-Property19.jpg", "/image-Property20.jpg", "/image-Property21.jpg"],
    description: "Exclusive island resort development on Vietnam's largest island, featuring pristine beaches, tropical landscapes, and world-class facilities.",
    features: ["Private Beach", "Tropical Resort", "Water Villa", "Island Activities", "Sunset Views"]
  },
  "0xB2a5Aa1629C176F97Dc5fA117D9075Ac4a3fFC63": {
    name: "Sapa Highland Retreat",
    location: "Sapa Town, Lao Cai Province",
    type: "Hospitality",
    image: "/image-Property22.jpg",
    galleryImages: ["/image-Property22.jpg", "/image-Property23.jpg", "/image-Property24.jpg"],
    description: "Mountain retreat resort offering breathtaking terraced landscape views, authentic ethnic culture experiences, and cool highland climate.",
    features: ["Mountain Views", "Terraced Landscapes", "Cultural Immersion", "Trekking Access", "Cool Climate"]
  },
  "0xaC0eF002C9bbF33ee88C0D042733F9F4abd3dB28": {
    name: "Saigon Gateway",
    location: "District 1, Ho Chi Minh City",
    type: "Residential",
    image: "/image-Property1.jpg",
    galleryImages: ["/image-Property1.jpg", "/image-Property2.jpg", "/image-Property3.jpg"],
    description: "Premium mixed-use development in the heart of Saigon's central business district, offering luxury apartments with commercial spaces and excellent connectivity.",
    features: ["Central Location", "Mixed-Use", "Business District", "Metro Access", "Shopping Complex", "Premium Amenities"]
  }
};

// Helper function to get property image by address
export const getPropertyImage = (propertyAddress: string): string => {
  const metadata = PROPERTY_METADATA[propertyAddress];
  return metadata?.image || "/image-property.png"; // fallback to default
};

// Helper function to get property metadata by address
export const getPropertyMetadata = (propertyAddress: string) => {
  return PROPERTY_METADATA[propertyAddress] || {
    name: "Unknown Property",
    location: "Vietnam",
    type: "Real Estate",
    image: "/image-property.png",
    galleryImages: ["/image-property.png"],
    description: "Premium Vietnamese real estate investment opportunity.",
    features: ["Investment Property"]
  };
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

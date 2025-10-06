import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains';

// U2U testnet config
export const u2uTestnet = {
  id: 2484,
  name: 'U2U Testnet',
  network: 'u2u-testnet',
  nativeCurrency: {
    name: 'U2U',
    symbol: 'U2U',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc-nebulas-testnet.uniultra.xyz'] },
    public: { http: ['https://rpc-nebulas-testnet.uniultra.xyz'] },
  },
  blockExplorers: {
    default: { name: 'U2U Explorer', url: 'https://testnet.u2uscan.xyz' },
  },
  testnet: true,
};

// Keep Base Sepolia for compatibility (commented out for now)
export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "Landzen",
  projectId: "5c992b50e8871ed27bdb8e9f96975888",
  chains: [u2uTestnet, mainnet, sepolia, polygon, arbitrum], // Put U2U testnet first as default
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
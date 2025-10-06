// Import the actual contract ABIs from the contracts directory
import LandTokenizerContract from '../../contracts/LandTokenizer.json';
import LandContract from '../../contracts/Land.json';
import mockStableTokenContract from '../../contracts/mockStableToken.json';
import MarketplaceContract from '../../contracts/Marketplace.json';

// Export the ABIs for use in the application
export const LandTokenizerABI = LandTokenizerContract.abi;
export const LandABI = LandContract.abi;
export const MockUSDTABI = mockStableTokenContract.abi; // Now using mockStableToken
export const MarketplaceABI = MarketplaceContract.abi;

// Export types for better TypeScript support
export type LandTokenizerABI = typeof LandTokenizerABI;
export type LandABI = typeof LandABI;
export type MockUSDTABI = typeof MockUSDTABI;
export type MarketplaceABI = typeof MarketplaceABI;

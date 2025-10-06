import { NextRequest, NextResponse } from "next/server";

// This is a simple API to fetch listing data from the blockchain
// In a production app, you'd use a proper RPC setup or indexing service

import { createPublicClient, http } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { MarketplaceABI } from '@/lib/abis';

// Create a client to read from the blockchain
const client = createPublicClient({
  transport: http('https://rpc-nebulas-testnet.uniultra.xyz'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = params.id;
  
  try {
    // Call the actual marketplace contract to get listing data
    const listing = await client.readContract({
      address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
      abi: MarketplaceABI,
      functionName: 'getListing',
      args: [BigInt(listingId)],
    }) as any;

    // Convert the result to the expected format
    const formattedListing = {
      seller: listing.seller,
      nftContract: listing.nftContract,
      tokenId: listing.tokenId.toString(),
      paymentToken: listing.paymentToken,
      price: listing.price.toString(), // Convert BigInt to string
      active: listing.active,
      listedAt: Number(listing.listedAt),
    };
    
    return NextResponse.json(formattedListing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    // Return inactive listing if not found or error occurs
    const emptyListing = {
      seller: "0x0000000000000000000000000000000000000000",
      nftContract: "0x0000000000000000000000000000000000000000", 
      tokenId: "0",
      paymentToken: "0x0000000000000000000000000000000000000000",
      price: "0",
      active: false,
      listedAt: 0,
    };
    
    return NextResponse.json(emptyListing);
  }
}
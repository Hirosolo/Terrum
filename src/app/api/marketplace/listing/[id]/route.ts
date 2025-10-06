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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listingId = id;
  
  try {
    // Call the marketplace contract to get listing info
    const listing = await client.readContract({
      address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
      abi: MarketplaceABI,
      functionName: 'getListing',
      args: [BigInt(listingId)],
    });

    console.log(`Raw listing data for ID ${listingId}:`, listing);

    // Check if listing exists and is valid (should be an object with struct fields)
    if (!listing || typeof listing !== 'object') {
      console.log(`Listing ${listingId} not found or invalid structure`);
      // Return inactive listing if not found
      const emptyListing = {
        seller: "0x0000000000000000000000000000000000000000",
        nftContract: "0x0000000000000000000000000000000000000000", 
        tokenId: "0",
        paymentToken: "0x0000000000000000000000000000000000000000",
        price: "0",
        active: false,
        listedAt: 0,
        listingId: Number(listingId),
      };
      
      return NextResponse.json(emptyListing);
    }

    // Access the struct fields directly (Viem returns structs as objects)
    const listingData = listing as {
      seller: string;
      nftContract: string;
      tokenId: bigint;
      paymentToken: string;
      price: bigint;
      active: boolean;
      listedAt: bigint;
    };
    
    // Convert the result to the expected format
    const formattedListing = {
      seller: listingData.seller,
      nftContract: listingData.nftContract,
      tokenId: listingData.tokenId.toString(),
      paymentToken: listingData.paymentToken,
      price: listingData.price.toString(), // Convert BigInt to string
      active: listingData.active,
      listedAt: Number(listingData.listedAt), // Convert BigInt to number
      listingId: Number(listingId),
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
"use client";
import { useAccount } from "wagmi";
import { useMintUSDT } from "@/lib/hooks";
import { formatUSDT, USDT_TOKEN } from "@/lib/contracts";
import { useState } from "react";
import MarketplaceSearchBar from "../components/investment/header";

export default function Faucet() {
  const { address, isConnected } = useAccount();
  const { mintUSDT, isPending, isConfirming, isSuccess, error } = useMintUSDT();
  const [isAddingToken, setIsAddingToken] = useState(false);

  // Fixed amount: 250,000 USDT (with 18 decimals for lzUSDT)
  const MINT_AMOUNT = BigInt(250000) * BigInt(10 ** 18);

  const handleMintUSDT = async () => {
    if (!address) return;

    try {
      await mintUSDT(address, MINT_AMOUNT);
    } catch (err) {
      console.error("Mint failed:", err);
    }
  };

  const handleAddTokenToWallet = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsAddingToken(true);

    try {
      console.log("Checking for ethereum...");
      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      // Check current network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      console.log("Current chain ID:", chainId);

      // U2U Testnet chain ID is 0x9b4 (2484 in decimal)
      const u2uTestnetChainId = "0x9b4";
      if (chainId !== u2uTestnetChainId) {
        // Try to switch to U2U testnet automatically
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: u2uTestnetChainId }],
          });
        } catch (switchError) {
          // If the chain hasn't been added to the wallet, add it
          const walletError = switchError as { code?: number };
          if (walletError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: u2uTestnetChainId,
                    chainName: "U2U Testnet",
                    nativeCurrency: {
                      name: "U2U",
                      symbol: "U2U",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc-nebulas-testnet.uniultra.xyz"],
                    blockExplorerUrls: ["https://testnet.u2uscan.xyz"],
                  },
                ],
              });
            } catch {
              alert("Failed to add U2U testnet to your wallet");
              return;
            }
          } else {
            alert("Please switch to U2U testnet to add this token");
            return;
          }
        }
      }

      console.log("Attempting to add token with:", {
        address: USDT_TOKEN.address,
        symbol: USDT_TOKEN.symbol,
        decimals: USDT_TOKEN.decimals,
      });

      // Ensure the address is properly formatted (checksum)
      const checksumAddress = USDT_TOKEN.address.toLowerCase().startsWith("0x")
        ? USDT_TOKEN.address
        : `0x${USDT_TOKEN.address}`;

      const result = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: checksumAddress,
            symbol: USDT_TOKEN.symbol,
            decimals: USDT_TOKEN.decimals,
          },
        },
      });

      console.log("Token addition result:", result);
      if (result) {
        alert("🎉 Mock USDT has been added to your wallet!");
      } else {
        alert("Token addition was cancelled or failed");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );

      // More specific error handling
      if (error && typeof error === "object") {
        const walletError = error as {
          code?: number;
          data?: unknown;
          message?: string;
        };
        console.error("Error code:", walletError.code);
        console.error("Error data:", walletError.data);

        if (walletError.code === 4001) {
          alert("You cancelled the token addition request.");
          return;
        } else if (walletError.code === -32602) {
          alert("Invalid token parameters. Please check the contract address.");
          return;
        }
      }

      alert(
        `Failed to add token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsAddingToken(false);
    }
  };

  return (
    <div>

      <MarketplaceSearchBar/>
    <div className="min-h-screen bg-beige-100 from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mock USDT Faucet
          </h1>
          <p className="text-gray-600">
            Get test Mock USDT tokens for investing in tokenized real estate
          </p>
        </div>

        <div className="space-y-6">
          {/* Mint Amount Display */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Mint Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatUSDT(MINT_AMOUNT)}
              </p>
            </div>
          </div>
          {/* Wallet Connection Status */}
          {isConnected ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Connected Wallet</p>
              <p className="font-mono text-sm text-blue-600 break-all">
                {address}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-center text-yellow-700">
                Please connect your wallet to mint Mock USDT
              </p>
            </div>
          )}
          {/* Mint Button */}
          <button
            onClick={handleMintUSDT}
            disabled={!isConnected || isPending || isConfirming}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors text-lg"
          >
            {isPending
              ? "Confirm in Wallet..."
              : isConfirming
              ? "Minting Mock USDT..."
              : "Mint 250,000 Mock USDT"}
          </button>
          {/* Add Token to Wallet Button */}
          {isConnected && (
            <button
              onClick={handleAddTokenToWallet}
              disabled={isAddingToken}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {isAddingToken ? "Adding Token..." : "Add Mock USDT to Wallet"}
            </button>
          )}{" "}
          {/* Status Messages */}
          {isSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    Successfully minted {formatUSDT(MINT_AMOUNT)} Mock USDT!
                  </p>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    Error: {error.message || "Failed to mint Mock USDT"}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Info Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Connect your wallet</li>
              <li>2. Switch to U2U Testnet (automatic)</li>
              <li>3. Click &quot;Mint 250,000 Mock USDT&quot;</li>
              <li>4. Confirm the transaction</li>
              <li>5. Add Mock USDT to your wallet</li>
              <li>6. Use Mock USDT to invest in properties</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-500">
                <strong>Network:</strong> U2U Testnet (Chain ID: 2484)
                <br />
                <strong>Token Contract:</strong> {USDT_TOKEN.address.slice(0, 10)}...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

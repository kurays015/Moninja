import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";

// Mock ABI for the updatePlayerData function
const CONTRACT_ABI = [
  {
    inputs: [
      { name: "player", type: "address" },
      { name: "scoreAmount", type: "uint256" },
      { name: "transactionAmount", type: "uint256" }
    ],
    name: "updatePlayerData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

const CONTRACT_ADDRESS = "0xceCBFF203C8B6044F52CE23D914A1bfD997541A4";

export async function POST(request: NextRequest) {
  try {
    const { player, scoreAmount, transactionAmount } = await request.json();

    // Validate input
    if (!player || typeof scoreAmount !== "number" || typeof transactionAmount !== "number") {
      return NextResponse.json(
        { error: "Invalid input parameters" },
        { status: 400 }
      );
    }

    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Private key not configured" },
        { status: 500 }
      );
    }

    // Create account from private key
    const account = privateKeyToAccount(privateKey);

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(),
    });

    // Prepare contract write
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "updatePlayerData",
      args: [player as `0x${string}`, BigInt(scoreAmount), BigInt(transactionAmount)],
    });

    console.log("Transaction submitted:", hash);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      player,
      scoreAmount,
      transactionAmount,
    });

  } catch (error) {
    console.error("Error submitting transaction:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to submit transaction",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

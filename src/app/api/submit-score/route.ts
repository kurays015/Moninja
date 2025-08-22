import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";

// Mock ABI for the updatePlayerData function
const CONTRACT_ABI = [
  {
    inputs: [
      { name: "player", type: "address" },
      { name: "scoreAmount", type: "uint256" },
      { name: "transactionAmount", type: "uint256" },
    ],
    name: "updatePlayerData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export async function POST(request: Request) {
  try {
    const { player, scoreAmount, transactionAmount } = await request.json();

    // Validate input
    if (
      !player ||
      typeof scoreAmount !== "number" ||
      typeof transactionAmount !== "number"
    ) {
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
      address: process.env.CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "updatePlayerData",
      args: [
        player as `0x${string}`,
        BigInt(scoreAmount),
        BigInt(transactionAmount),
      ],
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
    console.error("Error updating player data:", error);

    // Handle specific viem errors
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        return NextResponse.json(
          { error: "Insufficient funds to complete transaction" },
          { status: 400 }
        );
      }
      if (error.message.includes("execution reverted")) {
        return NextResponse.json(
          {
            error:
              "Contract execution failed - check if wallet has GAME_ROLE permission",
          },
          { status: 400 }
        );
      }
      if (error.message.includes("AccessControlUnauthorizedAccount")) {
        return NextResponse.json(
          { error: "Unauthorized: Wallet does not have GAME_ROLE permission" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update player data" },
      { status: 500 }
    );
  }
}

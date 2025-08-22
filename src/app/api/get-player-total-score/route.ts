import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

const CONTRACT_ABI = [
  {
    inputs: [{ name: "", type: "address" }],
    name: "totalScoreOfPlayer",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export async function POST(request: Request) {
  const { walletAddress } = await request.json();

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Invalid or missing wallet address" },
      { status: 400 }
    );
  }

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  });

  try {
    const totalScore = await publicClient.readContract({
      address: process.env.CONTRACT_ADDRESS as `0x${string}`,
      functionName: "totalScoreOfPlayer",
      args: [walletAddress as `0x${string}`],
      abi: CONTRACT_ABI,
    });

    if (totalScore === null || totalScore === undefined) {
      return NextResponse.json(
        { error: "No score found for the provided wallet address" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { totalScore: totalScore.toString() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch total score",
        errorMessage: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

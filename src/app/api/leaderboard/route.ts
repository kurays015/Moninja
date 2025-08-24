import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

const GAME_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "games",
    outputs: [
      {
        internalType: "address",
        name: "game",
        type: "address",
      },
      {
        internalType: "string",
        name: "image",
        type: "string",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
const gameAddress = process.env.GAME_ADDRESS as `0x${string}`;

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

export async function GET() {
  try {
    if (!contractAddress || !gameAddress) {
      console.error(
        "Missing required environment variables: CONTRACT_ADDRESS, GAME_ADDRESS"
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Execute the blockchain read
    const data = await publicClient.readContract({
      address: contractAddress,
      abi: GAME_ABI,
      functionName: "games",
      args: [gameAddress],
    });

    console.log(data, "Game data fetched successfully");

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error("Unexpected error in games endpoint:", error);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorMessage =
      isDevelopment && error instanceof Error
        ? error.message
        : "Error fetching game data";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

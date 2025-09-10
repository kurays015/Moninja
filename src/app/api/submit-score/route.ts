import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import jwt from "jsonwebtoken";
import { SessionData } from "@/src/types";
import { CONTRACT_ABI } from "@/src/utils/abi";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(),
});

export async function POST(request: Request) {
  try {
    const { player, scoreAmount, transactionAmount, sessionId } =
      await request.json();

    if (!player) {
      return NextResponse.json(
        { error: "No monad games id walletAddress yet." },
        { status: 400 }
      );
    }

    // 1. VALIDATE INPUT
    if (
      !player ||
      typeof scoreAmount !== "number" ||
      typeof transactionAmount !== "number" ||
      !sessionId
    ) {
      return NextResponse.json(
        { error: "Invalid input parameters" },
        { status: 400 }
      );
    }

    // Validate score and transaction amounts are positive
    if (scoreAmount <= 0 || transactionAmount <= 0) {
      return NextResponse.json(
        { error: "Score and transaction amounts must be positive" },
        { status: 400 }
      );
    }

    // 2. VALIDATE SESSION TOKEN
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid session token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let sessionData: SessionData;
    try {
      sessionData = jwt.verify(token, process.env.JWT_SECRET!) as SessionData;
      if (
        sessionData.player !== player ||
        sessionData.sessionId !== sessionId
      ) {
        throw new Error("Session mismatch");
      }
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // 3. VALIDATE ENVIRONMENT VARIABLES
    if (!process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 6. BLOCKCHAIN TRANSACTION
    try {
      // Execute the blockchain transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: "updatePlayerData",
        args: [
          player as `0x${string}`,
          BigInt(scoreAmount),
          BigInt(transactionAmount),
        ],
      });

      console.log("Successfully processed score submission:", {
        player,
        scoreAmount,
        transactionAmount,
        transactionHash: hash,
        sessionId,
      });

      return NextResponse.json({
        success: true,
        transactionHash: hash,
        player,
        scoreAmount,
        transactionAmount,
      });
    } catch (blockchainError: unknown) {
      console.error("Blockchain transaction failed:", blockchainError);

      if (blockchainError instanceof Error) {
        const errorMessage = blockchainError.message.toLowerCase();

        if (errorMessage.includes("insufficient funds")) {
          return NextResponse.json(
            { error: "Insufficient funds to complete transaction" },
            { status: 400 }
          );
        }

        if (errorMessage.includes("execution reverted")) {
          return NextResponse.json(
            {
              error:
                "Contract execution failed - check if wallet has GAME_ROLE permission",
            },
            { status: 400 }
          );
        }

        if (errorMessage.includes("nonce")) {
          return NextResponse.json(
            { error: "Transaction nonce error - please try again" },
            { status: 429 }
          );
        }

        if (errorMessage.includes("gas")) {
          return NextResponse.json(
            { error: "Gas estimation failed - check contract parameters" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: "Blockchain transaction failed" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Unexpected error in submit-score endpoint:", error);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorMessage =
      isDevelopment && error instanceof Error
        ? error.message
        : "Failed to process score submission";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

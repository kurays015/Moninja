import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import jwt from "jsonwebtoken";
import { SessionData } from "@/src/types";
import { CONTRACT_ABI } from "@/src/utils/abi";
import { cookies } from "next/headers";
import { updatePlayerDataSchema } from "@/src/schema/updatePlayerDataSchema";
import arcjet, { tokenBucket } from "@arcjet/next";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(process.env.PRIVATE_RPC),
});

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 10, // refill 10 tokens per interval
      interval: 60, // refill every minute
      capacity: 100, // allow burst of up to 100 requests
    }),
  ],
});

export async function POST(request: Request) {
  try {
    const privy_token = (await cookies()).get("privy-token");

    const { player, scoreAmount, transactionAmount, sessionId } =
      await request.json();

    const decision = await aj.protect(request, {
      userId: player || privy_token,
      requested: 1,
    }); // Deduct 1 tokens from the bucket

    if (decision.isDenied()) {
      //rate limited
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too Many Requests", reason: decision.reason },
          { status: 429 }
        );
        //bot
      } else if (decision.reason.isBot()) {
        return NextResponse.json(
          { error: "No bots allowed", reason: decision.reason },
          { status: 403 }
        );
        //others
      } else {
        return NextResponse.json(
          { error: "Forbidden", reason: decision.reason },
          { status: 403 }
        );
      }
    }

    const validatedData = updatePlayerDataSchema.safeParse({
      player,
      scoreAmount,
      transactionAmount,
      sessionId,
    });

    if (!player || !privy_token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    // 1. VALIDATE INPUT
    if (!validatedData.success) {
      return NextResponse.json({ message: "Invalid Input" }, { status: 400 });
    }

    // 2. VALIDATE SESSION TOKEN
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No valid session token provided" },
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
        { message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // 3. VALIDATE ENVIRONMENT VARIABLES
    if (!process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
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
            { message: "Insufficient funds to complete transaction" },
            { status: 400 }
          );
        }

        if (errorMessage.includes("execution reverted")) {
          return NextResponse.json(
            {
              message:
                "Contract execution failed - check if wallet has GAME_ROLE permission",
            },
            { status: 400 }
          );
        }

        if (errorMessage.includes("nonce")) {
          return NextResponse.json(
            { message: "Transaction nonce error - please try again" },
            { status: 429 }
          );
        }

        if (errorMessage.includes("gas")) {
          return NextResponse.json(
            { message: "Gas estimation failed - check contract parameters" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { message: "Blockchain transaction failed" },
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

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

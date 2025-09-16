import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import jwt from "jsonwebtoken";
import { SessionData } from "@/src/types";
import { UPDATE_PLAYER_DATA_ABI } from "@/src/utils/abi";
import { cookies } from "next/headers";
import { updatePlayerDataSchema } from "@/src/schema/updatePlayerDataSchema";
import arcjet, { tokenBucket } from "@arcjet/next";
import { isNonceUsed, markNonceAsUsed } from "@/src/lib/nonceStore";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(process.env.PRIVATE_RPC, {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
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

    const { player, scoreAmount, transactionAmount, sessionId, nonce } =
      await request.json();

    // Enhanced nonce validation with better error handling
    try {
      console.log("🔍 Validating nonce:", {
        nonceReceived: !!nonce,
        nonceLength: nonce?.length,
        sessionId,
        player,
      });

      // 1. Check if nonce exists
      if (!nonce) {
        console.error("❌ No nonce provided");
        return NextResponse.json(
          { error: "Nonce is required" },
          { status: 400 }
        );
      }

      // 2. Check if nonce was already used (before JWT verification)
      let alreadyUsed;
      try {
        alreadyUsed = await isNonceUsed(nonce);
        console.log("🔍 Nonce usage check:", {
          nonce: nonce.substring(0, 20) + "...",
          alreadyUsed,
        });
      } catch (redisError) {
        console.error("❌ Redis error checking nonce:", redisError);
        return NextResponse.json(
          { error: "Database connection error" },
          { status: 500 }
        );
      }

      if (alreadyUsed) {
        console.error("❌ Nonce already used:", nonce.substring(0, 20) + "...");
        return NextResponse.json(
          { error: "Nonce already used" },
          { status: 400 }
        );
      }

      // 3. Verify JWT nonce
      let nonceData;
      try {
        console.log("🔍 Verifying JWT nonce...");
        nonceData = jwt.verify(nonce, process.env.JWT_SECRET!) as {
          sessionId: string;
          player: string;
          timestamp: number;
          gameStartTime: number;
          random: string;
        };
        console.log("✅ JWT verification successful:", {
          sessionId: nonceData.sessionId,
          player: nonceData.player,
          timestamp: new Date(nonceData.timestamp).toISOString(),
        });
      } catch (jwtError) {
        console.error("❌ JWT verification failed:", {
          error:
            jwtError instanceof Error ? jwtError.message : "Unknown JWT error",
          name: jwtError instanceof Error ? jwtError.name : "Unknown",
          nonceStart: nonce.substring(0, 20) + "...",
        });

        if (jwtError instanceof Error) {
          if (jwtError.name === "TokenExpiredError") {
            return NextResponse.json(
              { error: "Nonce has expired" },
              { status: 400 }
            );
          } else if (jwtError.name === "JsonWebTokenError") {
            return NextResponse.json(
              { error: "Invalid nonce format" },
              { status: 400 }
            );
          }
        }

        return NextResponse.json(
          { error: "Invalid nonce signature" },
          { status: 400 }
        );
      }

      // 4. Validate nonce data matches request
      if (nonceData.sessionId !== sessionId) {
        console.error("❌ Session ID mismatch:", {
          nonceSessionId: nonceData.sessionId,
          requestSessionId: sessionId,
        });
        return NextResponse.json(
          { error: "Nonce session ID mismatch" },
          { status: 400 }
        );
      }

      if (nonceData.player !== player) {
        console.error("❌ Player mismatch:", {
          noncePlayer: nonceData.player,
          requestPlayer: player,
        });
        return NextResponse.json(
          { error: "Nonce player mismatch" },
          { status: 400 }
        );
      }

      // 5. Check if nonce is too old (5 minutes)
      const nonceAge = Date.now() - nonceData.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes

      console.log("🕐 Nonce age check:", {
        nonceTimestamp: new Date(nonceData.timestamp).toISOString(),
        currentTime: new Date().toISOString(),
        ageMs: nonceAge,
        maxAgeMs: maxAge,
        isExpired: nonceAge > maxAge,
      });

      if (nonceAge > maxAge) {
        console.error("❌ Nonce expired:", {
          ageMinutes: Math.floor(nonceAge / 60000),
          maxAgeMinutes: Math.floor(maxAge / 60000),
        });
        return NextResponse.json(
          { error: "Nonce expired (older than 5 minutes)" },
          { status: 400 }
        );
      }

      // 6. Mark nonce as used
      try {
        await markNonceAsUsed(nonce);
        console.log("✅ Nonce marked as used successfully");
      } catch (redisError) {
        console.error("❌ Redis error marking nonce as used:", redisError);
        return NextResponse.json(
          { error: "Database error storing nonce" },
          { status: 500 }
        );
      }

      console.log("✅ Nonce validation completed successfully");
    } catch (err) {
      // This catch block should now rarely be reached due to specific error handling above
      console.error("❌ Unexpected error in nonce validation:", err);

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        {
          error: "Nonce validation failed",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
        { status: 400 }
      );
    }

    const decision = await aj.protect(request, {
      userId: player || privy_token,
      requested: 1,
    }); // Deduct 5 tokens from the bucket

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

      const playerData = {
        player: player as `0x${string}`,
        score: BigInt(scoreAmount),
        transactions: BigInt(transactionAmount),
      };

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: UPDATE_PLAYER_DATA_ABI,
        functionName: "updatePlayerData",
        args: [playerData],
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

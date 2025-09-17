import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { UPDATE_PLAYER_DATA_ABI } from "@/src/utils/abi";
import arcjet, { tokenBucket } from "@arcjet/next";
import { getSessionFromRequest } from "@/src/lib/getSessionFromRequest";
import { cookies } from "next/headers";
import { handleBlockchainError } from "@/src/lib/handleBlockChainError";
import { validateGameData } from "@/src/lib/validateGameData";
import { validateNonce } from "@/src/lib/validateNonce";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

// Initialize wallet client
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

// Initialize Arcjet rate limiting
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
    // 1. PARSE REQUEST DATA
    const { player, scoreAmount, transactionAmount, nonce } =
      await request.json();
    const privy_token = (await cookies()).get("privy-token");

    // 2. VALIDATE SESSION
    const session = await getSessionFromRequest();

    const decision = await aj.protect(request, {
      userId: player || privy_token?.value,
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

    if (!session || !session.isActive) {
      console.error("❌ No valid session found");
      return NextResponse.json(
        { error: "No valid session found" },
        { status: 401 }
      );
    }

    // Verify the session belongs to the player (case-insensitive)
    if (session.player.toLowerCase() !== String(player).toLowerCase()) {
      console.error("❌ Session player mismatch:", {
        sessionPlayer: session.player,
        requestPlayer: player,
      });
      return NextResponse.json({ error: "Session mismatch" }, { status: 401 });
    }

    console.log("✅ Session validated:", {
      sessionId: session.sessionId,
      player: session.player,
      sessionActive: session.isActive,
    });

    // 3. VALIDATE NONCE
    const nonceValidationResult = await validateNonce(nonce, session);
    if (!nonceValidationResult.success) {
      return nonceValidationResult.response;
    }

    // 5. VALIDATE ENVIRONMENT VARIABLES
    if (!process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      console.error("❌ Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 6. VALIDATE INPUT DATA
    const validationResult = validateGameData({
      player,
      scoreAmount,
      transactionAmount,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // 7. EXECUTE BLOCKCHAIN TRANSACTION
    try {
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

      console.log("✅ Successfully processed score submission:", {
        player,
        scoreAmount,
        transactionAmount,
        transactionHash: hash,
        sessionId: session.sessionId,
      });

      return NextResponse.json({
        success: true,
        transactionHash: hash,
        player,
        scoreAmount,
        transactionAmount,
      });
    } catch (blockchainError: unknown) {
      return handleBlockchainError(blockchainError);
    }
  } catch (error: unknown) {
    console.error("❌ Unexpected error in submit-score endpoint:", error);

    const isDevelopment = process.env.NODE_ENV === "development";
    const errorMessage =
      isDevelopment && error instanceof Error
        ? error.message
        : "Failed to process score submission";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { isNonceUsed, markNonceAsUsed } from "./nonceStore";
import { GameSession, NoncePayload } from "../types";
import jwt from "jsonwebtoken";

const GENERIC_ERROR = "Invalid request. Please try again.";

export async function validateNonce(
  nonce: string,
  session: GameSession
): Promise<{
  success: boolean;
  response?: NextResponse;
}> {
  try {
    console.log("🔍 Validating nonce:", {
      nonceReceived: !!nonce,
      nonceLength: nonce?.length,
      sessionId: session.sessionId,
      player: session.player,
    });

    // Check if nonce exists
    if (!nonce) {
      console.error("❌ No nonce provided");
      return {
        success: false,
        response: NextResponse.json({ error: GENERIC_ERROR }, { status: 400 }),
      };
    }

    // Check if nonce was already used
    const alreadyUsed = await isNonceUsed(nonce);
    console.log("🔍 Nonce usage check:", {
      nonce: nonce.substring(0, 20) + "...",
      alreadyUsed,
    });

    if (alreadyUsed) {
      console.error("❌ Nonce already used:", nonce.substring(0, 20) + "...");
      return {
        success: false,
        response: NextResponse.json({ error: GENERIC_ERROR }, { status: 400 }),
      };
    }

    // Verify JWT nonce
    let nonceData: NoncePayload;
    try {
      console.log("🔍 Verifying JWT nonce...");
      nonceData = jwt.verify(nonce, process.env.JWT_SECRET!) as NoncePayload;

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
          return {
            success: false,
            response: NextResponse.json(
              { error: GENERIC_ERROR },
              { status: 400 }
            ),
          };
        } else if (jwtError.name === "JsonWebTokenError") {
          return {
            success: false,
            response: NextResponse.json(
              { error: GENERIC_ERROR },
              { status: 400 }
            ),
          };
        }
      }

      return {
        success: false,
        response: NextResponse.json({ error: GENERIC_ERROR }, { status: 400 }),
      };
    }

    // Verify nonce belongs to current session
    if (nonceData.sessionId !== session.sessionId) {
      console.error("❌ Nonce session mismatch:", {
        nonceSessionId: nonceData.sessionId,
        currentSessionId: session.sessionId,
      });
      return {
        success: false,
        response: NextResponse.json({ error: GENERIC_ERROR }, { status: 400 }),
      };
    }

    // Verify nonce player matches session player
    if (nonceData.player.toLowerCase() !== session.player.toLowerCase()) {
      console.error("❌ Nonce player mismatch:", {
        noncePlayer: nonceData.player,
        sessionPlayer: session.player,
      });
      return {
        success: false,
        response: NextResponse.json({ error: GENERIC_ERROR }, { status: 400 }),
      };
    }

    // Check if nonce is too old (5 minutes)
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
      return {
        success: false,
        response: NextResponse.json({ error: GENERIC_ERROR }, { status: 400 }),
      };
    }

    // Mark nonce as used
    await markNonceAsUsed(nonce);
    console.log("✅ Nonce marked as used successfully");

    console.log("✅ Nonce validation completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Unexpected error in nonce validation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      response: NextResponse.json(
        {
          error: GENERIC_ERROR,
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
        { status: 400 }
      ),
    };
  }
}

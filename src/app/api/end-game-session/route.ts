import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SessionData } from "@/src/types";

// In-memory session tracking (matches submit-score implementation)
const activeSessions = new Map<
  string,
  {
    sessionId: string;
    player: string;
    startTime: number;
    lastActivity: number;
  }
>();

// Session statistics tracking
const sessionStats = new Map<
  string,
  {
    totalScore: number;
    totalTransactions: number;
    submissionCount: number;
    startTime: number;
    endTime?: number;
  }
>();

export async function POST(request: Request) {
  try {
    // 1. VALIDATE AUTHORIZATION HEADER
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);

    // 2. VALIDATE REQUEST BODY
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 }
      );
    }

    // 3. VALIDATE AND DECODE JWT TOKEN
    let sessionData: SessionData;
    try {
      sessionData = jwt.verify(token, process.env.JWT_SECRET!) as SessionData;

      // Verify the session ID matches the token
      if (sessionData.sessionId !== sessionId) {
        return NextResponse.json(
          { message: "Session ID mismatch" },
          { status: 401 }
        );
      }
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { message: "Invalid or expired session token" },
        { status: 401 }
      );
    }

    // 4. VALIDATE SESSION EXISTS AND IS ACTIVE
    const activeSession = activeSessions.get(sessionId);
    if (!activeSession) {
      // Session might not be tracked in memory (server restart), but JWT is valid
      console.warn(
        `Session ${sessionId} not found in active sessions, but JWT is valid`
      );
    } else if (activeSession.player !== sessionData.player) {
      return NextResponse.json(
        { message: "Session player mismatch" },
        { status: 401 }
      );
    }

    // 5. CALCULATE SESSION DURATION
    const endTime = Date.now();
    const sessionDuration = endTime - sessionData.startTime;
    const sessionDurationMinutes = Math.round(sessionDuration / 60000);

    // 6. COLLECT FINAL SESSION STATISTICS
    const currentStats = sessionStats.get(sessionId) || {
      totalScore: 0,
      totalTransactions: 0,
      submissionCount: 0,
      startTime: sessionData.startTime,
    };

    // 7. SESSION CLEANUP
    try {
      // Remove from active sessions
      if (activeSessions.has(sessionId)) {
        activeSessions.delete(sessionId);
        console.log(`Removed session ${sessionId} from active sessions`);
      }

      // Archive session statistics (in production, save to database)
      sessionStats.set(sessionId, currentStats);

      // Clean up old session stats (keep last 1000 sessions to prevent memory issues)
      if (sessionStats.size > 1000) {
        const oldestSessionIds = Array.from(sessionStats.keys()).slice(
          0,
          -1000
        );
        oldestSessionIds.forEach(id => sessionStats.delete(id));
      }

      console.log(`Successfully ended game session: ${sessionId}`, {
        player: sessionData.player,
        duration: sessionDurationMinutes,
        totalScore: currentStats.totalScore,
        totalTransactions: currentStats.totalTransactions,
        submissionCount: currentStats.submissionCount,
      });
    } catch (cleanupError) {
      console.error("Error during session cleanup:", cleanupError);
      // Continue with response even if cleanup partially fails
    }

    // 8. RETURN SUCCESS RESPONSE WITH SESSION SUMMARY
    return NextResponse.json(
      {
        success: true,
        message: "Game session ended successfully",
        sessionSummary: {
          sessionId,
          player: sessionData.player,
          duration: sessionDurationMinutes,
          durationMs: sessionDuration,
          startTime: sessionData.startTime,
          endTime,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error ending game session:", error);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorMessage =
      isDevelopment && error instanceof Error
        ? error.message
        : "Internal server error";

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

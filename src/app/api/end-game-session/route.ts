import { getSessionFromRequest } from "@/src/lib/getSessionFromRequest";
import { endSession } from "@/src/lib/sessions";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getSessionFromRequest();

    if (!session) {
      return NextResponse.json(
        { message: "No active session found" },
        { status: 401 }
      );
    }

    // End the session
    const ended = await endSession(session.sessionId);

    if (ended) {
      const response = NextResponse.json({ success: true });

      // Clear the session cookie
      response.cookies.delete("game_session");

      return response;
    }

    return NextResponse.json(
      { message: "Failed to end session" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error ending session:", error);
    return NextResponse.json(
      { message: "Failed to end session" },
      { status: 500 }
    );
  }
}

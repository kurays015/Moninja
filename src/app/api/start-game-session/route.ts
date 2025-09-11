import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const privy_token = (await cookies()).get("privy-token");
    const { walletAddress } = await request.json();

    if (!walletAddress || !privy_token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();

    const payload = {
      player: walletAddress,
      sessionId,
      privy_token,
    };

    const sessionToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return NextResponse.json(
      {
        success: true,
        sessionToken,
        sessionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating game session:", error);
    return NextResponse.json(
      { message: "Failed to create game session" },
      { status: 500 }
    );
  }
}

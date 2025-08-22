import { UserData } from "@/src/types";
import { NextResponse } from "next/server";

const API_BASE_URL = "https://monad-games-id-site.vercel.app/api";

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${API_BASE_URL}/check-wallet?wallet=${walletAddress}`
    );

    if (!res.ok) {
      const errorDetails = await res.json();
      return NextResponse.json(
        { error: "Failed to check wallet", details: errorDetails },
        { status: res.status }
      );
    }

    const data: UserData = await res.json();

    if (!data || !data.hasUsername) {
      return NextResponse.json(
        { error: "No username found for this wallet" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error Checking Wallet:", error);

    return NextResponse.json(
      {
        error: "Failed to check wallet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

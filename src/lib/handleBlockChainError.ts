import { NextResponse } from "next/server";

export function handleBlockchainError(blockchainError: unknown): NextResponse {
  console.error("❌ Blockchain transaction failed:", blockchainError);

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

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection")
    ) {
      return NextResponse.json(
        { error: "Network connection error - please try again" },
        { status: 503 }
      );
    }
  }

  return NextResponse.json(
    { error: "Blockchain transaction failed" },
    { status: 500 }
  );
}

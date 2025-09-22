export function validateGameData({
  player,
  scoreAmount,
  transactionAmount,
}: {
  player: string;
  scoreAmount: number;
  transactionAmount: number;
}): { success: boolean; error?: string } {
  if (!player) {
    return { success: false, error: "Player address is required" };
  }

  if (!player.startsWith("0x") || player.length !== 42) {
    return { success: false, error: "Invalid player address format" };
  }

  if (
    typeof scoreAmount !== "number" ||
    scoreAmount < 0 ||
    !Number.isInteger(scoreAmount)
  ) {
    return { success: false, error: "Invalid score amount" };
  }

  if (
    typeof transactionAmount !== "number" ||
    transactionAmount < 0 ||
    transactionAmount > 1 ||
    !Number.isInteger(transactionAmount)
  ) {
    return { success: false, error: "Invalid transaction amount" };
  }

  // Additional business logic validation
  const MAX_SCORE = 1000000; // Example max score
  const MAX_TRANSACTIONS = 10000; // Example max transactions

  if (scoreAmount > MAX_SCORE) {
    return { success: false, error: `Score cannot exceed ${MAX_SCORE}` };
  }

  if (transactionAmount > MAX_TRANSACTIONS) {
    return {
      success: false,
      error: `Transaction amount cannot exceed ${MAX_TRANSACTIONS}`,
    };
  }

  return { success: true };
}

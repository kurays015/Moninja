import { z } from "zod";

export const updatePlayerDataSchema = z.object({
  player: z
    .string()
    .min(42, "Address too short")
    .max(42, "Address too long")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Wallet address format")
    .refine(
      address =>
        address.toLowerCase() !== "0x0000000000000000000000000000000000000000",
      {
        message: "Cannot use zero address",
      }
    ),
  scoreAmount: z
    .number()
    .min(0, "Score amount cannot be negative")
    .int("Score amount must be an integer")
    .finite("Score amount must be a valid number"),
  transactionAmount: z
    .number()
    .min(0, "Transaction amount cannot be negative")
    .finite("Transaction amount must be a valid number"),
  sessionId: z.string().min(1, "Session ID is required").trim(),
});

// Type inference for TypeScript
export type UpdatePlayerData = z.infer<typeof updatePlayerDataSchema>;

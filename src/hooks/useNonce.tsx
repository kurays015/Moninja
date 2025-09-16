// hooks/useNonce.ts
import { useCallback } from "react";

export const useNonce = (gameSessionToken: string | null) => {
  const generateNonce = useCallback(
    async (sessionId: string, player: string, gameStartTime?: number) => {
      if (!gameSessionToken) throw new Error("No session token");

      const response = await fetch("/api/generate-nonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gameSessionToken}`,
        },
        body: JSON.stringify({
          sessionId,
          player,
          gameStartTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate nonce");
      }

      const { nonce } = await response.json();
      return nonce;
    },
    [gameSessionToken]
  );

  return { generateNonce };
};

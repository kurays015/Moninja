// hooks/useNonce.ts
import { useCallback } from "react";

export const useNonce = () => {
  // Remove gameSessionToken parameter
  const generateNonce = useCallback(
    async (player: string, gameStartTime?: number) => {
      // Remove sessionId parameter
      const response = await fetch("/api/generate-nonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
        credentials: "include", // Include HTTP-only cookies
        body: JSON.stringify({
          // Remove sessionId from body - server gets it from cookie
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
    [] // Remove gameSessionToken dependency
  );

  return { generateNonce };
};

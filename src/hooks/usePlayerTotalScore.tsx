"use client";

import { useQuery } from "@tanstack/react-query";
import { api, apiEndpoints } from "../lib/api";
import { PlayerScoreResponse } from "../types";

export function usePlayerTotalScore(
  walletAddress: string | null,
  gameStarted: boolean,
  gameOver: boolean
) {
  const shouldRefetch = gameStarted && !gameOver;

  return useQuery({
    queryKey: ["playerTotalScore", walletAddress],
    queryFn: async (): Promise<PlayerScoreResponse> => {
      if (!walletAddress) {
        throw new Error("No wallet address provided");
      }

      const { data } = await api.post<PlayerScoreResponse>(
        apiEndpoints.getPlayerTotalScore,
        {
          walletAddress,
        }
      );

      return data;
    },
    enabled: !!walletAddress,
    staleTime: 0,
    gcTime: 1000 * 60 * 2,
    retry: 20,
    refetchInterval: shouldRefetch ? 5000 : false,
    refetchIntervalInBackground: shouldRefetch,
  });
}

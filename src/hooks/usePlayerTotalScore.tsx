"use client";

import { useQuery } from "@tanstack/react-query";
import { api, apiEndpoints } from "../lib/api";

interface PlayerScoreResponse {
  totalScore: number;
}

export function usePlayerTotalScore(walletAddress: string | null) {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}

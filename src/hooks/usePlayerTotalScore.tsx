"use client";

import { useQuery } from "@tanstack/react-query";
import { api, apiEndpoints } from "../lib/api";
import { PlayerScoreResponse } from "../types";

export function usePlayerTotalScore({
  walletAddress,
}: {
  walletAddress: string | null;
}) {
  return useQuery({
    queryKey: ["playerTotalScore", walletAddress] as const,
    queryFn: async (): Promise<PlayerScoreResponse> => {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      const { data } = await api.post<PlayerScoreResponse>(
        apiEndpoints.getPlayerTotalScore,
        { walletAddress }
      );
      return data;
    },
    enabled: !!walletAddress,
    // Fetch once and cache for a long time
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    // Disable all automatic refetching
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Simple retry
    retry: 1,
  });
}

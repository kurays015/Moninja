"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api, apiEndpoints } from "../lib/api";
import { PlayerScoreResponse } from "../types";

interface UsePlayerTotalScoreOptions {
  walletAddress: string | null;
  gameStarted: boolean;
  gameOver: boolean;
}

const REFETCH_INTERVAL = 15000; // 15 seconds
const STALE_TIME = 10000; // 10 seconds
const GC_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

export function usePlayerTotalScore({
  walletAddress,
  gameStarted,
  gameOver,
}: UsePlayerTotalScoreOptions) {
  // Memoize conditions to prevent unnecessary re-renders
  const isEnabled = useMemo(() => !!walletAddress, [walletAddress]);
  const shouldRefetch = useMemo(
    () => gameStarted && !gameOver,
    [gameStarted, gameOver]
  );

  return useQuery({
    queryKey: ["playerTotalScore", walletAddress] as const,
    queryFn: async (): Promise<PlayerScoreResponse> => {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      try {
        const { data } = await api.post<PlayerScoreResponse>(
          apiEndpoints.getPlayerTotalScore,
          { walletAddress }
        );
        return data;
      } catch (error) {
        // Enhanced error handling
        if (error instanceof Error) {
          throw new Error(`Failed to fetch player score: ${error.message}`);
        }
        throw new Error("Failed to fetch player score");
      }
    },
    enabled: isEnabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: MAX_RETRIES,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: shouldRefetch ? REFETCH_INTERVAL : false,
    refetchIntervalInBackground: shouldRefetch,
    // Prevent refetch on window focus during active game
    refetchOnWindowFocus: !shouldRefetch,
    // Network recovery
    refetchOnReconnect: true,
    // Throw on error for better error boundary handling
    throwOnError: false,
  });
}

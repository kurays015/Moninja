"use client";

import { useQuery } from "@tanstack/react-query";
import { api, apiEndpoints } from "../lib/api";

interface UsernameResponse {
  hasUsername: boolean;
  user?: {
    username: string;
  };
  error?: string;
}

export function useUsername(walletAddress: string | null) {
  return useQuery({
    queryKey: ["username", walletAddress],
    queryFn: async (): Promise<UsernameResponse> => {
      if (!walletAddress) {
        throw new Error("No wallet address provided");
      }

      const { data } = await api.post<UsernameResponse>(
        apiEndpoints.checkWallet,
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

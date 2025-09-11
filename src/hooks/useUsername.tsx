"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, apiEndpoints } from "../lib/api";
import { UsernameResponse } from "../types";

export function useUsername(walletAddress: string | null) {
  const query = useQuery({
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
    staleTime: Infinity,
    enabled: !!walletAddress,
    refetchInterval: false,
  });

  // Stop refetching when username is found
  useEffect(() => {
    if (query.data?.hasUsername && query.data?.user?.username) {
      console.log(
        "Username found, disabling refetch interval:",
        query.data.user.username
      );
    }
  }, [query.data]);

  return query;
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";
import axios from "axios";

export interface LeaderboardResponse {
  rank: number;
  walletAddress: string;
  username: string;
  score: number;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const { data } = await axios.get<LeaderboardResponse>(
        apiEndpoints.leaderBoard
      );
      return data;
    },
    retry: 5,
  });
}

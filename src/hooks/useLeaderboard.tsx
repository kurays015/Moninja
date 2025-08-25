"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";
import axios from "axios";

interface LeaderBoardData {
  userId: number;
  rank: number;
  walletAddress: string;
  username: string;
  score: number;
}

export interface LeaderboardResponse {
  data: {
    data: LeaderBoardData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function useLeaderboard(page: number) {
  return useQuery({
    queryKey: ["leaderboard", page], // Include page in query key
    queryFn: async (): Promise<LeaderboardResponse> => {
      const { data } = await axios.get<LeaderboardResponse>(
        apiEndpoints.leaderBoard,
        { params: { page } }
      );
      return data;
    },
    retry: 5,
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiEndpoints } from "../lib/api";
import {
  EndGameSessionRequest,
  StartGameSessionRequest,
  StartGameSessionResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from "../types";

export function useGameSession(gameSessionToken: string | null) {
  const queryClient = useQueryClient();

  const startGameSession = useMutation({
    mutationFn: async (
      data: StartGameSessionRequest
    ): Promise<StartGameSessionResponse> => {
      const response = await api.post<StartGameSessionResponse>(
        apiEndpoints.startGameSession,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries when session starts
      queryClient.invalidateQueries({ queryKey: ["playerTotalScore"] });
    },
  });

  const endGameSession = useMutation({
    mutationFn: async (data: EndGameSessionRequest): Promise<void> => {
      if (!gameSessionToken) {
        throw new Error("No session token available");
      }
      await api.post(apiEndpoints.endGameSession, data, {
        headers: {
          Authorization: `Bearer ${gameSessionToken}`,
        },
      });
    },
    onSuccess: () => {
      // Invalidate related queries when session ends
      queryClient.invalidateQueries({ queryKey: ["playerTotalScore"] });
    },
  });

  const submitScore = useMutation({
    mutationFn: async (
      data: SubmitScoreRequest
    ): Promise<SubmitScoreResponse> => {
      if (!gameSessionToken) {
        throw new Error("No session token available");
      }
      const response = await api.post<SubmitScoreResponse>(
        apiEndpoints.submitScore,
        data,
        {
          headers: {
            Authorization: `Bearer ${gameSessionToken}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate player score queries when score is submitted
      queryClient.invalidateQueries({ queryKey: ["playerTotalScore"] });
    },
  });

  return {
    startGameSession,
    endGameSession,
    submitScore,
  };
}

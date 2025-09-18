"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiEndpoints } from "../lib/api";
import {
  GenerateNonceRequest,
  StartGameSessionRequest,
  StartGameSessionResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from "../types";

export function useGameSession() {
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
      queryClient.invalidateQueries({ queryKey: ["playerTotalScore"] });
    },
  });

  const endGameSession = useMutation({
    mutationFn: async (): Promise<void> => {
      // Remove data parameter
      await api.post(apiEndpoints.endGameSession, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerTotalScore"] });
    },
  });

  const submitScore = useMutation({
    mutationFn: async (
      data: SubmitScoreRequest
    ): Promise<SubmitScoreResponse> => {
      const response = await api.post<SubmitScoreResponse>(
        apiEndpoints.submitScore,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerTotalScore"] });
    },
  });

  const generateNonce = useMutation({
    mutationFn: async (data: GenerateNonceRequest): Promise<string> => {
      const dynamicEndpoint = apiEndpoints.generateNonce();

      const response = await api.post(dynamicEndpoint, data);
      console.log(response);
      return response.data.nonce;
    },
    retry: false,
  });

  return {
    startGameSession,
    endGameSession,
    submitScore,
    generateNonce,
  };
}

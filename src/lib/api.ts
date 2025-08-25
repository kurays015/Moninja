"use client";

import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "" : "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth headers
api.interceptors.request.use(
  config => {
    // You can add global auth headers here if needed
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error("Unauthorized request");
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  checkWallet: "/api/check-wallet",
  getPlayerTotalScore: "/api/get-player-total-score",
  startGameSession: "/api/start-game-session",
  endGameSession: "/api/end-game-session",
  submitScore: "/api/submit-score",
  leaderBoard: "/api/leaderboard",
} as const;

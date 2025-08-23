"use client";

import { useEffect, useState, useCallback } from "react";

export function useUsername(walletAddress: string | null) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsername = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/check-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch username");
      }

      const data = await res.json();

      if (!data.hasUsername) {
        setUsername(null);
        setError(data.error || "No username found");
        return;
      }

      setUsername(data.user.username || null);
      setError(null);
    } catch (error) {
      setUsername(null);
      setError(
        error instanceof Error ? error.message : "Failed to fetch username"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch username when wallet address changes
  useEffect(() => {
    if (!walletAddress) {
      setUsername(null);
      setError(null);
      return;
    }

    fetchUsername(walletAddress);
  }, [walletAddress, fetchUsername]);

  // Auto-refetch username every 15 seconds for users without username
  useEffect(() => {
    if (!walletAddress || username) return;

    const usernameInterval = setInterval(() => {
      fetchUsername(walletAddress);
    }, 15000);

    return () => clearInterval(usernameInterval);
  }, [walletAddress, username, fetchUsername]);

  // Manual refresh function
  const refetch = useCallback(() => {
    if (walletAddress) {
      fetchUsername(walletAddress);
    }
  }, [walletAddress, fetchUsername]);

  return {
    username,
    isLoading,
    error,
    refetch,
  };
}

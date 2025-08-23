"use client";

import { useEffect, useState, useCallback } from "react";

export function usePlayerTotalScore(walletAddress: string | null) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/get-player-total-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!res.ok) throw new Error("Failed to fetch score");

      const data = await res.json();

      setScore(data?.totalScore ?? 0);
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) {
      setScore(null);
      return;
    }

    fetchScore();
  }, [walletAddress, fetchScore]);

  // Refetch function that can be called manually
  const refetch = useCallback(() => {
    fetchScore();
  }, [fetchScore]);

  return { score, loading, error, refetch };
}

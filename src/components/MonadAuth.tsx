"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { AuthState } from "../types";
import { useCrossAppAccount } from "../hooks/useCrossAppAccount";
import Moninja from "./Moninja";
import Link from "next/link";
import { usePlayerTotalScore } from "../hooks/usePlayerTotalScore";
import Image from "next/image";

export default function MonadAuth() {
  const { authenticated, user, ready, logout, login } = usePrivy();
  const { crossAppAccount, walletAddress } = useCrossAppAccount();

  const [authState, setAuthState] = useState<AuthState>({
    accountAddress: null,
    username: null,
    isLoadingUsername: false,
    message: "",
    error: null,
  });

  const { score } = usePlayerTotalScore(walletAddress);

  // Handle username fetching
  const handleUsernameFetch = useCallback(async (address: string) => {
    setAuthState(prev => ({
      ...prev,
      isLoadingUsername: true,
      error: null,
    }));

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
        setAuthState(prev => ({
          ...prev,
          username: null,
          isLoadingUsername: false,
          error: data.error,
        }));
        return;
      }

      setAuthState(prev => ({
        ...prev,
        username: data.user.username || null,
        isLoadingUsername: false,
        error: null,
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        username: null,
        isLoadingUsername: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch username",
      }));
    }
  }, []);

  // Main authentication effect
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      const newState: AuthState = {
        accountAddress: null,
        username: null,
        isLoadingUsername: false,
        message: "Please connect your wallet to continue.",
        error: null,
      };
      setAuthState(newState);
      return;
    }

    if (!user?.linkedAccounts?.length) {
      const newState: AuthState = {
        accountAddress: null,
        username: null,
        isLoadingUsername: false,
        message: "You need to link your Monad Games ID account to continue.",
        error: null,
      };
      setAuthState(newState);
      return;
    }

    if (!crossAppAccount) {
      const newState: AuthState = {
        accountAddress: null,
        username: null,
        isLoadingUsername: false,
        message: "Monad Games ID account not found in linked accounts.",
        error: null,
      };
      setAuthState(newState);
      return;
    }

    if (!walletAddress) {
      const newState: AuthState = {
        accountAddress: null,
        username: null,
        isLoadingUsername: false,
        message: "No embedded wallets found in your Monad Games ID account.",
        error: null,
      };
      setAuthState(newState);
      return;
    }

    // Success case
    setAuthState(prev => ({
      ...prev,
      accountAddress: walletAddress,
      message: "",
      error: null,
    }));
    handleUsernameFetch(walletAddress);
  }, [
    ready,
    authenticated,
    user?.linkedAccounts,
    crossAppAccount,
    walletAddress,
    handleUsernameFetch,
  ]);

  // Memoized button handlers
  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Moninja🥷
          </h2>
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white mb-4"></div>
            <p className="text-lg font-medium">Preparing your blade...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Moninja🥷</h1>
            <p className="text-white/80 text-lg">Slice your way to victory!</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center space-x-4 mb-6">
              <div className="w-16 h-16 relative">
                <Image
                  src="/monanimals/4ksalmonad.png"
                  alt="4ksalmonad"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  draggable={false}
                />
              </div>
              <div className="w-16 h-16 relative">
                <Image
                  src="/monanimals/Chog.png"
                  alt="Chog"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                  draggable={false}
                />
              </div>
              <div className="w-16 h-16 relative">
                <Image
                  src="/monanimals/cutlandak2.png"
                  alt="cutlandak2"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                  draggable={false}
                />
              </div>
              <div className="w-16 h-16 relative">
                <Image
                  src="/monanimals/fish_nad.png"
                  alt="fish_nad"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  style={{ animationDelay: "0.6s" }}
                  draggable={false}
                />
              </div>
            </div>
            <p className="text-white/70">
              Connect your Monad Games ID to start slashing monanimals to climb
              to the leaderboard!
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 rounded-2xl font-bold text-lg text-black shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
          >
            ⚔️ Connect & Play
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Minimal Game UI Overlay */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-3 min-w-[200px]">
          {authState.accountAddress ? (
            // Success state - Compact Player Profile
            <div className="space-y-2">
              {/* Header with logout */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">
                    Connected
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <svg
                    className="w-3 h-3 text-white/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>

              {/* Player Info - Compact */}
              <div className="text-center space-y-1">
                {authState.isLoadingUsername ? (
                  <div className="flex items-center justify-center gap-1 text-white/70">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : authState.username ? (
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      @{authState.username}
                    </h3>
                    <p className="text-xs text-white/50 font-mono">
                      {authState.accountAddress.slice(0, 6)}...
                      {authState.accountAddress.slice(-4)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-yellow-400 text-xs font-medium">
                      Anonymous Ninja
                    </p>
                    <Link
                      href="https://monad-games-id-site.vercel.app"
                      className="text-yellow-400 hover:text-yellow-300 underline text-xs"
                      target="_blank"
                      referrerPolicy="no-referrer"
                    >
                      Create Username →
                    </Link>
                  </div>
                )}
              </div>

              {/* Compact Stats */}
              <div className="border-t border-white/10 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{score}</div>
                  <div className="text-xs text-white/60">Total Score</div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-lg font-bold text-yellow-400">-</div>
                  <div className="text-xs text-white/60">Rank</div>
                </div>
              </div>
            </div>
          ) : (
            // Error state - Compact
            <div className="text-center space-y-2">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-3 h-3 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-yellow-400 text-xs">{authState.message}</p>
              <button
                onClick={handleLogout}
                className="w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-colors rounded text-red-300 text-xs font-medium"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10">
        <Moninja />
      </div>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Moninja from "./Moninja";
import Image from "next/image";

export default function MonadAuth() {
  const { authenticated, ready, login } = usePrivy();

  // Memoized button handlers
  const handleLogin = useCallback(() => {
    login();
  }, [login]);

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
      {/* Game Area */}
      <div className="relative z-10">
        <Moninja />
      </div>
    </div>
  );
}

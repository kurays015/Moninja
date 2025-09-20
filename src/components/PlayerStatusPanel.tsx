import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { PlayerScoreResponse, UsernameResponse } from "../types";

interface ResponsiveUserProfileProps {
  isLoadingUserName: boolean;
  walletAddress: string | null;
  usernameData: UsernameResponse | undefined;
  playerScoreData: PlayerScoreResponse | undefined;
  isScoreLoading: boolean;
}

export default function ResponsiveUserProfile({
  isLoadingUserName,
  usernameData,
  walletAddress,
  playerScoreData,
  isScoreLoading,
}: ResponsiveUserProfileProps) {
  const { logout } = usePrivy();

  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {/* Portrait Mode - Larger, More Readable Profile */}
      <div className="absolute top-4 right-4 z-50">
        <div>
          {usernameData?.hasUsername ? (
            <div className="absolute top-0 right-0 z-50">
              <div className="relative inline-block">
                {/* Toggle button */}
                <button
                  onTouchEnd={() => setIsVisible(!isVisible)}
                  onMouseDown={e => e.stopPropagation()}
                  onTouchStart={e => e.stopPropagation()}
                  onClick={() => setIsVisible(!isVisible)}
                  className="px-2 py-1 text-xs font-semibold bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors duration-200 flex items-center justify-center"
                >
                  {isVisible ? <Minus size={14} /> : <Plus size={14} />}
                </button>

                {/* Panel with smooth transitions */}
                <div
                  className={`absolute top-full right-0 mt-1 w-44 transition-all duration-300 ease-in-out ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="space-y-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/20 shadow-lg p-2">
                    {/* Compact header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-medium">
                          Connected
                        </span>
                      </div>
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onTouchEnd={() => logout()}
                        onClick={() => logout()}
                        className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                        title="Disconnect"
                      >
                        <svg
                          className="w-5 h-5 text-white/70"
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

                    {usernameData?.hasUsername ? (
                      <>
                        {/* Compact user info */}
                        <div className="text-center space-y-1">
                          {isLoadingUserName ? (
                            <div className="flex items-center justify-center gap-1 text-white/70">
                              <div className="w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span className="text-xs">Loading...</span>
                            </div>
                          ) : usernameData?.user?.username ? (
                            <div className="space-y-0.5">
                              <h3 className="text-xs font-bold text-white">
                                @{usernameData.user.username}
                              </h3>
                              <p className="text-xs text-white/50 font-mono">
                                {walletAddress?.slice(0, 4)}...
                                {walletAddress?.slice(-3)}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="text-yellow-400 text-xs font-medium">
                                Anonymous Ninja
                              </p>
                              <p className="text-xs text-white/50">
                                Create username
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Compact stats */}
                        <div className="border-t border-white/10 pt-1.5">
                          <div className="text-center">
                            <div className="text-sm font-bold text-white">
                              {isScoreLoading
                                ? "Loading..."
                                : playerScoreData?.totalScore || 0}
                            </div>
                            <div className="text-xs text-white/60">
                              Total Scores
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Compact no-username prompt */
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse mr-1"></div>
                          <span className="text-yellow-400 text-xs">
                            No username
                          </span>
                        </div>
                        <Link
                          href="https://www.monadclip.fun"
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded text-yellow-300 hover:text-yellow-200 transition-all duration-200 text-xs font-medium w-full"
                          target="_blank"
                          referrerPolicy="no-referrer"
                        >
                          <svg
                            className="w-2.5 h-2.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span>Create username</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // No username - minimal prompt
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <Link
                href="https://www.monadclip.fun"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-lg text-yellow-300 hover:text-yellow-200 transition-all duration-200 text-xs font-medium"
                target="_blank"
                referrerPolicy="no-referrer"
              >
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span className="hidden sm:inline">
                  Create a username to play
                </span>
                <span className="sm:hidden">Create username</span>
              </Link>
              <button
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={() => logout()}
                onClick={() => logout()}
                className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                title="Disconnect"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white/70"
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
          )}
        </div>
      </div>
    </>
  );
}

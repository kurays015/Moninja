"use client";

import { useState } from "react";
import { Trophy, Medal, Award, User } from "lucide-react";

export default function Leaderboard() {
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);

  // Dummy data - replace with your actual data later
  const leaderboardData = [
    {
      rank: 1,
      walletAddress: "0x742d...4B73",
      username: "CryptoKing",
      score: 15420,
    },
    {
      rank: 2,
      walletAddress: "0x8A5C...2D91",
      username: "BlockMaster",
      score: 14850,
    },
    {
      rank: 3,
      walletAddress: "0x1F3B...7E44",
      username: "DegenLegend",
      score: 13990,
    },
    {
      rank: 4,
      walletAddress: "0x9D2A...8C56",
      username: "TokenHunter",
      score: 12750,
    },
    {
      rank: 5,
      walletAddress: "0x4E7F...1A29",
      username: "NFTCollector",
      score: 11840,
    },
    {
      rank: 6,
      walletAddress: "0x6B8D...9F37",
      username: "DeFiGuru",
      score: 10920,
    },
    {
      rank: 7,
      walletAddress: "0x3A1C...5E82",
      username: "YieldFarmer",
      score: 9875,
    },
    {
      rank: 8,
      walletAddress: "0x7C4E...2B91",
      username: "MetaTrader",
      score: 8650,
    },
    {
      rank: 9,
      walletAddress: "0x6B8D...9F37",
      username: "DeFiGuru",
      score: 10920,
    },
    {
      rank: 10,
      walletAddress: "0x3A1C...5E82",
      username: "YieldFarmer",
      score: 9875,
    },
    {
      rank: 11,
      walletAddress: "0x7C4E...2B91",
      username: "MetaTrader",
      score: 8650,
    },
    {
      rank: 12,
      walletAddress: "0x7C4E...2B91",
      username: "MetaTrader",
      score: 8650,
    },
    {
      rank: 13,
      walletAddress: "0x7C4E...2B91",
      username: "MetaTrader",
      score: 8650,
    },
    {
      rank: 14,
      walletAddress: "0x7C4E...2B91",
      username: "MetaTrader",
      score: 8650,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 drop-shadow-lg" />
        );
      case 2:
        return (
          <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 drop-shadow-lg" />
        );
      case 3:
        return (
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 drop-shadow-lg" />
        );
      default:
        return (
          <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs sm:text-sm font-bold text-amber-200 drop-shadow-md">
            #{rank}
          </span>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    const baseStyle = "border border-amber-800/30 shadow-lg backdrop-blur-sm";

    switch (rank) {
      case 1:
        return `${baseStyle} bg-gradient-to-r from-yellow-600/20 to-yellow-500/20`;
      case 2:
        return `${baseStyle} bg-gradient-to-r from-gray-400/20 to-gray-300/20`;
      case 3:
        return `${baseStyle} bg-gradient-to-r from-orange-600/20 to-orange-500/20`;
      default:
        return `${baseStyle} bg-amber-900/10 hover:bg-amber-800/20`;
    }
  };

  return (
    <>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto p-2 sm:p-4 absolute top-2 sm:top-4 left-2 sm:left-0 z-50">
        {/* Main Toggle Button */}
        <div className="mb-2 sm:mb-4 relative z-50">
          <button
            onClick={() => setIsLeaderboardVisible(!isLeaderboardVisible)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-700/90 hover:to-purple-700/90 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative z-50 backdrop-blur-sm border border-blue-500/50 text-xs sm:text-sm"
          >
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
            <span className="drop-shadow-md">
              {isLeaderboardVisible ? "Hide Leaderboard" : "Show Leaderboard"}
            </span>
          </button>
        </div>

        {/* Leaderboard Component */}
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden relative z-10  ${
            isLeaderboardVisible
              ? "opacity-100 max-h-screen"
              : "opacity-0 max-h-0"
          }`}
        >
          <div className="bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-amber-700/30 backdrop-blur-md rounded-lg border border-amber-700/40 shadow-2xl h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] max-h-[500px] sm:max-h-[600px] md:max-h-[700px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 p-2 sm:p-3 border-b border-amber-700/30 bg-gradient-to-r from-amber-800/40 to-amber-700/40 flex-shrink-0">
              <div className="p-1 sm:p-1.5 bg-gradient-to-br from-yellow-600/80 to-yellow-700/80 rounded-md shadow-md border border-yellow-500/50">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-200" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-lg font-bold text-amber-100 drop-shadow-lg truncate">
                  Leaderboard
                </h2>
                <p className="text-xs text-amber-200/80 drop-shadow-md hidden sm:block">
                  Top performers ranked by score
                </p>
              </div>
            </div>

            {/* Leaderboard Content */}
            <div className="p-2 sm:p-3 overflow-y-auto flex-1 wood-scrollbar">
              <div className="space-y-1.5 sm:space-y-2">
                {leaderboardData.map((player, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-2 sm:p-2.5 rounded-md transition-all duration-300 hover:-translate-y-0.5
                      ${getRankStyle(player.rank)}
                      ${index < 3 ? "shadow-lg" : "shadow-md hover:shadow-lg"}
                    `}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0">
                        {getRankIcon(player.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300/80 flex-shrink-0" />
                          <h3 className="font-semibold text-amber-100 truncate text-xs sm:text-sm drop-shadow-md">
                            {player.username}
                          </h3>
                        </div>
                        <p className="text-xs text-amber-200/70 font-mono truncate">
                          {player.walletAddress}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0 ml-1 sm:ml-2">
                      <div className="text-sm sm:text-lg font-bold text-amber-100 drop-shadow-lg">
                        {player.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-amber-200/80 font-medium tracking-wide">
                        POINTS
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

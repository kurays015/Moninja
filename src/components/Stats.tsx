import { GameStats } from "../types";

interface StatsProps {
  gameStarted: boolean;
  score: number;
  gameStats: GameStats;
}

export default function Stats({ gameStarted, score, gameStats }: StatsProps) {
  return (
    <>
      {gameStarted && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
          <div className="bg-yellow-200 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg border-2 sm:border-3 md:border-4 border-yellow-400">
            <div className="text-center">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold sm:font-extrabold text-red-700 drop-shadow-md">
                🍉 {score}
              </span>
              <div className="text-xs sm:text-sm text-amber-700 font-medium mt-1">
                Level {gameStats.speedLevel}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { GameStats } from "../types";

interface GameOverModalProps {
  gameOver: boolean;
  score: number;
  gameStats: GameStats;
  resetGame: () => void;
}

export default function GameOverModal({
  gameOver,
  gameStats,
  resetGame,
  score,
}: GameOverModalProps) {
  return (
    <>
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/30 max-w-md w-[92%] text-center">
            <div className="text-6xl mb-2">💥</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-fuchsia-600">
              Game Over
            </h2>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              You hit a bomb. Better luck next run!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-300/20 p-4 border border-amber-300/40">
                <div className="text-3xl font-extrabold text-amber-600">
                  {score}
                </div>
                <div className="text-xs uppercase tracking-wider text-amber-800/80">
                  Final Score
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-300/20 p-4 border border-sky-300/40">
                <div className="text-3xl font-extrabold text-indigo-600">
                  {gameStats.speedLevel}
                </div>
                <div className="text-xs uppercase tracking-wider text-indigo-800/80">
                  Level Reached
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-300/20 p-4 border border-emerald-300/40 col-span-2">
                <div className="text-xl font-bold text-emerald-700">
                  {gameStats.objectsSliced}
                </div>
                <div className="text-xs uppercase tracking-wider text-emerald-900/80">
                  Fruits Sliced
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { GameObject, GameStats } from "../types";

interface StatsProps {
  gameStarted: boolean;
  score: number;
  objects: GameObject[];
  gameStats: GameStats;
}

export default function Stats({
  gameStarted,
  score,
  objects,
  gameStats,
}: StatsProps) {
  return (
    <>
      {gameStarted && (
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-yellow-200 px-6 py-3 rounded-xl shadow-lg border-4 border-yellow-400">
            <span className="text-3xl font-extrabold text-red-700 drop-shadow-md">
              🍉 {score}
            </span>
          </div>
        </div>
      )}
      {gameStarted && (
        <div className="absolute top-24 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-700">
            Active Objects:{" "}
            <span className="font-bold text-purple-600">{objects.length}</span>
          </p>
          <p className="text-xs text-gray-600">
            Speed Level:{" "}
            <span className="font-bold">{gameStats.speedLevel}</span>
          </p>
        </div>
      )}
    </>
  );
}

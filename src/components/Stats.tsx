interface StatsProps {
  gameStarted: boolean;
  score: number;
}

export default function Stats({ gameStarted, score }: StatsProps) {
  return (
    <>
      {gameStarted && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
          <div className="bg-yellow-200 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg border-2 sm:border-3 md:border-4 border-yellow-400">
            <div className="text-center">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold sm:font-extrabold text-red-700 drop-shadow-md">
                🍉{score}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

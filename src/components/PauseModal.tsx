interface PauseModalProps {
  gamePaused: boolean;
  gameStarted: boolean;
  gameOver: boolean;
  score: number;
}

export default function PauseModal({
  gamePaused,
  gameStarted,
  gameOver,
  score,
}: PauseModalProps) {
  return (
    <>
      {gamePaused && gameStarted && !gameOver && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 text-center max-w-md w-[92%]">
            <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Game Paused
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              The game has been paused because you switched tabs or lost focus.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Click anywhere or return to the tab to resume playing!
            </p>
            <div className="text-xl text-gray-700 bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-2xl border border-purple-200">
              Current Score:{" "}
              <span className="font-bold text-purple-600">{score}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

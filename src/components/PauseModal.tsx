import { WoodStyles } from "./WoodStyle";

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
      <WoodStyles />
      {gamePaused && gameStarted && !gameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div
            className="wood-panel wood-grain wood-texture relative flex flex-col
            w-full max-w-md
            p-6 md:p-8 rounded-3xl shadow-2xl text-center
            border-4 border-amber-800/60"
          >
            {/* Decorative Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-700/10 to-stone-900/20 pointer-events-none rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/5 via-transparent to-amber-800/10 pointer-events-none rounded-3xl"></div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-yellow-100 drop-shadow-xl">
                ⏸️ GAME PAUSED
              </h2>
              <p className="text-sm md:text-base text-yellow-200/90 mb-3 font-medium drop-shadow-lg max-w-sm">
                The game has been paused because you switched tabs or lost
                focus.
              </p>
              <p className="text-xs md:text-sm text-yellow-300/90 mb-6 font-medium drop-shadow-md">
                Click anywhere or return to the tab to resume playing!
              </p>

              {/* Score Card */}
              <div className="wood-stat-card wood-texture rounded-2xl p-4 w-full max-w-xs mx-auto">
                <div className="text-xl md:text-2xl font-bold text-yellow-200 drop-shadow-lg">
                  {score}
                </div>
                <div className="text-xs uppercase tracking-wider text-yellow-300/90 font-bold">
                  🍉Current Score
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

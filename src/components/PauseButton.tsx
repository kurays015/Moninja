import { memo } from "react";

interface PauseButtonProps {
  gameStarted: boolean;
  gamePaused: boolean;
  gameOver: boolean;
  bombHit: boolean;
  onTogglePause: () => void;
}

export function PauseButton({
  bombHit,
  gameOver,
  gamePaused,
  gameStarted,
  onTogglePause,
}: PauseButtonProps) {
  return (
    <>
      {/* Manual Pause Toggle Button - Bottom Right */}
      {gameStarted && !gameOver && !bombHit && (
        <div className="absolute bottom-6 right-6 z-50">
          <button
            onTouchEnd={onTogglePause}
            onClick={onTogglePause}
            className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg hover:bg-black/80 transition-all duration-200 flex items-center justify-center group"
            aria-label={gamePaused ? "Resume Game" : "Pause Game"}
          >
            {gamePaused ? (
              // Play icon
              <svg
                className="w-6 h-6 text-white group-hover:text-green-400 transition-colors ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              // Pause icon
              <svg
                className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </>
  );
}

export default memo(PauseButton);

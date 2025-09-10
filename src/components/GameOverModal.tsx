import Image from "next/image";
import { GameStats } from "../types";
import { WoodStyles } from "./WoodStyle";

interface GameOverModalProps {
  gameOver: boolean;
  gameStats: GameStats;
  resetGame: () => void;
}

export default function GameOverModal({
  gameOver,
  gameStats,
  resetGame,
}: GameOverModalProps) {
  const handleButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Stop event from bubbling to parent game area
    e.stopPropagation();
    e.preventDefault();

    // Call reset game
    resetGame();
  };

  return (
    <>
      <WoodStyles />
      {gameOver && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          // Prevent game area events from interfering
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
        >
          <div
            className="wood-panel wood-grain wood-texture relative
            w-full max-w-md 
            landscape:max-w-3/6 landscape:max-h-[90vh] landscape:overflow-hidden
            portrait:w-[95%] portrait:max-w-lg
            p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl text-center
            border-4 border-amber-800/60"
          >
            {/* Decorative wood overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-700/10 to-stone-900/20 pointer-events-none rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/5 via-transparent to-amber-800/10 pointer-events-none rounded-3xl"></div>

            {/* Content Container */}
            <div className="relative z-10 landscape:flex landscape:items-center landscape:gap-8 landscape:text-left portrait:block">
              {/* Header Section */}
              <div className="landscape:flex-1 portrait:mb-6">
                <div className="text-4xl md:text-6xl landscape:text-5xl mb-3">
                  <Image
                    src="/monanimals/chog.png"
                    height={50}
                    width={50}
                    alt="chog"
                  />
                </div>
                <h2 className="text-2xl md:text-4xl landscape:text-3xl font-extrabold mb-3 text-yellow-100 drop-shadow-xl">
                  BATTLE ENDED
                </h2>
                <p className="text-sm md:text-lg landscape:text-base text-yellow-200/90 mb-4 font-medium drop-shadow-lg">
                  Your blade met it&apos;s match! The bomb has claimed victory.
                </p>
              </div>

              {/* Stats Section */}
              <div className="landscape:flex-1 portrait:mb-6">
                <div className="grid grid-cols-2 landscape:grid-cols-1 landscape:gap-4 gap-3 landscape:max-w-sm">
                  <div className="wood-stat-card wood-texture rounded-2xl p-3 landscape:p-4 col-span-2 landscape:col-span-1">
                    <div className="text-xl landscape:text-2xl font-bold text-yellow-200 drop-shadow-lg">
                      {gameStats.objectsSliced}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-yellow-300/90 font-bold">
                      🍉score
                    </div>
                  </div>

                  <div className="wood-stat-card wood-texture rounded-2xl p-3 landscape:p-4">
                    <div className="text-2xl landscape:text-3xl font-extrabold text-yellow-200 drop-shadow-lg">
                      {gameStats.speedLevel}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-yellow-300/90 font-bold">
                      🏆 Level Reached
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Button Section */}
            <div className="relative z-10 mt-6 landscape:mt-8">
              <button
                onClick={handleButtonClick}
                onTouchEnd={handleButtonClick}
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                className="wood-button wood-texture w-full py-3 landscape:py-4 px-6 rounded-xl 
                transition-all duration-300 font-bold text-yellow-100 
                hover:scale-105 active:scale-95 drop-shadow-xl
                text-sm landscape:text-base cursor-pointer select-none"
                style={{ touchAction: "manipulation" }}
              >
                ⚔️ SLASH MORE ⚔️
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

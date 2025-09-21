import Image from "next/image";
import { GameStats } from "../types";
import { WoodStyles } from "./WoodStyle";
// import chog from "../../public/monanimals/Chog.png"
interface GameOverModalProps {
  gameOver: boolean;
  gameStats: GameStats;
  resetGame: () => void;
  isSubmittingScore: boolean;
  submittedScore: number;
}

export default function GameOverModal({
  gameOver,
  gameStats,
  resetGame,
  isSubmittingScore,
  submittedScore,
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
            portrait:w-[95%] portrait:max-w-lg portrait:p-6 portrait:md:p-8 portrait:lg:p-10
            landscape:max-w-[85vw] landscape:max-h-[75vh] landscape:p-3 landscape:sm:p-4
            landscape:md:max-w-[70vw] landscape:md:max-h-[70vh] landscape:md:p-5
            rounded-3xl landscape:rounded-2xl shadow-2xl text-center
            border-4 border-amber-800/60"
          >
            {/* Decorative wood overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-700/10 to-stone-900/20 pointer-events-none rounded-3xl landscape:rounded-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/5 via-transparent to-amber-800/10 pointer-events-none rounded-3xl landscape:rounded-2xl"></div>

            {/* Content Container */}
            <div
              className="relative z-10 
              portrait:block
              landscape:flex landscape:items-center landscape:gap-4 landscape:text-left landscape:min-h-0"
            >
              {/* Header Section */}
              <div
                className="
                portrait:mb-6 
                landscape:flex-1 landscape:min-w-0"
              >
                <div
                  className="
                  portrait:text-4xl portrait:md:text-6xl portrait:mb-3
                  landscape:text-2xl landscape:mb-2
                  flex justify-center landscape:justify-start"
                >
                  <Image
                    src="/monanimals/Chog.png"
                    height={50}
                    width={50}
                    alt="chog"
                    className="portrait:w-12 portrait:h-12 landscape:w-24 landscape:h-24"
                  />
                </div>

                <h2
                  className="
                  portrait:text-2xl portrait:md:text-4xl portrait:mb-3
                  landscape:text-xl landscape:mb-2
                  font-extrabold text-yellow-100 drop-shadow-xl"
                >
                  BATTLE ENDED
                </h2>

                <p
                  className="
                  portrait:text-sm portrait:md:text-lg portrait:mb-4
                  landscape:text-xs landscape:mb-2 landscape:leading-tight
                  text-yellow-200/90 font-medium drop-shadow-lg"
                >
                  Your blade met it&apos;s match! The bomb has claimed victory.
                </p>
              </div>

              {/* Stats Section */}
              <div
                className="
                portrait:mb-6 
                landscape:flex-shrink-0 landscape:mb-0"
              >
                <div
                  className="
                  portrait:grid portrait:grid-cols-2 portrait:gap-3
                  landscape:flex landscape:flex-col landscape:gap-2 landscape:w-24"
                >
                  <div
                    className="wood-stat-card wood-texture rounded-2xl 
                    portrait:p-3 portrait:col-span-2
                    landscape:p-2 landscape:rounded-lg"
                  >
                    <div
                      className="
                      portrait:text-xl portrait:font-bold
                      landscape:text-lg landscape:font-bold
                      text-yellow-200 drop-shadow-lg"
                    >
                      {gameStats.objectsSliced}
                    </div>
                    <div
                      className="
                      portrait:text-xs
                      landscape:text-[16px] landscape:leading-tight
                      uppercase tracking-wider text-yellow-300/90 font-bold"
                    >
                      🍉score
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Button Section */}
            <div
              className="relative z-10 
              portrait:mt-6
              landscape:mt-3 landscape:flex landscape:justify-center landscape:flex-col"
            >
              <p
                className="portrait:text-lg portrait:md:text-xl portrait:mb-4
                landscape:text-base landscape:mb-2 landscape:leading-tight
                text-yellow-200/90 font-medium drop-shadow-lg"
              >
                {isSubmittingScore
                  ? "Submitting Score..."
                  : submittedScore > 0
                  ? `Score successfully submitted!`
                  : ""}
              </p>
              <button
                disabled={isSubmittingScore}
                onClick={handleButtonClick}
                onTouchEnd={handleButtonClick}
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                className="wood-button wood-texture 
                  portrait:w-full portrait:py-3 portrait:px-6 portrait:text-sm
                  landscape:px-4 landscape:py-2 landscape:text-base landscape:min-w-[120px]
                  rounded-xl landscape:rounded-lg
                  transition-all duration-300 font-bold text-yellow-100 
                  hover:scale-105 active:scale-95 drop-shadow-xl
                   select-none disabled:opacity-40 disabled:text-gray-300"
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

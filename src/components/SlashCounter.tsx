interface SlashCounterProps {
  isSlashing: boolean;
  slashCount: number;
  isMonad: boolean;
}

export default function SlashCounter({
  isSlashing,
  slashCount,
  isMonad,
}: SlashCounterProps) {
  const pointsAdded = isMonad ? 2 : 3;
  return (
    <>
      {isSlashing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-400 drop-shadow-lg animate-pulse">
              +{pointsAdded * slashCount}
            </div>
            <div className="text-2xl text-purple-300 font-semibold mt-2">
              {slashCount}/{isMonad ? 10 : 5}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

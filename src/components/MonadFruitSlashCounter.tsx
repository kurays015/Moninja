interface MonadFruitSlashCounterProps {
  isMonadSlashing: boolean;
  monadSlashCount: number;
}

export default function MonadFruitSlashCounter({
  isMonadSlashing,
  monadSlashCount,
}: MonadFruitSlashCounterProps) {
  return (
    <>
      {isMonadSlashing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-400 drop-shadow-lg animate-pulse">
              +{20 * monadSlashCount}
            </div>
            <div className="text-2xl text-purple-300 font-semibold mt-2">
              {monadSlashCount}/10
            </div>
          </div>
        </div>
      )}
    </>
  );
}

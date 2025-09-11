import Leaderboard from "../components/Leaderboard";
import MonadAuth from "../components/MonadAuth";

export default function Home() {
  return (
    <div>
      {/* Mobile Portrait Rotate Message */}
      <div className="lg:hidden portrait:flex landscape:hidden min-h-screen bg-gradient-to-br from-amber-900 via-stone-800 to-amber-900 flex-col items-center justify-center p-6 text-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 border-2 border-amber-600/30 max-w-sm w-full shadow-2xl">
          <h1 className="text-2xl font-bold text-amber-100 mb-4 drop-shadow-lg">
            Rotate Your Device
          </h1>

          <p className="text-amber-200/90 mb-6 leading-relaxed">
            For the best ninja slicing experience, please rotate your phone to
            <span className="text-amber-300 font-semibold">
              {" "}
              landscape mode
            </span>
            .
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-3xl opacity-50">📱</div>
            <div className="text-amber-400 text-xl animate-bounce">→</div>
            <div className="text-3xl transform rotate-90">📱</div>
          </div>

          <p className="text-sm text-amber-300/70 font-medium">
            Turn your phone sideways to continue
          </p>
        </div>
      </div>

      {/* Desktop and Mobile Landscape Content */}
      <div className="lg:block portrait:hidden landscape:block">
        <MonadAuth />
        <Leaderboard />
      </div>
    </div>
  );
}

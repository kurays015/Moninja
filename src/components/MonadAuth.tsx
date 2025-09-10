"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Moninja from "./Moninja";
import Image from "next/image";
import FullscreenButton from "./FullScreen";

export default function MonadAuth() {
  const { authenticated, ready, login } = usePrivy();

  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default volume 30%
  const [previousVolume, setPreviousVolume] = useState(0.3); // Store previous volume for unmute
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showVolumeSlider && !target.closest(".volume-controls")) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVolumeSlider]);

  // Initialize background music
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/bg-music.mp3");
      audio.loop = true;
      audio.volume = volume;
      audio.preload = "auto";
      setBgMusic(audio);

      // Cleanup on unmount
      return () => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      };
    }
  }, []);

  // Update music volume when volume state changes
  useEffect(() => {
    if (bgMusic) {
      bgMusic.volume = volume;
      console.log("Volume updated:", volume, "bgMusic.volume:", bgMusic.volume);
    }
  }, [bgMusic, volume]);

  // Start music when app is ready and user interacts
  useEffect(() => {
    if (!ready || !bgMusic) return;

    const startMusic = async () => {
      try {
        await bgMusic.play();
        setIsMusicPlaying(true);
      } catch (error) {
        // Auto-play was blocked, will need user interaction
        console.log("Auto-play blocked, waiting for user interaction", error);
      }
    };

    // Try to start music when ready
    startMusic();

    // Add click listener to start music on first user interaction
    const handleFirstClick = async () => {
      if (!isMusicPlaying && bgMusic) {
        try {
          await bgMusic.play();
          setIsMusicPlaying(true);
          document.removeEventListener("click", handleFirstClick);
        } catch (error) {
          console.log("Failed to start music:", error);
        }
      }
    };

    document.addEventListener("click", handleFirstClick);

    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, [ready, bgMusic, isMusicPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    console.log(
      "Toggle mute clicked. Current volume:",
      volume,
      "Previous volume:",
      previousVolume
    );
    setVolume(currentVolume => {
      if (currentVolume > 0) {
        // Mute: store current volume and set to 0
        setPreviousVolume(currentVolume);
        console.log(
          "Muting: setting volume to 0, storing previous volume:",
          currentVolume
        );
        return 0;
      } else {
        // Unmute: restore previous volume
        console.log("Unmuting: restoring volume to:", previousVolume);
        return previousVolume;
      }
    });
  }, [previousVolume, volume]);

  // Memoized button handlers
  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">
            Moninja🥷
          </h2>
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white mb-4"></div>
            <p className="text-lg font-medium">Preparing your blade...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 landscape:p-2">
        <div className="bg-black/20 backdrop-blur-md p-8 landscape:p-4 rounded-3xl border border-white/20 shadow-2xl max-w-md landscape:max-w-lg w-full text-center landscape:max-h-[90vh] landscape:overflow-y-auto">
          <div className="mb-8 landscape:mb-4">
            <h1 className="text-4xl landscape:text-2xl font-bold text-white mb-2 landscape:mb-1">
              Moninja🥷
            </h1>
            <p className="text-white/80 text-lg landscape:text-sm">
              Slice your way to victory!
            </p>
          </div>

          <div className="mb-8 landscape:mb-4">
            <div className="flex justify-center space-x-4 landscape:space-x-2 mb-6 landscape:mb-3">
              <div className="w-16 h-16 landscape:w-10 landscape:h-10 relative">
                <Image
                  src="/monanimals/4ksalmonad.png"
                  alt="4ksalmonad"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  draggable={false}
                />
              </div>
              <div className="w-16 h-16 landscape:w-10 landscape:h-10 relative">
                <Image
                  src="/monanimals/Chog.png"
                  alt="Chog"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                  draggable={false}
                />
              </div>
              <div className="w-16 h-16 landscape:w-10 landscape:h-10 relative">
                <Image
                  src="/monanimals/cutlandak2.png"
                  alt="cutlandak2"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                  draggable={false}
                />
              </div>
              <div className="w-16 h-16 landscape:w-10 landscape:h-10 relative">
                <Image
                  src="/monanimals/fish_nad.png"
                  alt="fish_nad"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_gold] animate-bounce"
                  style={{ animationDelay: "0.6s" }}
                  draggable={false}
                />
              </div>
            </div>
            <p className="text-white/70 landscape:text-xs">
              Connect your Monad Games ID to start slashing monanimals to climb
              to the leaderboard!
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 landscape:px-4 landscape:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 rounded-2xl font-bold text-lg landscape:text-sm text-amber-900 shadow-lg hover:shadow-xl hover:scale-105 transform focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
          >
            ⚔️ Connect & Play
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Music Controls Overlay */}
      <div className="absolute bottom-4 left-4 volume-controls z-50">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-3">
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="relative">
              <button
                onClick={toggleMute}
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={toggleMute}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                <svg
                  className="w-5 h-5 text-white/80"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {volume === 0 ? (
                    <path d="M16.5 12c0-1.77-1.02-3.25-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  ) : volume < 0.5 ? (
                    <path d="M7 9v6h4l5 5V4l-5 5H7zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  ) : (
                    <path d="M7 9v6h4l5 5V4l-5 5H7zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  )}
                </svg>
              </button>

              {/* Volume Slider */}
              {showVolumeSlider && (
                <div className="absolute left-0 bottom-12 bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg p-3 mb-2 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70">🔈</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={e =>
                        handleVolumeChange(parseFloat(e.target.value))
                      }
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                          volume * 100
                        }%, rgba(255,255,255,0.2) ${
                          volume * 100
                        }%, rgba(255,255,255,0.2) 100%)`,
                      }}
                    />
                    <span className="text-xs text-white/70">🔊</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs text-white/60">
                      {volume === 0 ? "Muted" : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Volume Slider Toggle */}
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onTouchEnd={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Volume Slider"
            >
              <svg
                className="w-4 h-4 text-white/60"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {/* Music Info */}
            <div className="text-white/80 text-sm flex items-center gap-3">
              {isMusicPlaying ? (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-green-400 rounded animate-pulse"></div>
                  <div
                    className="w-1 h-2 bg-green-400 rounded animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1 h-4 bg-green-400 rounded animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span className="ml-2 text-xs">Playing</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">Paused</span>
              )}
              <FullscreenButton />
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div>
        <Moninja />
      </div>
    </div>
  );
}

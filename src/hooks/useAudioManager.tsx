"use client";

import { useCallback, useRef, useEffect } from "react";

export default function useAudioManager() {
  const audioPoolRef = useRef<Map<string, HTMLAudioElement[]>>(new Map());
  const activeBombsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const loadedSoundsRef = useRef<Set<string>>(new Set());

  // Check if audio file exists and is supported
  const checkAudioFile = useCallback(
    async (soundType: string): Promise<boolean> => {
      return new Promise(resolve => {
        const audio = new Audio();

        // Try multiple formats
        const formats = [".wav", ".mp3", ".ogg"];
        let formatIndex = 0;

        const tryNextFormat = () => {
          if (formatIndex >= formats.length) {
            console.warn(`No supported audio format found for ${soundType}`);
            resolve(false);
            return;
          }

          const format = formats[formatIndex];
          audio.src = `/sounds/${soundType}${format}`;

          audio.addEventListener(
            "canplaythrough",
            () => {
              console.log(`Audio loaded successfully: ${soundType}${format}`);
              resolve(true);
            },
            { once: true }
          );

          audio.addEventListener(
            "error",
            () => {
              formatIndex++;
              tryNextFormat();
            },
            { once: true }
          );

          audio.load();
        };

        tryNextFormat();
      });
    },
    []
  );

  // Preload sounds with better error handling
  const preloadSound = useCallback(
    async (soundType: string, poolSize: number = 5) => {
      if (loadedSoundsRef.current.has(soundType)) {
        return; // Already loaded
      }

      const isSupported = await checkAudioFile(soundType);
      if (!isSupported) {
        console.warn(`Skipping unsupported sound: ${soundType}`);
        return;
      }

      if (!audioPoolRef.current.has(soundType)) {
        const pool: HTMLAudioElement[] = [];

        // Determine the correct format
        const formats = [".wav", ".mp3", ".ogg"];
        let workingFormat = ".wav";

        for (const format of formats) {
          try {
            const testAudio = new Audio(`/sounds/${soundType}${format}`);
            await new Promise((resolve, reject) => {
              testAudio.addEventListener("canplaythrough", resolve, {
                once: true,
              });
              testAudio.addEventListener("error", reject, { once: true });
              testAudio.load();
            });
            workingFormat = format;
            break;
          } catch {
            continue;
          }
        }

        for (let i = 0; i < poolSize; i++) {
          const audio = new Audio(`/sounds/${soundType}${workingFormat}`);
          audio.preload = "auto";
          audio.volume = 1;

          // Add error handling for each audio element
          audio.addEventListener("error", e => {
            console.warn(`Audio error for ${soundType}:`, e);
          });

          pool.push(audio);
        }

        audioPoolRef.current.set(soundType, pool);
        loadedSoundsRef.current.add(soundType);
        console.log(
          `Preloaded ${poolSize} instances of ${soundType}${workingFormat}`
        );
      }
    },
    [checkAudioFile]
  );

  // Play from pool with enhanced error handling
  const playSound = useCallback((soundType: string, objectId?: string) => {
    const pool = audioPoolRef.current.get(soundType);

    if (!pool || pool.length === 0) {
      console.warn(`No audio pool found for sound: ${soundType}`);
      return;
    }

    // Find available audio or clone if none available
    const availableAudio = pool.find(a => a.paused && a.readyState >= 3); // HAVE_FUTURE_DATA
    const sound =
      availableAudio || (pool[0].cloneNode(true) as HTMLAudioElement);

    // Ensure the audio is ready to play
    if (sound.readyState < 2) {
      // HAVE_CURRENT_DATA
      console.warn(`Audio not ready for ${soundType}, skipping...`);
      return;
    }

    try {
      sound.currentTime = 0;
      sound.volume = 0.2;

      // Special case: bombs (need to stop later)
      if (soundType === "bomb-fuse" && objectId) {
        activeBombsRef.current.set(objectId, sound);
        sound.addEventListener(
          "ended",
          () => {
            activeBombsRef.current.delete(objectId);
          },
          { once: true }
        );
      }

      const playPromise = sound.play();

      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn(`Audio play failed for ${soundType}:`, err.message);

          // If it's a bomb sound that failed, clean up the reference
          if (soundType === "bomb-fuse" && objectId) {
            activeBombsRef.current.delete(objectId);
          }
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${soundType}:`, error);
    }
  }, []);

  // Stop bomb sound by ID
  const stopBombSound = useCallback((objectId: string) => {
    const audio = activeBombsRef.current.get(objectId);
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn(`Error stopping bomb sound:`, error);
      } finally {
        activeBombsRef.current.delete(objectId);
      }
    }
  }, []);

  // Stop all (cleanup)
  const cleanupAll = useCallback(() => {
    activeBombsRef.current.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn(`Error during cleanup:`, error);
      }
    });
    activeBombsRef.current.clear();
  }, []);

  // Initialize common sounds
  useEffect(() => {
    const initializeSounds = async () => {
      const commonSounds = [
        "oof",
        "bomb-fuse",
        "bomb-explode",
        "game-over",
        "start",
        "combo",
        "cat",
      ];

      for (const sound of commonSounds) {
        await preloadSound(sound);
      }
    };

    initializeSounds();
  }, [preloadSound]);

  return { preloadSound, playSound, stopBombSound, cleanupAll };
}

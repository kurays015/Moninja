"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ComboEffect,
  GameObject,
  GameStats,
  SlashPoint,
  SliceEffect,
  StartButton,
} from "../types";
import { useCrossAppAccount } from "../hooks/useCrossAppAccount";
import Image from "next/image";
import Link from "next/link";
import useAudioManager from "../hooks/useAudioManager";
import SliceEffects from "./SliceEffects";
import FrenzyNotification from "./FrenzyNotification";

export default function Moninja() {
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [startButton, setStartButton] = useState<StartButton | null>(null);
  const [slashPath, setSlashPath] = useState<SlashPoint[]>([]);
  const [isSlashing, setIsSlashing] = useState<boolean>(false);
  const [sliceEffects, setSliceEffects] = useState<SliceEffect[]>([]);
  const [comboEffects, setComboEffects] = useState<ComboEffect[]>([]);
  const [isMonadSlashing, setIsMonadSlashing] = useState<boolean>(false);
  const [monadSlashCount, setMonadSlashCount] = useState<number>(0);
  const [bombHit, setBombHit] = useState<boolean>(false);
  const [frenzyNotification, setFrenzyNotification] = useState<string | null>(
    ""
  );
  const [localScore, setLocalScore] = useState(0);
  const [submittedScore, setSubmittedScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frenzyMode, setFrenzyMode] = useState<boolean>(false);
  const [frenzyTimeRemaining, setFrenzyTimeRemaining] = useState<number>(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startButtonRef = useRef<StartButton | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSliceTimeRef = useRef<number>(0);
  const objectsRef = useRef<GameObject[]>([]);
  const submitTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Frenzy mode state management
  const frenzyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const frenzyWaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  //hooks
  const { walletAddress } = useCrossAppAccount();
  const { preloadSound, playSound, stopBombSound, cleanupAll } =
    useAudioManager();

  // Memoized constants
  const monanimalImages = useMemo(
    () => [
      "4ksalmonad.png",
      "Chog.png",
      "cutlandak2.png",
      "fish_nad.png",
      "molandak_skilly.PNG",
      "MolandakHD.png",
    ],
    []
  );

  // Preload sounds on mount
  useEffect(() => {
    preloadSound("cat");
    preloadSound("oof");
    preloadSound("combo");
    preloadSound("combo-blitz-6");
    preloadSound("game-over");
    preloadSound("bomb-fuse", 3);
    preloadSound("bomb-explode", 2);
    preloadSound("sword");
    preloadSound("start");

    return () => {
      cleanupAll();
    };
  }, [preloadSound, cleanupAll]);

  useEffect(() => {
    startButtonRef.current = startButton;
  }, [startButton]);

  // Keep objectsRef updated with current objects state
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (gameStarted && !gameOver) {
        setGamePaused(document.hidden);
      }
    };

    const handleWindowBlur = () => {
      if (gameStarted && !gameOver) {
        setGamePaused(true);
      }
    };

    const handleWindowFocus = () => {
      if (gameStarted && !gameOver) {
        setGamePaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [gameStarted, gameOver]);

  // Create start button
  const createStartButton = useCallback((): void => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    const centeredX = (rect ? rect.width : window.innerWidth) / 2 - 80;
    const centeredY = (rect ? rect.height : window.innerHeight) / 2 - 80;

    setStartButton({
      id: Date.now(),
      x: centeredX,
      y: centeredY,
      velocityX: 0,
      velocityY: 0,
      rotation: 0,
      rotationSpeed: 0,
      sliced: false,
      gravity: 0,
    });
  }, []);

  // Generate random object (fruit, bomb, or monad)
  const createObject = useCallback(
    (
      startX: number,
      isBomb: boolean = false,
      frenzyMode: boolean = false,
      isMonad: boolean = false
    ): GameObject => {
      const velocityX = (Math.random() - 0.5) * (frenzyMode ? 12 : 8); // Faster in frenzy
      const velocityY = -(
        Math.random() * (frenzyMode ? 8 : 6) +
        (frenzyMode ? 15 : 12)
      ); // Higher launch in frenzy
      const rect = gameAreaRef.current?.getBoundingClientRect();

      const type = isBomb ? "bomb" : isMonad ? "monad" : "fruit";
      const fruitName = isBomb
        ? null
        : isMonad
        ? "monad.svg"
        : monanimalImages[Math.floor(Math.random() * monanimalImages.length)];

      const obj: GameObject = {
        id: Date.now() + Math.random(),
        type,
        fruitName,
        x: startX,
        y: (rect ? rect.height : window.innerHeight) - 80, // Spawn at bottom, accounting for object height
        velocityX,
        velocityY,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * (frenzyMode ? 15 : 10), // Faster rotation in frenzy
        sliced: false,
        gravity: frenzyMode ? 0.3 : 0.4, // Slightly less gravity in frenzy for more air time
        // Monad-specific properties
        slashCount: isMonad ? 0 : undefined,
        maxSlashCount: isMonad ? 10 : undefined,
        pointsPerSlash: isMonad ? 20 : undefined,
      };

      // Play sound with object ID for bombs (only if not paused)
      if (!gamePaused) {
        if (isBomb) {
          playSound("bomb-fuse", obj.id.toString());
        } else if (isMonad) {
          playSound("combo"); // Special sound for monad
        } else {
          playSound("cat");
        }
      }

      return obj;
    },
    [monanimalImages, playSound, gamePaused]
  );

  // Update frenzy timer countdown
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (frenzyMode && frenzyTimeRemaining > 0) {
      countdownTimer = setInterval(() => {
        setFrenzyTimeRemaining(prev => {
          const newTime = prev - 100;
          if (newTime <= 0) {
            return 0;
          }
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [frenzyMode, frenzyTimeRemaining]);

  // Check if we should trigger frenzy mode
  const checkFrenzyMode = useCallback(() => {
    const shouldTriggerFrenzy =
      score >= 20 && Math.floor(score / 20) > Math.floor((score - 1) / 20);
    return shouldTriggerFrenzy && !frenzyMode; // Don't trigger if already in frenzy
  }, [score, frenzyMode]);

  // Generate a frenzy wave
  const createFrenzyWave = useCallback((): void => {
    if (gamePaused || bombHit) return;

    // Check if there's already a monad visible - if so, don't create new objects
    const hasVisibleMonad = objectsRef.current.some(
      obj => obj.type === "monad" && !obj.sliced
    );
    if (hasVisibleMonad) {
      console.log(
        "Monad visible, skipping object creation. Objects:",
        objectsRef.current
      );
      return;
    }

    const frenzyWaveSize = Math.floor(Math.random() * 4) + 8; // 8-11 fruits
    const rect = gameAreaRef.current?.getBoundingClientRect();
    const maxWidth = (rect ? rect.width : window.innerWidth) - 100;
    const minSpacing = 80; // Closer spacing in frenzy
    const positions: number[] = [];

    // Play frenzy start sound (only if not paused)
    if (!gamePaused) {
      playSound("frenzy-start");
    }

    for (let i = 0; i < frenzyWaveSize; i++) {
      let attempts = 0;
      let x: number;

      do {
        x = Math.random() * maxWidth;
        attempts++;
      } while (
        attempts < 50 &&
        positions.some(pos => Math.abs(pos - x) < minSpacing)
      );

      positions.push(x);

      // Stagger launches more rapidly in frenzy
      setTimeout(() => {
        if (!gamePaused) {
          const obj = createObject(x, false, true); // No bombs, frenzy mode enabled
          console.log("Creating frenzy object:", obj.type, "at position:", x);
          setObjects(prev => [...prev, obj]);
        }
      }, i * 100); // Faster than normal (100ms vs 200ms)
    }
  }, [createObject, gamePaused, bombHit, playSound]);

  // Start frenzy mode
  const startFrenzyMode = useCallback(() => {
    if (frenzyMode || bombHit) return; // Already in frenzy or bomb hit

    setFrenzyMode(true);
    setFrenzyTimeRemaining(5000); // 5 seconds in milliseconds

    // Play frenzy start sound (only if not paused)
    if (!gamePaused) {
      playSound("frenzy-start");
    }

    // Show frenzy notification
    setFrenzyNotification("MONANIMAL FRENZY!");

    // Hide notification after 3 seconds
    setTimeout(() => {
      setFrenzyNotification(null);
    }, 3000);

    // Clear any existing timers
    if (frenzyTimerRef.current) {
      clearTimeout(frenzyTimerRef.current);
    }
    if (frenzyWaveTimerRef.current) {
      clearTimeout(frenzyWaveTimerRef.current);
    }

    // Create continuous frenzy waves every 800ms
    const createFrenzyWaves = () => {
      // Don't check frenzyMode state here as it might be stale
      if (!gamePaused) {
        createFrenzyWave();
        frenzyWaveTimerRef.current = setTimeout(createFrenzyWaves, 800);
      }
    };

    createFrenzyWaves(); // Start immediately

    // End frenzy after 5 seconds
    frenzyTimerRef.current = setTimeout(() => {
      setFrenzyMode(false);
      setFrenzyTimeRemaining(0);
      if (frenzyWaveTimerRef.current) {
        clearTimeout(frenzyWaveTimerRef.current);
      }
    }, 5000);
  }, [frenzyMode, gamePaused, bombHit, playSound, createFrenzyWave]);

  // Generate a normal wave of objects
  const createObjectWave = useCallback((): void => {
    if (gamePaused || gameOver || bombHit) return;

    // Check if we should trigger frenzy mode
    if (checkFrenzyMode()) {
      startFrenzyMode(); // Changed from createFrenzyWave() to startFrenzyMode()
      return;
    }

    // Check if there's already a monad visible - if so, don't create new objects
    const hasVisibleMonad = objectsRef.current.some(
      obj => obj.type === "monad" && !obj.sliced
    );
    console.log(
      "Checking for monads. Current objects:",
      objectsRef.current,
      "Has visible monad:",
      hasVisibleMonad
    );
    if (hasVisibleMonad) {
      console.log(
        "Monad visible, skipping object creation. Objects:",
        objectsRef.current
      );
      return;
    }

    const waveSize = Math.floor(Math.random() * 3) + 2;
    const bombChance = Math.min(0.4, 0.15 + score * 0.002);
    const monadChance = 0.03; // 3% chance for monad
    const minSpacing = 120;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    const maxWidth = (rect ? rect.width : window.innerWidth) - 100;
    const positions: number[] = [];

    for (let i = 0; i < waveSize; i++) {
      let attempts = 0;
      let x: number;

      do {
        x = Math.random() * maxWidth;
        attempts++;
      } while (
        attempts < 50 &&
        positions.some(pos => Math.abs(pos - x) < minSpacing)
      );

      positions.push(x);
      const random = Math.random();
      const isBomb = random < bombChance;
      const isMonad = !isBomb && random < monadChance;
      console.log(
        "Object creation - random:",
        random,
        "bombChance:",
        bombChance,
        "monadChance:",
        monadChance,
        "isBomb:",
        isBomb,
        "isMonad:",
        isMonad
      );

      setTimeout(() => {
        if (!gamePaused) {
          const obj = createObject(x, isBomb, false, isMonad);
          console.log("Creating object:", obj.type, "at position:", x);
          setObjects(prev => [...prev, obj]);
        }
      }, i * 200);
    }
  }, [
    createObject,
    score,
    gamePaused,
    bombHit,
    checkFrenzyMode,
    startFrenzyMode,
    gameOver,
  ]);

  // Update object positions
  const updateObjects = useCallback((): void => {
    if (gamePaused || bombHit) return;

    // Freeze other objects during monad slashing
    if (isMonadSlashing) return;

    setObjects(prevObjects => {
      const rect = gameAreaRef.current?.getBoundingClientRect();
      const bottomBoundary = (rect ? rect.height : window.innerHeight) + 100;

      const updatedObjects = prevObjects.map(obj => ({
        ...obj,
        x: obj.x + obj.velocityX,
        y: obj.y + obj.velocityY,
        velocityY: obj.velocityY + obj.gravity,
        rotation: obj.rotation + obj.rotationSpeed,
      }));

      // Filter out objects that are off-screen or sliced
      const filteredObjects = updatedObjects.filter(obj => {
        const shouldKeep = obj.y < bottomBoundary && !obj.sliced;

        // If this is a bomb that should be removed, stop its sound
        if (!shouldKeep && obj.type === "bomb" && !gamePaused) {
          stopBombSound(obj.id.toString());
        }

        return shouldKeep;
      });

      return filteredObjects;
    });

    // Update start button if it exists
    if (startButton && !startButton.sliced) {
      setStartButton(prev => {
        if (!prev) return null;
        const rect = gameAreaRef.current?.getBoundingClientRect();
        const bottomBoundary = (rect ? rect.height : window.innerHeight) + 100;
        const updated = {
          ...prev,
          x: prev.x + prev.velocityX,
          y: prev.y + prev.velocityY,
          velocityY: prev.velocityY + prev.gravity,
          rotation: prev.rotation + prev.rotationSpeed,
        };

        // Remove start button if it falls off screen
        if (updated.y > bottomBoundary) {
          return null;
        }

        return updated;
      });
    }
  }, [startButton, gamePaused, stopBombSound, isMonadSlashing, bombHit]);

  // Batch score submission function
  const submitScoreBatch = useCallback(
    async (finalScore?: number) => {
      const scoreToSubmit = finalScore || localScore;
      const scoreDifference = scoreToSubmit - submittedScore;

      if (scoreDifference <= 0 || isSubmitting) return;

      setIsSubmitting(true);

      try {
        const res = await fetch("/api/submit-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player: walletAddress,
            transactionAmount: 1,
            scoreAmount: scoreDifference,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSubmittedScore(scoreToSubmit);
          console.log("Score batch submitted:", {
            scoreDifference,
            transactionHash: data.transactionHash,
            totalScore: scoreToSubmit,
          });
        } else {
          console.error("Failed to submit score:", res.statusText);
        }
      } catch (error) {
        console.error("Error submitting score batch:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [localScore, submittedScore, walletAddress, isSubmitting]
  );

  // Debounced score submission
  const debouncedSubmit = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    submitTimeoutRef.current = setTimeout(() => {
      submitScoreBatch();
    }, 2000);
  }, [submitScoreBatch]);

  // Update local score immediately, submit later
  const updateScore = useCallback(
    (points: number) => {
      setLocalScore(prev => {
        const newScore = prev + points;
        debouncedSubmit();
        return newScore;
      });
    },
    [debouncedSubmit]
  );

  // Submit final score when game ends
  const handleGameEnd = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    submitScoreBatch(localScore);
  }, [localScore, submitScoreBatch]);

  // Optimized collision detection with immediate sound effects
  const checkSlashCollisions = useCallback((): void => {
    if (slashPath.length < 2 || gamePaused || bombHit) return;

    const currentTime = Date.now();
    const timeSinceLastSlice = currentTime - lastSliceTimeRef.current;

    // Prevent sound spam by limiting slice sounds to once every 50ms
    const canPlaySliceSound = timeSinceLastSlice > 50;

    let slashHitsThisFrame = 0;
    let slashCenterX = 0;
    let slashCenterY = 0;
    let hitBomb = false;

    // Check start button collision
    if (startButton && !startButton.sliced) {
      for (let i = 1; i < slashPath.length; i++) {
        const p1: SlashPoint = slashPath[i - 1];
        const p2: SlashPoint | undefined = slashPath[i];
        const distance: number = Math.sqrt(
          Math.pow(startButton.x + 75 - p1.x, 2) +
            Math.pow(startButton.y + 40 - p1.y, 2)
        );

        if (distance < 80) {
          setStartButton(prev => (prev ? { ...prev, sliced: true } : null));
          setGameStarted(true);

          if (!gamePaused) {
            playSound("sword");

            playSound("start");
          }

          // Create start button slice effect
          const startEffect: SliceEffect = {
            id: Date.now(),
            x: startButton.x,
            y: startButton.y,
            type: "start",
            imageSrc: "/Watermelon.svg",
            width: 160,
            height: 160,
            angle: p2
              ? (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI
              : 0,
          };
          setSliceEffects((prev: SliceEffect[]) => [...prev, startEffect]);

          // Remove effect after animation
          setTimeout(() => {
            setSliceEffects(prev => prev.filter(e => e.id !== startEffect.id));
          }, 1000);
          break;
        }
      }
    }

    // Check object collisions with optimized sound timing
    setObjects((prevObjects: GameObject[]) => {
      const newObjects: GameObject[] = [...prevObjects];
      let pointsEarned: number = 0;
      const newSliceEffects: SliceEffect[] = [];

      newObjects.forEach((obj: GameObject, index: number) => {
        if (obj.sliced) return;

        for (let i = 1; i < slashPath.length; i++) {
          const p1: SlashPoint = slashPath[i - 1];
          const p2: SlashPoint = slashPath[i];

          const distance: number = Math.sqrt(
            Math.pow(obj.x + 40 - p1.x, 2) + Math.pow(obj.y + 40 - p1.y, 2)
          );

          if (distance < 60) {
            // Handle monad slashing
            if (obj.type === "monad") {
              const currentSlashCount = obj.slashCount || 0;
              const maxSlashCount = obj.maxSlashCount || 10;

              if (currentSlashCount < maxSlashCount) {
                // Increment slash count
                const newSlashCount = currentSlashCount + 1;
                newObjects[index] = {
                  ...obj,
                  slashCount: newSlashCount,
                  sliced: newSlashCount >= maxSlashCount, // Only mark as sliced after 10 slashes
                };

                // Start monad slashing mode if this is the first slash
                if (newSlashCount === 1) {
                  setIsMonadSlashing(true);
                  setMonadSlashCount(0);
                }

                // Update monad slash count
                setMonadSlashCount(newSlashCount);

                // Award points for each slash
                const pointsPerSlash = obj.pointsPerSlash || 20;
                pointsEarned += pointsPerSlash;
                updateScore(pointsPerSlash);

                // Play special monad slash sound
                if (!gamePaused) {
                  playSound("combo");
                }

                // Create monad slash effect
                const monadEffect: SliceEffect = {
                  id: Date.now() + Math.random(),
                  x: obj.x,
                  y: obj.y,
                  type: "monad",
                  imageSrc: "/monad.svg",
                  width: 80,
                  height: 80,
                  angle: (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
                };
                newSliceEffects.push(monadEffect);

                // If this was the final slash, end monad slashing mode
                if (newSlashCount >= maxSlashCount) {
                  setIsMonadSlashing(false);
                  setMonadSlashCount(0);

                  // Play combo-blitz sound for final monad slash
                  if (!gamePaused) {
                    playSound("combo-blitz-6");
                  }

                  // Create final monad explosion effect
                  const explosionEffect: SliceEffect = {
                    id: Date.now() + Math.random(),
                    x: obj.x,
                    y: obj.y,
                    type: "monad-explosion", // Special type for final explosion
                    imageSrc: "/monad.svg",
                    width: 120,
                    height: 120,
                    angle:
                      (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
                  };
                  newSliceEffects.push(explosionEffect);

                  // Create shattering pieces effect
                  const shatterEffect: SliceEffect = {
                    id: Date.now() + Math.random(),
                    x: obj.x,
                    y: obj.y,
                    type: "monad-shatter", // New type for shattering effect
                    imageSrc: "/monad.svg",
                    width: 80,
                    height: 80,
                    angle:
                      (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
                  };
                  newSliceEffects.push(shatterEffect);
                }
              }
            } else {
              // Handle regular objects (fruit/bomb)
              newObjects[index] = { ...obj, sliced: true };
              slashHitsThisFrame++;
              slashCenterX += p1.x;
              slashCenterY += p1.y;

              const sliceEffect: SliceEffect = {
                id: Date.now() + Math.random(),
                x: obj.x,
                y: obj.y,
                type: obj.type === "bomb" ? "bomb" : "fruit",
                imageSrc:
                  obj.type === "bomb"
                    ? "/Bomb.webp"
                    : `/monanimals/${obj.fruitName ?? "MolandakHD.png"}`,
                width: 80,
                height: 80,
                angle: (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
              };
              newSliceEffects.push(sliceEffect);

              if (obj.type === "bomb") {
                if (!gamePaused) {
                  stopBombSound(obj.id.toString());
                }
                hitBomb = true;
                if (!gamePaused) {
                  playSound("bomb-explode");

                  // Delay game over sound
                  setTimeout(() => {
                    if (!gamePaused) {
                      playSound("game-over");
                    }
                  }, 2000);
                }
              } else {
                pointsEarned += 1;

                // Play slice sound immediately with throttling
                if (canPlaySliceSound && !gamePaused) {
                  playSound("oof");
                  lastSliceTimeRef.current = currentTime;
                }

                updateScore(1);
              }
            }
            break;
          }
        }
      });

      // Handle combo with immediate sound
      if (slashHitsThisFrame >= 3) {
        const comboEffect: ComboEffect = {
          id: Date.now(),
          x: slashCenterX / slashHitsThisFrame,
          y: slashCenterY / slashHitsThisFrame,
          count: slashHitsThisFrame,
        };

        setComboEffects((prev: ComboEffect[]) => [...prev, comboEffect]);
        const comboPoints = slashHitsThisFrame;
        pointsEarned += comboPoints;

        // Play combo sound immediately
        if (!gamePaused) {
          playSound("combo");
        }
        updateScore(comboPoints);

        setTimeout(() => {
          setComboEffects((prev: ComboEffect[]) =>
            prev.filter((effect: ComboEffect) => effect.id !== comboEffect.id)
          );
        }, 2000);
      }

      // Add slice effects
      if (newSliceEffects.length > 0) {
        setSliceEffects((prev: SliceEffect[]) => [...prev, ...newSliceEffects]);

        setTimeout(() => {
          setSliceEffects((prev: SliceEffect[]) =>
            prev.filter(
              (effect: SliceEffect) =>
                !newSliceEffects.some(
                  (newEffect: SliceEffect) => newEffect.id === effect.id
                )
            )
          );
        }, 1200);
      }

      // Handle bomb hit
      if (hitBomb) {
        // Set bomb hit flag to stop all game processing
        setBombHit(true);

        // Reset monad slashing state immediately when bomb is hit
        setIsMonadSlashing(false);
        setMonadSlashCount(0);

        // Clear spawn interval immediately to stop object spawning
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
          spawnIntervalRef.current = null;
        }

        // Clear frenzy timers to stop frenzy mode
        if (frenzyTimerRef.current) {
          clearTimeout(frenzyTimerRef.current);
          frenzyTimerRef.current = null;
        }
        if (frenzyWaveTimerRef.current) {
          clearTimeout(frenzyWaveTimerRef.current);
          frenzyWaveTimerRef.current = null;
        }

        // Reset frenzy mode state
        setFrenzyMode(false);
        setFrenzyTimeRemaining(0);

        // Stop the game loop immediately
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        handleGameEnd();
        setTimeout(() => {
          setGameOver(true);
          setObjects([]); // Clear objects on game over
          setSliceEffects([]); // Clear slice effects on game over
        }, 2000);
      }

      // Update visual score
      if (pointsEarned > 0) {
        setScore((prev: number) => prev + pointsEarned);
      }

      return newObjects;
    });
  }, [
    slashPath,
    startButton,
    gamePaused,
    bombHit,
    stopBombSound,
    updateScore,
    handleGameEnd,
    playSound,
  ]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      handleGameEnd();
    }
  }, [gameOver, handleGameEnd]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: MouseEvent): void => {
      if (gameOver || gamePaused || bombHit) return;
      setIsSlashing(true);
      const rect = gameAreaRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left ?? 0);
      const y = e.clientY - (rect?.top ?? 0);
      setSlashPath([{ x, y }]);
    },
    [gameOver, gamePaused, bombHit]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent): void => {
      if (!isSlashing || gameOver || gamePaused || bombHit) return;

      const rect = gameAreaRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left ?? 0);
      const y = e.clientY - (rect?.top ?? 0);
      setSlashPath((prev: SlashPoint[]) => {
        const last = prev[prev.length - 1];
        const points: SlashPoint[] = [];
        if (last) {
          const dx = x - last.x;
          const dy = y - last.y;
          const distance = Math.hypot(dx, dy);
          const steps = Math.max(1, Math.min(6, Math.floor(distance / 6)));
          for (let i = 1; i <= steps; i++) {
            points.push({
              x: last.x + (dx * i) / steps,
              y: last.y + (dy * i) / steps,
            });
          }
        } else {
          points.push({ x, y });
        }
        const newPath: SlashPoint[] = [...prev, ...points];
        return newPath.slice(-30);
      });
    },
    [isSlashing, gameOver, gamePaused, bombHit]
  );

  const handleMouseUp = useCallback((): void => {
    setIsSlashing(false);
    setSlashPath([]);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || gamePaused || bombHit) return;

    const gameLoop = (): void => {
      updateObjects();
      checkSlashCollisions();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateObjects, checkSlashCollisions, gameOver, gamePaused, bombHit]);

  // Spawn objects in waves
  useEffect(() => {
    console.log(
      "Spawn effect running. gameOver:",
      gameOver,
      "gameStarted:",
      gameStarted,
      "gamePaused:",
      gamePaused,
      "bombHit:",
      bombHit
    );
    if (gameOver || !gameStarted || gamePaused || bombHit) {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
      return;
    }

    const baseInterval: number = 2500;
    const speedIncrease: number = Math.floor(score / 50) * 200;
    const currentInterval: number = Math.max(
      1200,
      baseInterval - speedIncrease
    );

    spawnIntervalRef.current = setInterval(() => {
      console.log("Spawn interval triggered, calling createObjectWave");
      createObjectWave();
    }, currentInterval);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
    };
  }, [createObjectWave, gameOver, score, gameStarted, gamePaused, bombHit]);

  // Spawn start button initially
  useEffect(() => {
    if (!gameStarted && !startButton) {
      createStartButton();
    }
  }, [gameStarted, startButton, createStartButton]);

  // Add event listeners
  useEffect(() => {
    const gameArea: HTMLDivElement | null = gameAreaRef.current;
    if (!gameArea) return;

    const mouseDownHandler = (e: MouseEvent): void => {
      handleMouseDown(e);
    };

    gameArea.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      gameArea.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Reset game function
  const resetGame = useCallback((): void => {
    setScore(0);
    setLocalScore(0);
    setSubmittedScore(0);
    setGameOver(false);
    setGameStarted(false);
    setGamePaused(false);
    setBombHit(false);
    setObjects([]);
    setStartButton(null);
    setSlashPath([]);
    setIsSlashing(false);
    setSliceEffects([]);
    setComboEffects([]);
    setIsMonadSlashing(false);

    lastSliceTimeRef.current = 0;

    // Clear any pending timeouts
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
  }, []);

  // Memoized game stats
  const gameStats: GameStats = useMemo(
    () => ({
      score,
      objectsSliced: score,
      speedLevel: Math.floor(score / 50) + 1,
    }),
    [score]
  );

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-screen overflow-hidden select-none game-area"
    >
      {/* Pause Overlay */}
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

      {/* Score Display */}
      {gameStarted && (
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-yellow-200 px-6 py-3 rounded-xl shadow-lg border-4 border-yellow-400">
            <span className="text-3xl font-extrabold text-red-700 drop-shadow-md">
              🍉 {score}
            </span>
          </div>
        </div>
      )}

      {/* Frenzy Notification */}
      <FrenzyNotification notificationMessage={frenzyNotification} />

      {/* Monad Slash Counter */}
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

      {/* Start Button */}
      {!walletAddress ? (
        <div className="absolute z-40 select-none top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="https://monad-games-id-site.vercel.app"
            className="text-yellow-400 hover:text-yellow-300 underline"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            Create Username →
          </Link>
        </div>
      ) : (
        !gameStarted &&
        startButton &&
        !startButton.sliced && (
          <div className="h-screen flex flex-col items-center justify-center gap-4 z-40 select-none">
            <Image
              src="/Watermelon.svg"
              alt="start-watermelon"
              width={160}
              height={160}
              className="w-40 h-40 object-contain animate-spin [animation-duration:8s]"
              draggable={false}
            />
            <p className="text-center font-semibold italic text-3xl">
              Slash to start!
            </p>
          </div>
        )
      )}

      {/* Game Objects */}
      {objects.map((obj: GameObject) => (
        <div
          key={obj.id}
          className={`absolute w-20 h-20 transition-opacity duration-300 ${
            obj.sliced ? "opacity-0" : "opacity-100"
          }`}
          style={{
            left: obj.x,
            top: obj.y,
            transform: `rotate(${obj.rotation}deg)`,
            pointerEvents: "none",
          }}
        >
          {obj.type === "bomb" ? (
            <Image
              src="/Bomb.webp"
              alt="bomb"
              width={100}
              height={100}
              className="w-full h-full object-contain drop-shadow-lg"
              draggable={false}
            />
          ) : obj.type === "fruit" ? (
            <div className="relative w-full h-full">
              <Image
                src={`/monanimals/${obj.fruitName ?? "MolandakHD.png"}`}
                alt="monanimal"
                width={100}
                height={100}
                className="w-full h-full object-contain drop-shadow-[0_0_15px_gold]"
                draggable={false}
              />
            </div>
          ) : obj.type === "monad" ? (
            <div className="relative w-full h-full">
              <Image
                src={`/monad.svg`}
                alt="monad"
                width={100}
                height={100}
                className="w-full h-full object-contain drop-shadow-[0_0_20px_purple]"
                draggable={false}
              />

              {/* Simple slash count indicator */}
              {obj.slashCount && obj.slashCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-purple-300">
                  {obj.slashCount}
                </div>
              )}
            </div>
          ) : null}
        </div>
      ))}

      {/* Slice Effects */}
      <SliceEffects sliceEffects={sliceEffects} />

      {/* Combo Effects */}
      {comboEffects.map((combo: ComboEffect, index) => (
        <div
          key={index}
          className="absolute pointer-events-none z-40 text-4xl font-bold"
          style={{
            left: combo.x - 50,
            top: combo.y - 20,
            animation: "comboText 2s ease-out forwards",
            background: "linear-gradient(45deg, #FFD700, #FF6B35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          {combo.count}x COMBO!
        </div>
      ))}

      {/* Slash Trail */}
      {slashPath.length > 1 && (
        <svg
          className="absolute inset-0 pointer-events-none z-40"
          width="100%"
          height="100%"
        >
          <path
            d={`M ${slashPath
              .map((p: SlashPoint) => `${p.x},${p.y}`)
              .join(" L ")}`}
            stroke="url(#slashGradient)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
            style={{
              filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))",
            }}
          />
          <defs>
            <linearGradient
              id="slashGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF6347" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/30 max-w-md w-[92%] text-center">
            <div className="text-6xl mb-2">💥</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-fuchsia-600">
              Game Over
            </h2>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              You hit a bomb. Better luck next run!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-300/20 p-4 border border-amber-300/40">
                <div className="text-3xl font-extrabold text-amber-600">
                  {score}
                </div>
                <div className="text-xs uppercase tracking-wider text-amber-800/80">
                  Final Score
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-300/20 p-4 border border-sky-300/40">
                <div className="text-3xl font-extrabold text-indigo-600">
                  {gameStats.speedLevel}
                </div>
                <div className="text-xs uppercase tracking-wider text-indigo-800/80">
                  Level Reached
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-300/20 p-4 border border-emerald-300/40 col-span-2">
                <div className="text-xl font-bold text-emerald-700">
                  {gameStats.objectsSliced}
                </div>
                <div className="text-xs uppercase tracking-wider text-emerald-900/80">
                  Fruits Sliced
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Stats */}
      {gameStarted && (
        <div className="absolute top-24 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-700">
            Active Objects:{" "}
            <span className="font-bold text-purple-600">{objects.length}</span>
          </p>
          <p className="text-xs text-gray-600">
            Speed Level:{" "}
            <span className="font-bold">{gameStats.speedLevel}</span>
          </p>
        </div>
      )}
    </div>
  );
}

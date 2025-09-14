import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ComboEffect,
  GameObject,
  GameState,
  GameStats,
  SlashPoint,
  SliceEffect,
  StartButton,
  SubmitScoreResponse,
} from "../types";
import { useCrossAppAccount } from "../hooks/useCrossAppAccount";
import Image from "next/image";
import useAudioManager from "../hooks/useAudioManager";
import SliceEffects from "./SliceEffects";
import FrenzyNotification from "./FrenzyNotification";
import Stats from "./Stats";
import MonadFruitSlashCounter from "./MonadFruitSlashCounter";
import GameObjects from "./GameObjects";
import ComboEffects from "./ComboEffects";
import PauseModal from "./PauseModal";
import GameOverModal from "./GameOverModal";
import SlashTrail from "./SlashTrail";
import { usePlayerTotalScore } from "../hooks/usePlayerTotalScore";
import { useUsername } from "../hooks/useUsername";
import { useGameSession } from "../hooks/useGameSession";
import PauseButton from "./PauseButton";
import { toast } from "react-toastify";
import TransactionToast from "./TransactionToast";
import ResponsiveUserProfile from "./PlayerStatusPanel";
import { ObjectPool } from "../lib/ObjectPool";
import { MONANIMAL_IMAGES } from "../lib/monanimalsImages";
import { getSpeedMultiplier } from "../lib/getSpeedMultiplier";
import { GAME_CONFIG } from "../lib/gameConfig";

export default function Moninja() {
  // Consolidated game state
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    localScore: 0,
    submittedScore: 0,
    gameOver: false,
    gameStarted: false,
    gamePaused: false,
    bombHit: false,
    gameEnded: false,
    isSlashing: false,
    isMonadSlashing: false,
    monadSlashCount: 0,
    frenzyMode: false,
    frenzyTimeRemaining: 0,
    isSubmitting: false,
  });

  // Individual states that change frequently (keep separate for performance)
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [startButton, setStartButton] = useState<StartButton | null>(null);
  const [slashPath, setSlashPath] = useState<SlashPoint[]>([]);
  const [sliceEffects, setSliceEffects] = useState<SliceEffect[]>([]);
  const [comboEffects, setComboEffects] = useState<ComboEffect[]>([]);
  const [frenzyNotification, setFrenzyNotification] = useState<string | null>(
    ""
  );
  const [gameSessionToken, setGameSessionToken] = useState<string | null>(null);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const timersRef = useRef<{
    spawnInterval: NodeJS.Timeout | null;
    frenzyTimer: NodeJS.Timeout | null;
    frenzyWaveTimer: NodeJS.Timeout | null;
    submitTimeout: NodeJS.Timeout | null;
    frenzyCountdown: NodeJS.Timeout | null;
  }>({
    spawnInterval: null,
    frenzyTimer: null,
    frenzyWaveTimer: null,
    submitTimeout: null,
    frenzyCountdown: null,
  });

  const lastSliceTimeRef = useRef<number>(0);
  const objectsRef = useRef<GameObject[]>([]);
  const gameStateRef = useRef<GameState>(gameState);

  // Object pool for frenzy mode
  const objectPoolRef = useRef<ObjectPool<Partial<GameObject>>>(
    new ObjectPool(() => ({}), 30)
  );

  const hasVisibleBombOrMonad = objectsRef.current.some(
    obj => (obj.type === "bomb" || obj.type === "monad") && !obj.sliced
  );

  // Hooks
  const { walletAddress } = useCrossAppAccount();
  const { preloadSound, playSound, stopBombSound, cleanupAll } =
    useAudioManager();
  const { data: playerScoreData, isLoading: isScoreLoading } =
    usePlayerTotalScore({
      walletAddress,
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
    });
  const { data: usernameData, isLoading: isLoadingUserName } =
    useUsername(walletAddress);
  const { startGameSession, endGameSession, submitScore } =
    useGameSession(gameSessionToken);

  // Update refs when state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  // Initialize object pool and preload sounds
  useEffect(() => {
    objectPoolRef.current = new ObjectPool(() => ({}), 30);

    // Preload all sounds at once
    const sounds = [
      "cat",
      "oof",
      "combo",
      "combo-blitz-6",
      "game-over",
      "start",
    ];
    sounds.forEach(sound => preloadSound(sound));
    preloadSound("bomb-fuse", 3);
    preloadSound("bomb-explode", 2);

    return cleanupAll;
  }, [preloadSound, cleanupAll]);

  // Optimized state update functions
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear all timers utility
  const clearAllTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = {
      spawnInterval: null,
      frenzyTimer: null,
      frenzyWaveTimer: null,
      submitTimeout: null,
      frenzyCountdown: null,
    };
  }, []);

  // Updated createObject function with progressive speed and mobile landscape fix
  const createObject = useCallback(
    (
      startX: number,
      isBomb: boolean = false,
      frenzyMode: boolean = false,
      isMonad: boolean = false
    ): GameObject => {
      console.log("Creating object at position:", startX);
      const pooledObj = objectPoolRef.current?.get() || {};
      const rect = gameAreaRef.current?.getBoundingClientRect();

      const type = isBomb ? "bomb" : isMonad ? "monad" : "fruit";
      const fruitName = isBomb
        ? null
        : isMonad
        ? "monad.svg"
        : MONANIMAL_IMAGES[Math.floor(Math.random() * MONANIMAL_IMAGES.length)];

      // Calculate speed multiplier based on current score
      const speedMultiplier = getSpeedMultiplier(gameStateRef.current.score);

      // Detect landscape mode and adjust velocities accordingly
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isLandscape = screenWidth > screenHeight;
      const isMobile = screenWidth <= 768; // Typical mobile breakpoint
      const isLandscapeMobile = isLandscape && isMobile;

      // Set base speeds based on orientation
      const baseVelocityX = GAME_CONFIG.BASE_VELOCITY_X;
      let baseVelocityY, maxVelocityY;

      if (isLandscapeMobile) {
        // Use specific mobile landscape values
        baseVelocityY = GAME_CONFIG.MOBILE_LANDSCAPE_BASE_VELOCITY_Y;
        maxVelocityY = GAME_CONFIG.MOBILE_LANDSCAPE_MAX_VELOCITY_Y;
      } else {
        // Use normal values for portrait and desktop
        baseVelocityY = GAME_CONFIG.BASE_VELOCITY_Y;
        maxVelocityY = GAME_CONFIG.MAX_VELOCITY_Y;
      }

      const baseRotationSpeed = GAME_CONFIG.BASE_ROTATION_SPEED;

      // Apply speed multiplier with adjusted base speeds
      const velocityXRange = Math.min(
        GAME_CONFIG.MAX_VELOCITY_X,
        baseVelocityX * speedMultiplier
      );
      const velocityYRange = Math.min(
        maxVelocityY,
        baseVelocityY * speedMultiplier
      );
      const rotationSpeedRange = Math.min(
        GAME_CONFIG.MAX_ROTATION_SPEED,
        baseRotationSpeed * speedMultiplier
      );

      // Frenzy mode gets additional speed boost
      const frenzyMultiplier = frenzyMode ? 1.3 : 1.0;

      // Adjust gravity based on screen orientation for better arc control
      let gravity = frenzyMode ? 0.25 : 0.35;
      if (isLandscapeMobile) {
        gravity *= 1.2; // Increase gravity in landscape to bring objects down faster
      }

      const obj: GameObject = {
        ...pooledObj,
        id: Date.now() + Math.random(),
        type,
        fruitName,
        x: startX,
        y: (rect ? rect.height : window.innerHeight) - 80,
        velocityX: (Math.random() - 0.5) * velocityXRange * frenzyMultiplier,
        velocityY:
          -(Math.random() * (velocityYRange * 0.5) + velocityYRange) *
          frenzyMultiplier,
        rotation: 0,
        rotationSpeed:
          (Math.random() - 0.5) * rotationSpeedRange * frenzyMultiplier,
        sliced: false,
        gravity: gravity,
        slashCount: isMonad ? 0 : undefined,
        maxSlashCount: isMonad ? 10 : undefined,
        pointsPerSlash: isMonad ? 5 : undefined,
      };

      // Play sound only if not paused
      if (!gameStateRef.current.gamePaused) {
        if (isBomb) {
          playSound("bomb-fuse", obj.id.toString());
        } else if (isMonad) {
          playSound("combo");
        } else {
          playSound("cat");
        }
      }

      return obj;
    },
    [playSound]
  );

  // Batch score submission with debouncing
  const submitScoreBatch = useCallback(
    async (finalScore?: number) => {
      const scoreToSubmit = finalScore || gameStateRef.current.localScore;
      const scoreDifference =
        scoreToSubmit - gameStateRef.current.submittedScore;

      if (scoreDifference <= 0 || gameStateRef.current.isSubmitting) return;

      updateGameState({ isSubmitting: true });

      try {
        const data: SubmitScoreResponse = await new Promise(
          (resolve, reject) => {
            submitScore.mutate(
              {
                player: walletAddress!,
                transactionAmount: 1,
                scoreAmount: scoreDifference,
                sessionId: gameSessionId!,
              },
              { onSuccess: resolve, onError: reject }
            );
          }
        );

        updateGameState({
          submittedScore: scoreToSubmit,
          isSubmitting: false,
        });

        toast(<TransactionToast transactionsInfo={data} />, {
          autoClose: 4000,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          style: {
            background: "rgba(17, 24, 39, 0.95)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            padding: "0",
            margin: "0",
          },
        });
      } catch (error) {
        console.error("Error submitting score batch:", error);
        updateGameState({ isSubmitting: false });
      }
    },
    [walletAddress, gameSessionId, submitScore, updateGameState]
  );

  // Debounced score submission
  const debouncedSubmit = useCallback(() => {
    if (timersRef.current.submitTimeout) {
      clearTimeout(timersRef.current.submitTimeout);
    }
    timersRef.current.submitTimeout = setTimeout(() => {
      submitScoreBatch();
    }, GAME_CONFIG.SUBMIT_DEBOUNCE);
  }, [submitScoreBatch]);

  // Optimized score update
  const updateScore = useCallback(
    (points: number) => {
      setGameState(prev => {
        const newLocalScore = prev.localScore + points;
        const newScore = prev.score + points;
        debouncedSubmit();
        return { ...prev, localScore: newLocalScore, score: newScore };
      });
    },
    [debouncedSubmit]
  );

  // 2. Optimized createFrenzyWave with staggered spawning for smoothness
  const createFrenzyWave = useCallback(() => {
    if (gameStateRef.current.gamePaused || gameStateRef.current.bombHit) return;

    if (hasVisibleBombOrMonad) return;

    console.log("Creating frenzy wave");
    const waveSize =
      Math.floor(Math.random() * 4) + GAME_CONFIG.FRENZY_WAVE_SIZE.min; // Reduced randomness range
    const rect = gameAreaRef.current?.getBoundingClientRect();
    const maxWidth = (rect ? rect.width : window.innerWidth) - 100;
    const positions: number[] = [];

    // Pre-calculate positions with better distribution
    for (let i = 0; i < waveSize; i++) {
      let attempts = 0;
      let x: number;
      do {
        x = Math.random() * maxWidth;
        attempts++;
      } while (
        attempts < 15 && // Reduced attempts for faster generation
        positions.some(
          pos => Math.abs(pos - x) < GAME_CONFIG.FRENZY_MIN_SPACING
        )
      );
      positions.push(x);
    }

    // Staggered object creation for smoother performance
    positions.forEach((x, index) => {
      const delay = index * 80; // Small delay between each object (80ms)

      setTimeout(() => {
        // Double-check game state before creating object
        if (
          !gameStateRef.current.gamePaused &&
          gameStateRef.current.frenzyMode &&
          !gameStateRef.current.bombHit
        ) {
          const obj = createObject(x, false, true, false);
          setObjects(prev => [...prev, obj]);
        }
      }, delay);
    });
  }, [createObject, hasVisibleBombOrMonad]);

  // 3. Fixed frenzy management with proper trigger detection
  const manageFrenzyMode = useCallback(() => {
    const { score, frenzyMode, gamePaused, bombHit } = gameStateRef.current;

    // Check if should trigger frenzy - use multiple of check instead of exact match
    const shouldTriggerFrenzy =
      score >= GAME_CONFIG.FRENZY_TRIGGER_INTERVAL && // Must have minimum score
      score % GAME_CONFIG.FRENZY_TRIGGER_INTERVAL === 0 && // Multiple of trigger interval
      !frenzyMode &&
      !bombHit &&
      Math.random() < GAME_CONFIG.FRENZY_TRIGGER_CHANCE;

    if (!shouldTriggerFrenzy) return;

    console.log("Starting frenzy mode at score:", score);
    updateGameState({
      frenzyMode: true,
      frenzyTimeRemaining: GAME_CONFIG.FRENZY_DURATION,
    });

    if (!gamePaused) {
      playSound("combo"); // Use combo sound since frenzy-start might not exist
    }

    // Don't start frenzy if there are bombs/monads on screen
    if (hasVisibleBombOrMonad) return;

    setFrenzyNotification("MONANIMAL FRENZY!");
    setTimeout(() => setFrenzyNotification(null), 3000);

    clearAllTimers();

    // Wait a moment before starting waves to avoid initial lag
    setTimeout(() => {
      if (gameStateRef.current.frenzyMode) {
        createFrenzyWave();
      }
    }, 300);

    // Frenzy countdown with less frequent updates for better performance
    timersRef.current.frenzyCountdown = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.frenzyTimeRemaining - 200; // Update every 200ms instead of 100ms
        if (newTime <= 0) {
          clearInterval(timersRef.current.frenzyCountdown!);
          console.log("Ending frenzy mode");
          return { ...prev, frenzyMode: false, frenzyTimeRemaining: 0 };
        }
        return { ...prev, frenzyTimeRemaining: newTime };
      });
    }, 200);

    // Recursive wave scheduling with performance checks
    const scheduleNextWave = () => {
      timersRef.current.frenzyWaveTimer = setTimeout(() => {
        if (
          !gameStateRef.current.gamePaused &&
          gameStateRef.current.frenzyMode
        ) {
          // Check object count to prevent overwhelming the game
          const currentObjectCount = objectsRef.current.length;
          if (currentObjectCount < 20) {
            // Limit concurrent objects for performance
            createFrenzyWave();
          } else {
            console.log(
              "Skipping frenzy wave - too many objects on screen:",
              currentObjectCount
            );
          }
          scheduleNextWave();
        }
      }, GAME_CONFIG.FRENZY_WAVE_INTERVAL);
    };

    scheduleNextWave();

    // End frenzy
    timersRef.current.frenzyTimer = setTimeout(() => {
      console.log("Frenzy timer ended");
      updateGameState({ frenzyMode: false, frenzyTimeRemaining: 0 });
      if (timersRef.current.frenzyWaveTimer) {
        clearTimeout(timersRef.current.frenzyWaveTimer);
      }
    }, GAME_CONFIG.FRENZY_DURATION);
  }, [
    updateGameState,
    playSound,
    clearAllTimers,
    createFrenzyWave,
    hasVisibleBombOrMonad,
  ]);

  // STABLE OBJECT WAVE CREATION FUNCTION
  const createObjectWave = useCallback(() => {
    const { gamePaused, gameOver, bombHit, score } = gameStateRef.current;

    if (gamePaused || gameOver || bombHit) return;

    console.log("Creating object wave, score:", score);

    // Check frenzy trigger
    manageFrenzyMode();

    const waveSize =
      Math.floor(Math.random() * 3) + GAME_CONFIG.NORMAL_WAVE_SIZE.min;
    const bombChance = Math.min(
      GAME_CONFIG.BOMB_CHANCE_MAX,
      GAME_CONFIG.BOMB_CHANCE_BASE + score * GAME_CONFIG.BOMB_CHANCE_INCREASE
    );

    const rect = gameAreaRef.current?.getBoundingClientRect();
    const maxWidth = (rect ? rect.width : window.innerWidth) - 100;
    const positions: number[] = [];

    // Batch position calculation
    for (let i = 0; i < waveSize; i++) {
      let x: number;
      let attempts = 0;
      do {
        x = Math.random() * maxWidth;
        attempts++;
      } while (
        attempts < 50 &&
        positions.some(pos => Math.abs(pos - x) < GAME_CONFIG.MIN_SPACING)
      );
      positions.push(x);
    }

    // Create objects with staggered timing
    positions.forEach((x, i) => {
      setTimeout(() => {
        if (
          !gameStateRef.current.gamePaused &&
          !gameStateRef.current.gameOver
        ) {
          const random = Math.random();
          const isBomb = random < bombChance;
          const isMonad = !isBomb && random < GAME_CONFIG.MONAD_CHANCE;
          const obj = createObject(x, isBomb, false, isMonad);
          setObjects(prev => [...prev, obj]);
        }
      }, i * 200);
    });
  }, [createObject, manageFrenzyMode]);

  // 4. Improved game spawning with better frenzy integration
  useEffect(() => {
    if (
      gameState.gameStarted &&
      !gameState.gameOver &&
      !gameState.gamePaused &&
      !gameState.bombHit
    ) {
      const baseInterval = GAME_CONFIG.BASE_SPAWN_INTERVAL;
      const speedIncrease =
        Math.floor(gameState.score / 50) *
        GAME_CONFIG.SPEED_INCREASE_PER_50_POINTS;

      // During frenzy, significantly reduce normal spawning to prevent overwhelming
      const frenzyMultiplier = gameState.frenzyMode ? 4 : 1;
      const currentInterval = Math.max(
        GAME_CONFIG.MIN_SPAWN_INTERVAL,
        (baseInterval - speedIncrease) * frenzyMultiplier
      );

      console.log(
        "Setting spawn interval:",
        currentInterval,
        "Frenzy:",
        gameState.frenzyMode
      );

      // Clear existing interval
      if (timersRef.current.spawnInterval) {
        clearInterval(timersRef.current.spawnInterval);
      }

      timersRef.current.spawnInterval = setInterval(
        createObjectWave,
        currentInterval
      );

      return () => {
        if (timersRef.current.spawnInterval) {
          clearInterval(timersRef.current.spawnInterval);
          timersRef.current.spawnInterval = null;
        }
      };
    } else {
      if (timersRef.current.spawnInterval) {
        clearInterval(timersRef.current.spawnInterval);
        timersRef.current.spawnInterval = null;
      }
    }
  }, [
    gameState.gameStarted,
    gameState.gameOver,
    gameState.gamePaused,
    gameState.bombHit,
    gameState.frenzyMode,
    gameState.score,
    createObjectWave,
  ]);

  // Start button creation effect
  useEffect(() => {
    if (!gameState.gameStarted && !startButton && usernameData?.hasUsername) {
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
    }
  }, [gameState.gameStarted, startButton, usernameData?.hasUsername]);

  // Game session management effect
  useEffect(() => {
    if (
      gameState.gameStarted &&
      !gameSessionId &&
      walletAddress &&
      !gameState.gameOver &&
      !gameState.bombHit &&
      !startGameSession.isPending
    ) {
      startGameSession.mutate(
        { walletAddress: walletAddress! },
        {
          onSuccess: data => {
            setGameSessionToken(data.sessionToken);
            setGameSessionId(data.sessionId);
          },
          onError: error => {
            console.error("Error starting game session:", error);
          },
        }
      );
    }
  }, [
    gameState.gameStarted,
    gameSessionId,
    walletAddress,
    gameState.gameOver,
    gameState.bombHit,
    startGameSession,
  ]);

  // Game over handling effect
  useEffect(() => {
    if (gameState.gameOver && !gameState.gameEnded) {
      updateGameState({ gameEnded: true });

      // End game session
      if (gameSessionId) {
        endGameSession.mutate(
          { sessionId: gameSessionId },
          {
            onSuccess: () => {
              setGameSessionToken(null);
              setGameSessionId(null);
            },
            onError: error => {
              console.error("Error ending game session:", error);
              setGameSessionToken(null);
              setGameSessionId(null);
            },
          }
        );
      }

      // Submit final score
      if (timersRef.current.submitTimeout) {
        clearTimeout(timersRef.current.submitTimeout);
      }
      submitScoreBatch(gameState.localScore);
    }
  }, [
    gameState.gameOver,
    gameState.gameEnded,
    gameSessionId,
    endGameSession,
    submitScoreBatch,
    updateGameState,
    gameState.localScore,
  ]);

  // Window visibility handling effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (gameState.gameStarted && !gameState.gameOver) {
        updateGameState({ gamePaused: document.hidden });
      }
    };

    const handleWindowBlur = () => {
      if (gameState.gameStarted && !gameState.gameOver) {
        updateGameState({ gamePaused: true });
      }
    };

    const handleWindowFocus = () => {
      if (gameState.gameStarted && !gameState.gameOver) {
        updateGameState({ gamePaused: false });
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
  }, [gameState.gameStarted, gameState.gameOver, updateGameState]);

  // Collision detection and game logic (rest of the component remains the same)
  const checkSlashCollisions = useCallback(() => {
    if (
      slashPath.length < 2 ||
      gameStateRef.current.gamePaused ||
      gameStateRef.current.bombHit ||
      !usernameData?.hasUsername
    )
      return;

    const currentTime = Date.now();
    const canPlaySliceSound =
      currentTime - lastSliceTimeRef.current > GAME_CONFIG.SLICE_SOUND_THROTTLE;

    let slashHitsThisFrame = 0;
    let slashCenterX = 0;
    let slashCenterY = 0;
    let hitBomb = false;

    // Check start button collision first
    if (startButton && !startButton.sliced) {
      const lastPoint = slashPath[slashPath.length - 1];
      const secondLastPoint = slashPath[slashPath.length - 2] || lastPoint;
      const distance = Math.hypot(
        startButton.x + 75 - lastPoint.x,
        startButton.y + 40 - lastPoint.y
      );

      if (distance < 80) {
        // Create watermelon slice effect
        const watermelonSliceEffect: SliceEffect = {
          id: Date.now() + Math.random(),
          x: startButton.x,
          y: startButton.y,
          type: "fruit",
          imageSrc: "/Watermelon.svg",
          width: 160,
          height: 160,
          angle:
            (Math.atan2(
              lastPoint.y - secondLastPoint.y,
              lastPoint.x - secondLastPoint.x
            ) *
              180) /
            Math.PI,
        };

        setSliceEffects(prev => [...prev, watermelonSliceEffect]);

        // Remove slice effect after animation
        setTimeout(() => {
          setSliceEffects(prev =>
            prev.filter(effect => effect.id !== watermelonSliceEffect.id)
          );
        }, 1200);

        setStartButton(prev => (prev ? { ...prev, sliced: true } : null));
        updateGameState({ gameStarted: true });
        setSlashPath([]);
        updateGameState({ isSlashing: false });

        if (!gameStateRef.current.gamePaused) {
          playSound("start");
        }
        return;
      }
    }

    // Optimized object collision detection
    setObjects(prevObjects => {
      const newObjects = [...prevObjects];
      const newSliceEffects: SliceEffect[] = [];
      let pointsEarned = 0;

      for (let objIndex = 0; objIndex < newObjects.length; objIndex++) {
        const obj = newObjects[objIndex];
        if (obj.sliced) continue;

        // Use last few points of slash path for collision (more efficient)
        const checkPoints = slashPath.slice(-5);
        let collided = false;

        for (const point of checkPoints) {
          const distance = Math.hypot(
            obj.x + 40 - point.x,
            obj.y + 40 - point.y
          );

          if (distance < GAME_CONFIG.COLLISION_DISTANCE) {
            collided = true;
            break;
          }
        }

        if (!collided) continue;

        const lastPoint = slashPath[slashPath.length - 1];
        const secondLastPoint = slashPath[slashPath.length - 2] || lastPoint;

        // Handle different object types
        if (obj.type === "monad") {
          const currentSlashCount = obj.slashCount || 0;
          const maxSlashCount = obj.maxSlashCount || 10;

          if (currentSlashCount < maxSlashCount) {
            const newSlashCount = currentSlashCount + 1;
            newObjects[objIndex] = {
              ...obj,
              slashCount: newSlashCount,
              sliced: newSlashCount >= maxSlashCount,
            };

            if (newSlashCount === 1) {
              updateGameState({ isMonadSlashing: true, monadSlashCount: 0 });
            }

            updateGameState({ monadSlashCount: newSlashCount });
            const pointsPerSlash = obj.pointsPerSlash || 5;
            pointsEarned += pointsPerSlash;

            if (!gameStateRef.current.gamePaused) {
              playSound(
                newSlashCount >= maxSlashCount ? "combo-blitz-6" : "combo"
              );
            }

            // ADD THIS BACK - Create monad slice effects!
            if (newSlashCount >= maxSlashCount) {
              // Final monad destruction - create explosion effect
              newSliceEffects.push({
                id: Date.now() + Math.random(),
                x: obj.x,
                y: obj.y,
                type: "monad-explosion",
                imageSrc: "/monad.svg",
                width: 120,
                height: 120,
                angle:
                  (Math.atan2(
                    lastPoint.y - secondLastPoint.y,
                    lastPoint.x - secondLastPoint.x
                  ) *
                    180) /
                  Math.PI,
              });
              updateGameState({ isMonadSlashing: false, monadSlashCount: 0 });
            } else {
              // Regular monad slash effect
              newSliceEffects.push({
                id: Date.now() + Math.random(),
                x: obj.x,
                y: obj.y,
                type: "monad",
                imageSrc: "/monad.svg",
                width: 80,
                height: 80,
                angle:
                  (Math.atan2(
                    lastPoint.y - secondLastPoint.y,
                    lastPoint.x - secondLastPoint.x
                  ) *
                    180) /
                  Math.PI,
              });
            }
          }
        } else {
          // Handle regular objects
          newObjects[objIndex] = { ...obj, sliced: true };
          slashHitsThisFrame++;
          slashCenterX += lastPoint.x;
          slashCenterY += lastPoint.y;

          if (obj.type === "bomb") {
            hitBomb = true;
            if (!gameStateRef.current.gamePaused) {
              stopBombSound(obj.id.toString());
              playSound("bomb-explode");
              setTimeout(() => playSound("game-over"), 2000);
            }
          } else {
            pointsEarned += 1;
            if (canPlaySliceSound && !gameStateRef.current.gamePaused) {
              playSound("oof");
              lastSliceTimeRef.current = currentTime;
            }
          }

          // Create slice effect
          newSliceEffects.push({
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
            angle:
              (Math.atan2(
                lastPoint.y - secondLastPoint.y,
                lastPoint.x - secondLastPoint.x
              ) *
                180) /
              Math.PI,
          });
        }
      }

      // Handle combo effects
      if (slashHitsThisFrame >= 3) {
        const comboEffect: ComboEffect = {
          id: Date.now(),
          x: slashCenterX / slashHitsThisFrame,
          y: slashCenterY / slashHitsThisFrame,
          count: slashHitsThisFrame,
        };
        setComboEffects(prev => [...prev, comboEffect]);
        pointsEarned += slashHitsThisFrame;

        if (!gameStateRef.current.gamePaused) {
          playSound("combo");
        }

        setTimeout(() => {
          setComboEffects(prev => prev.filter(e => e.id !== comboEffect.id));
        }, 2000);
      }

      // Add slice effects
      if (newSliceEffects.length > 0) {
        setSliceEffects(prev => [...prev, ...newSliceEffects]);
        setTimeout(() => {
          setSliceEffects(prev =>
            prev.filter(
              effect =>
                !newSliceEffects.some(newEffect => newEffect.id === effect.id)
            )
          );
        }, 1200);
      }

      // Handle bomb hit
      if (hitBomb) {
        updateGameState({
          bombHit: true,
          isMonadSlashing: false,
          monadSlashCount: 0,
          frenzyMode: false,
          frenzyTimeRemaining: 0,
        });
        clearAllTimers();
        setTimeout(() => {
          updateGameState({ gameOver: true });
          setObjects([]);
          setSliceEffects([]);
        }, 2000);
      }

      // Update score
      if (pointsEarned > 0) {
        updateScore(pointsEarned);
      }

      return newObjects;
    });
  }, [
    slashPath,
    startButton,
    usernameData?.hasUsername,
    stopBombSound,
    playSound,
    updateGameState,
    updateScore,
    clearAllTimers,
  ]);

  // Optimized object updates
  const updateObjects = useCallback(() => {
    if (
      gameStateRef.current.gamePaused ||
      gameStateRef.current.bombHit ||
      gameStateRef.current.isMonadSlashing
    )
      return;

    setObjects(prevObjects => {
      const rect = gameAreaRef.current?.getBoundingClientRect();
      const bottomBoundary = (rect ? rect.height : window.innerHeight) + 100;

      return prevObjects
        .map(obj => ({
          ...obj,
          x: obj.x + obj.velocityX,
          y: obj.y + obj.velocityY,
          velocityY: obj.velocityY + obj.gravity,
          rotation: obj.rotation + obj.rotationSpeed,
        }))
        .filter(obj => {
          const shouldKeep = obj.y < bottomBoundary && !obj.sliced;
          if (
            !shouldKeep &&
            obj.type === "bomb" &&
            !gameStateRef.current.gamePaused
          ) {
            stopBombSound(obj.id.toString());
          }
          return shouldKeep;
        });
    });

    // Update start button
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
        return updated.y > bottomBoundary ? null : updated;
      });
    }
  }, [startButton, stopBombSound]);

  // Main game loop - consolidated into single effect
  useEffect(() => {
    if (gameState.gameOver || gameState.gamePaused || gameState.bombHit) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
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
  }, [
    updateObjects,
    checkSlashCollisions,
    gameState.gameOver,
    gameState.gamePaused,
    gameState.bombHit,
  ]);

  // Optimized event handlers with reduced re-renders
  const eventHandlers = useMemo(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Handle click to resume when paused
      if (
        gameStateRef.current.gamePaused &&
        gameStateRef.current.gameStarted &&
        !gameStateRef.current.gameOver &&
        !gameStateRef.current.bombHit
      ) {
        updateGameState({ gamePaused: false });
        return;
      }

      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      updateGameState({ isSlashing: true });
      setSlashPath([{ x, y }]);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (
        !gameStateRef.current.isSlashing ||
        gameStateRef.current.gameOver ||
        gameStateRef.current.gamePaused ||
        gameStateRef.current.bombHit
      )
        return;

      e.preventDefault();
      e.stopPropagation();

      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setSlashPath(prev => {
        const last = prev[prev.length - 1];
        if (!last) return [{ x, y }];

        const dx = x - last.x;
        const dy = y - last.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= GAME_CONFIG.MOVEMENT_THRESHOLD) return prev;

        const steps = Math.max(1, Math.min(8, Math.floor(distance / 4)));
        const points: SlashPoint[] = [];

        for (let i = 1; i <= steps; i++) {
          points.push({
            x: last.x + (dx * i) / steps,
            y: last.y + (dy * i) / steps,
          });
        }

        return [...prev, ...points].slice(-GAME_CONFIG.MAX_TRAIL_POINTS);
      });
    };

    const handleEnd = () => {
      updateGameState({ isSlashing: false });
      setSlashPath([]);
    };

    return { handleStart, handleMove, handleEnd };
  }, [updateGameState]);

  // Single event listener effect
  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const { handleStart, handleMove, handleEnd } = eventHandlers;

    // Mouse handlers
    const mouseDownHandler = (e: MouseEvent) => {
      if (e.button !== 0) return;
      handleStart(e);
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (e.buttons !== 1) return;
      handleMove(e);
    };

    // Touch handlers
    const touchStartHandler = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        handleEnd();
        return;
      }
      handleStart(e);
    };

    const touchMoveHandler = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        handleEnd();
        return;
      }
      handleMove(e);
    };

    const touchEndHandler = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    // Add listeners
    gameArea.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", handleEnd);
    gameArea.addEventListener("mouseleave", handleEnd);

    gameArea.addEventListener("touchstart", touchStartHandler, {
      passive: false,
    });
    gameArea.addEventListener("touchmove", touchMoveHandler, {
      passive: false,
    });
    document.addEventListener("touchend", touchEndHandler, { passive: false });
    document.addEventListener("touchcancel", touchEndHandler, {
      passive: false,
    });

    return () => {
      gameArea.removeEventListener("mousedown", mouseDownHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", handleEnd);
      gameArea.removeEventListener("mouseleave", handleEnd);

      gameArea.removeEventListener("touchstart", touchStartHandler);
      gameArea.removeEventListener("touchmove", touchMoveHandler);
      document.removeEventListener("touchend", touchEndHandler);
      document.removeEventListener("touchcancel", touchEndHandler);
    };
  }, [eventHandlers]);

  // Memoized game stats and functions
  const gameStats: GameStats = useMemo(
    () => ({
      score: gameState.score,
      objectsSliced: gameState.score,
      speedLevel: Math.floor(gameState.score / 50) + 1,
    }),
    [gameState.score]
  );

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      localScore: 0,
      submittedScore: 0,
      gameOver: false,
      gameStarted: false,
      gamePaused: false,
      bombHit: false,
      gameEnded: false,
      isSlashing: false,
      isMonadSlashing: false,
      monadSlashCount: 0,
      frenzyMode: false,
      frenzyTimeRemaining: 0,
      isSubmitting: false,
    });
    setObjects([]);
    setStartButton(null);
    setSlashPath([]);
    setSliceEffects([]);
    setComboEffects([]);
    setFrenzyNotification("");
    lastSliceTimeRef.current = 0;
    clearAllTimers();
  }, [clearAllTimers]);

  const togglePause = useCallback(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.bombHit) {
      updateGameState({ gamePaused: !gameState.gamePaused });
    }
  }, [
    gameState.gameStarted,
    gameState.gameOver,
    gameState.bombHit,
    gameState.gamePaused,
    updateGameState,
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-[100dvh] overflow-hidden select-none game-area"
    >
      <PauseModal
        gameOver={gameState.gameOver}
        gamePaused={gameState.gamePaused}
        gameStarted={gameState.gameStarted}
        score={gameState.score}
      />

      <Stats gameStarted={gameState.gameStarted} score={gameState.score} />

      <PauseButton
        bombHit={gameState.bombHit}
        gameOver={gameState.gameOver}
        gamePaused={gameState.gamePaused}
        gameStarted={gameState.gameStarted}
        onTogglePause={togglePause}
      />

      <ResponsiveUserProfile
        isLoadingUserName={isLoadingUserName}
        usernameData={usernameData}
        walletAddress={walletAddress}
        playerScoreData={playerScoreData}
        isScoreLoading={isScoreLoading}
      />

      <FrenzyNotification notificationMessage={frenzyNotification} />

      <MonadFruitSlashCounter
        isMonadSlashing={gameState.isMonadSlashing}
        monadSlashCount={gameState.monadSlashCount}
      />

      {usernameData?.hasUsername &&
      !gameState.gameStarted &&
      startButton &&
      !startButton.sliced ? (
        <div className="h-screen flex flex-col items-center justify-center gap-4 z-40 select-none">
          <Image
            src="/Watermelon.svg"
            alt="start-watermelon"
            width={160}
            height={160}
            className="w-40 h-40 object-contain animate-spin [animation-duration:8s] landscape:w-30 landscape:h-30"
            draggable={false}
          />
          <p className="text-center font-extrabold italic text-4xl text-yellow-400 drop-shadow-[0_0_10px_rgba(255,255,0,0.7)] tracking-wider animate-pulse">
            Slash to start!
          </p>
        </div>
      ) : (
        isLoadingUserName && (
          <div className="absolute z-40 select-none top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center gap-1 text-white/70">
              <div className="w-6 h-6 border border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xl">Fetching username...</span>
            </div>
          </div>
        )
      )}

      <GameObjects objects={objects} />
      <SliceEffects sliceEffects={sliceEffects} />
      <ComboEffects comboEffects={comboEffects} />
      <SlashTrail slashPath={slashPath} />

      <GameOverModal
        gameOver={gameState.gameOver}
        gameStats={gameStats}
        resetGame={resetGame}
      />
    </div>
  );
}

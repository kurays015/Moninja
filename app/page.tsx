"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import MonadAuth from "./components/MonadAuth";

export default function Home() {
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameTime, setGameTime] = useState(30); // 30 second game
  const [gameStarted, setGameStarted] = useState(false);
  const [monadAccountAddress, setMonadAccountAddress] = useState<string | null>(null);
  
  const { authenticated } = usePrivy();

  const startGame = () => {
    setScore(0);
    setGameEnded(false);
    setGameStarted(true);
    setGameTime(30);
    
    const timer = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameEnded(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClick = () => {
    if (gameStarted && !gameEnded) {
      setScore(score + 1);
    }
  };

  const submitScore = async () => {
    if (!authenticated || !monadAccountAddress) {
      alert("Please connect your Monad Games ID account first!");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player: monadAccountAddress,
          scoreAmount: score,
          transactionAmount: 0,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Score submitted successfully! Transaction hash: ${result.transactionHash}`);
      } else {
        alert(`Error submitting score: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Error submitting score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameEnded(false);
    setGameStarted(false);
    setGameTime(30);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold mb-8">Click Attack!</h1>
        
        {/* Monad Games Authentication */}
        <div className="mb-8">
          <MonadAuth onAccountAddress={setMonadAccountAddress} />
        </div>

        {/* Game Stats */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <div className="text-2xl font-bold mb-2">Score: {score}</div>
          <div className="text-lg">Time: {gameTime}s</div>
        </div>

        {/* Game Controls */}
        {!gameStarted && !gameEnded && (
          <button
            onClick={startGame}
            className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold"
          >
            Start Game
          </button>
        )}

        {gameStarted && !gameEnded && (
          <button
            onClick={handleClick}
            className="w-full py-8 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg text-2xl font-bold transform active:scale-95 transition-transform"
          >
            CLICK ME! 🎯
          </button>
        )}

        {gameEnded && (
          <div className="space-y-4">
            <div className="bg-yellow-900 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">Final Score: {score}</p>
              <p className="text-sm text-gray-300">Clicks per second: {(score / 30).toFixed(1)}</p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
              >
                Play Again
              </button>
              
              {monadAccountAddress && (
                <button
                  onClick={submitScore}
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-lg font-semibold"
                >
                  {submitting ? "Submitting..." : "Submit Score"}
                </button>
              )}
            </div>
            
            {!monadAccountAddress && (
              <p className="text-yellow-400 text-sm">Connect your Monad Games ID to submit your score!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

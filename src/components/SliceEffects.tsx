import React from "react";
import Image from "next/image";
import { SliceEffect } from "../types";

interface SliceEffectsProps {
  sliceEffects: SliceEffect[];
}

export default function SliceEffects({ sliceEffects }: SliceEffectsProps) {
  return (
    <>
      {sliceEffects.map((effect: SliceEffect, index) => (
        <div
          key={index}
          className="absolute pointer-events-none z-30"
          style={{
            left: effect.x,
            top: effect.y,
            transform: `rotate(${effect.angle}deg)`,
          }}
        >
          {effect.type === "fruit" ? (
            <div
              className="relative"
              style={{ width: effect.width ?? 80, height: effect.height ?? 80 }}
            >
              {/* Left half image */}
              <div
                className="absolute overflow-hidden"
                style={{
                  left: 0,
                  top: 0,
                  width: (effect.width ?? 80) / 2,
                  height: effect.height ?? 80,
                  clipPath: "inset(0 50% 0 0)",
                  animation: "sliceHalfLeft 1.0s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/monanimals/MolandakHD.png"}
                  alt="slice-left"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="object-contain"
                  draggable={false}
                />
              </div>

              {/* Right half image */}
              <div
                className="absolute overflow-hidden"
                style={{
                  right: 0,
                  top: 0,
                  width: (effect.width ?? 80) / 2,
                  height: effect.height ?? 80,
                  clipPath: "inset(0 0 0 50%)",
                  animation: "sliceHalfRight 1.0s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/monanimals/MolandakHD.png"}
                  alt="slice-right"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="object-contain"
                  draggable={false}
                />
              </div>
              {/* Slice line effect */}
              <div
                className="absolute w-20 h-1 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-400"
                style={{
                  left: 0,
                  top: (effect.height ?? 80) / 2 - 1,
                  boxShadow: "0 0 15px rgba(255, 255, 0, 0.9)",
                  animation: "sliceLineEffect 0.4s ease-out forwards",
                }}
              />
            </div>
          ) : effect.type === "monad" ? (
            <div
              className="relative"
              style={{ width: effect.width ?? 80, height: effect.height ?? 80 }}
            >
              {/* Main monad icon with spin & pulse */}
              <div
                className="absolute inset-0"
                style={{
                  animation: "monadHit 0.6s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/monad.svg"}
                  alt="monad-slash"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_purple]"
                  draggable={false}
                />
              </div>

              {/* Shockwave ring */}
              <div
                className="absolute inset-0 border-2 border-purple-400 rounded-full"
                style={{
                  animation: "monadRing 0.5s ease-out forwards",
                }}
              />

              {/* Slash line */}
              <div
                className="absolute w-24 h-2 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
                style={{
                  left: "-8px",
                  top: (effect.height ?? 80) / 2 - 4,
                  transform: `rotate(${effect.angle}deg)`,
                  boxShadow: "0 0 25px rgba(168, 85, 247, 1)",
                  animation: "monadSlashLine 0.4s ease-out forwards",
                }}
              />

              {/* Particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) rotate(${
                      i * 60
                    }deg) translateY(-25px)`,
                    animation: "monadParticle 0.6s ease-out forwards",
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          ) : effect.type === "monad-explosion" ? (
            <div
              className="relative"
              style={{
                width: effect.width ?? 120,
                height: effect.height ?? 120,
              }}
            >
              {/* Final monad explosion effect */}
              <div
                className="absolute inset-0"
                style={{
                  animation: "monadFinalExplosion 1.2s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/monad.svg"}
                  alt="monad-explosion"
                  width={effect.width ?? 120}
                  height={effect.height ?? 120}
                  className="w-full h-full object-contain drop-shadow-[0_0_50px_purple]"
                  draggable={false}
                />
              </div>

              {/* Explosion fragments */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      "--explode-x": `${
                        Math.cos((i * 30 * Math.PI) / 180) * 80
                      }px`,
                      "--explode-y": `${
                        Math.sin((i * 30 * Math.PI) / 180) * 80
                      }px`,
                      "--explode-rotate": `${i * 30}deg`,
                      animation:
                        "monadExplosionFragment 1.0s ease-out forwards",
                      animationDelay: `${i * 0.05}s`,
                    } as React.CSSProperties
                  }
                />
              ))}

              {/* Multiple explosion rings */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={`ring-${i}`}
                  className="absolute inset-0 border-2 border-purple-400 rounded-full"
                  style={{
                    animation: "monadSlashRing 1.0s ease-out forwards",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}

              {/* Central flash */}
              <div
                className="absolute inset-0 bg-gradient-radial from-purple-400 to-transparent rounded-full"
                style={{
                  animation: "monadFinalExplosion 0.8s ease-out forwards",
                }}
              />
            </div>
          ) : effect.type === "monad-shatter" ? (
            <div
              className="relative"
              style={{
                width: effect.width ?? 80,
                height: effect.height ?? 80,
              }}
            >
              {/* Shattering monad pieces */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      width: "20px",
                      height: "20px",
                      transform: "translate(-50%, -50%)",
                      "--shatter-angle": `${i * 45}deg`,
                      "--shatter-distance": "60px",
                      animation: "monadShatter 1.5s ease-out forwards",
                      animationDelay: `${i * 0.1}s`,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={effect.imageSrc ?? "/monad.svg"}
                    alt="monad-piece"
                    width={20}
                    height={20}
                    className="w-full h-full object-contain opacity-80"
                    draggable={false}
                  />
                </div>
              ))}

              {/* Shatter flash effect */}
              <div
                className="absolute inset-0 bg-gradient-radial from-purple-400 to-transparent rounded-full"
                style={{
                  animation: "monadShatterFlash 0.6s ease-out forwards",
                }}
              />
            </div>
          ) : effect.type === "bomb" ? (
            <div className="relative w-24 h-12">
              <div
                className="absolute w-6 h-6 bg-red-600 rotate-12"
                style={{
                  left: "-3px",
                  top: "-2px",
                  animation: "explodeFragment1 0.8s ease-out forwards",
                }}
              />
              <div
                className="absolute w-4 h-4 bg-red-500 rotate-45"
                style={{
                  right: "0px",
                  top: "0px",
                  animation: "explodeFragment2 0.8s ease-out forwards",
                }}
              />
              <div
                className="absolute w-5 h-5 bg-red-700 -rotate-12"
                style={{
                  left: "8px",
                  bottom: "-2px",
                  animation: "explodeFragment3 0.8s ease-out forwards",
                }}
              />
              <div
                className="absolute w-3 h-3 bg-orange-500 rounded-full"
                style={{
                  right: "6px",
                  bottom: "1px",
                  animation: "explodeFragment4 0.8s ease-out forwards",
                }}
              />
              <div
                className="absolute w-20 h-20 bg-gradient-radial from-yellow-400 to-orange-500 rounded-full opacity-80"
                style={{
                  left: "2px",
                  top: "-4px",
                  animation: "explosionFlash 0.6s ease-out forwards",
                }}
              />
            </div>
          ) : (
            // Start button slice effect
            <div className="relative" style={{ width: 160, height: 160 }}>
              {/* Left half */}
              <div
                className="absolute overflow-hidden"
                style={{
                  left: 0,
                  top: 0,
                  width: 80,
                  height: 160,
                  clipPath: "inset(0 50% 0 0 round 80px)",
                  animation: "sliceHalfLeft 1.0s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/Watermelon.svg"}
                  alt="start-left"
                  width={160}
                  height={160}
                  className="w-[160px] h-[160px] object-contain"
                  draggable={false}
                />
              </div>
              {/* Right half */}
              <div
                className="absolute overflow-hidden"
                style={{
                  right: 0,
                  top: 0,
                  width: 80,
                  height: 160,
                  clipPath: "inset(0 0 0 50% round 80px)",
                  animation: "sliceHalfRight 1.0s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/Watermelon.svg"}
                  alt="start-right"
                  width={160}
                  height={160}
                  className="w-[160px] h-[160px] object-contain"
                  draggable={false}
                />
              </div>
              {/* Slice line */}
              <div
                className="absolute w-full h-1 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full"
                style={{
                  left: 0,
                  top: 79,
                  boxShadow: "0 0 15px rgba(255, 255, 0, 0.9)",
                  animation: "sliceLineEffect 0.4s ease-out forwards",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

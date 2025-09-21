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
          ) : effect.type === "john" ? (
            <div
              className="relative"
              style={{ width: effect.width ?? 80, height: effect.height ?? 80 }}
            >
              {/* Left half of john */}
              <div
                className="absolute overflow-hidden"
                style={{
                  left: 0,
                  top: 0,
                  width: (effect.width ?? 80) / 2,
                  height: effect.height ?? 80,
                  clipPath: "inset(0 50% 0 0)",
                  animation: "johnHalfLeft 0.9s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/john.jpg"}
                  alt="john-left"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="object-contain drop-shadow-[0_0_25px_cyan]"
                  draggable={false}
                />
              </div>
              {/* Right half of john */}
              <div
                className="absolute overflow-hidden"
                style={{
                  right: 0,
                  top: 0,
                  width: (effect.width ?? 80) / 2,
                  height: effect.height ?? 80,
                  clipPath: "inset(0 0 0 50%)",
                  animation: "johnHalfRight 0.9s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/john.jpg"}
                  alt="john-right"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="object-contain drop-shadow-[0_0_25px_cyan]"
                  draggable={false}
                />
              </div>
              {/* Electric shockwave rings */}
              <div
                className="absolute inset-0 border-2 border-cyan-400 rounded-full"
                style={{
                  animation: "johnElectricRing1 0.6s ease-out forwards",
                }}
              />
              <div
                className="absolute inset-0 border border-blue-300 rounded-full"
                style={{
                  animation: "johnElectricRing2 0.8s ease-out forwards",
                  animationDelay: "0.1s",
                }}
              />
              {/* Lightning slash line */}
              <div
                className="absolute w-24 h-2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500"
                style={{
                  left: "-8px",
                  top: (effect.height ?? 80) / 2 - 4,
                  boxShadow:
                    "0 0 30px rgba(6, 182, 212, 1), 0 0 15px rgba(59, 130, 246, 0.8)",
                  animation: "johnLightningSlash 0.5s ease-out forwards",
                }}
              />
              {/* Electric particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      "--particle-angle": `${i * 45}deg`,
                      "--particle-distance": "35px",
                      animation: "johnElectricParticle 0.8s ease-out forwards",
                      animationDelay: `${i * 0.08}s`,
                      boxShadow: "0 0 8px rgba(6, 182, 212, 0.8)",
                    } as React.CSSProperties
                  }
                />
              ))}
              {/* Lightning bolts */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`bolt-${i}`}
                  className="absolute w-0.5 h-6 bg-gradient-to-b from-cyan-200 to-blue-300 rounded-full"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      "--bolt-angle": `${i * 90 + 30}deg`,
                      "--bolt-distance": "20px",
                      animation: "johnLightningBolt 0.4s ease-out forwards",
                      animationDelay: `${i * 0.05}s`,
                      boxShadow: "0 0 10px rgba(6, 182, 212, 1)",
                    } as React.CSSProperties
                  }
                />
              ))}
              {/* Center electric flash */}
              <div
                className="absolute inset-0 bg-gradient-radial from-cyan-300 via-blue-400 to-transparent rounded-full opacity-60"
                style={{
                  animation: "johnElectricFlash 0.3s ease-out forwards",
                }}
              />
            </div>
          ) : effect.type === "john-shatter" ? (
            <div
              className="relative"
              style={{
                width: effect.width ?? 80,
                height: effect.height ?? 80,
              }}
            >
              {/* Shattering john pieces with electric effect */}
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      width: "18px",
                      height: "18px",
                      transform: "translate(-50%, -50%)",
                      "--shatter-angle": `${i * 36}deg`,
                      "--shatter-distance": "80px",
                      animation: "johnElectricShatter 2.0s ease-out forwards",
                      animationDelay: `${i * 0.08}s`,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={effect.imageSrc ?? "/john.jpg"}
                    alt="john-piece"
                    width={18}
                    height={18}
                    className="w-full h-full object-contain opacity-90 drop-shadow-[0_0_8px_cyan]"
                    draggable={false}
                  />
                </div>
              ))}
              {/* Electric explosion effect */}
              <div
                className="absolute inset-0 bg-gradient-radial from-cyan-200 via-blue-300 to-transparent rounded-full"
                style={{
                  animation: "johnElectricExplosion 1.0s ease-out forwards",
                  boxShadow: "0 0 50px rgba(6, 182, 212, 0.8)",
                }}
              />
              {/* Electric discharge lines */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={`discharge-${i}`}
                  className="absolute w-0.5 h-20 bg-gradient-to-t from-transparent via-cyan-300 to-transparent"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      "--discharge-angle": `${i * 30}deg`,
                      animation: "johnElectricDischarge 0.8s ease-out forwards",
                      animationDelay: `${i * 0.03}s`,
                      boxShadow: "0 0 4px rgba(6, 182, 212, 0.6)",
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ) : effect.type === "monad" ? (
            <div
              className="relative"
              style={{ width: effect.width ?? 80, height: effect.height ?? 80 }}
            >
              {/* Left half of monad */}
              <div
                className="absolute overflow-hidden"
                style={{
                  left: 0,
                  top: 0,
                  width: (effect.width ?? 80) / 2,
                  height: effect.height ?? 80,
                  clipPath: "inset(0 50% 0 0)",
                  animation: "monadHalfLeft 0.8s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/monad.svg"}
                  alt="monad-left"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="object-contain drop-shadow-[0_0_20px_purple]"
                  draggable={false}
                />
              </div>
              {/* Right half of monad */}
              <div
                className="absolute overflow-hidden"
                style={{
                  right: 0,
                  top: 0,
                  width: (effect.width ?? 80) / 2,
                  height: effect.height ?? 80,
                  clipPath: "inset(0 0 0 50%)",
                  animation: "monadHalfRight 0.8s ease-out forwards",
                }}
              >
                <Image
                  src={effect.imageSrc ?? "/monad.svg"}
                  alt="monad-right"
                  width={effect.width ?? 80}
                  height={effect.height ?? 80}
                  className="object-contain drop-shadow-[0_0_20px_purple]"
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
                  boxShadow: "0 0 25px rgba(168, 85, 247, 1)",
                  animation: "monadSlashLine 0.4s ease-out forwards",
                }}
              />
              {/* Particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                  style={
                    {
                      left: "50%",
                      top: "50%",
                      "--particle-angle": `${i * 60}deg`,
                      animation: "monadParticle 0.6s ease-out forwards",
                      animationDelay: `${i * 0.05}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
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
                  src={effect.imageSrc ?? "/monad.svg"}
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
                  src={effect.imageSrc ?? "/monad.svg"}
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

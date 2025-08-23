import { ComboEffect } from "../types";

interface ComboEffectsProps {
  comboEffects: ComboEffect[];
}

export default function ComboEffects({ comboEffects }: ComboEffectsProps) {
  return (
    <>
      {comboEffects.map((combo, index) => (
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
    </>
  );
}

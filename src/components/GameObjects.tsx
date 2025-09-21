import Image from "next/image";
import { GameObject } from "../types";

interface GameObjectsProps {
  objects: GameObject[];
}

export default function GameObjects({ objects }: GameObjectsProps) {
  return (
    <>
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
                src={`/monanimals/${obj.objectName ?? "MolandakHD.png"}`}
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
          ) : obj.type === "john" ? (
            <div className="relative w-full h-full">
              <Image
                src={`/john.jpg`}
                alt="monad"
                width={100}
                height={100}
                className="w-full h-full object-contain drop-shadow-[0_0_20px_purple] rounded-full"
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
    </>
  );
}

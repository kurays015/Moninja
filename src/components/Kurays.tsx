import Link from "next/link";

export default function Kurays() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-1 text-white/60  text-sm font-medium tracking-wide ">
        <span>Made by:</span>
        <Link
          href="https://x.com/constkurays"
          target="_blank"
          referrerPolicy="no-referrer"
          className="cursor-pointer hover:text-white/90 transition-all duration-300 hover:scale-105"
        >
          @constkurays
        </Link>
      </div>
    </div>
  );
}

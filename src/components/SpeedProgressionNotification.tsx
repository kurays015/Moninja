interface SpeedProgressionNotificationProps {
  message: string | null;
}

export default function SpeedProgressionNotification({
  message,
}: SpeedProgressionNotificationProps) {
  if (!message) return null;

  // Determine color based on message content
  let colorClass = "text-yellow-400 drop-shadow-[0_0_10px_rgba(255,255,0,0.7)]";
  if (message.includes("DANGER") || message.includes("EXTREME")) {
    colorClass = "text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]";
  } else if (message.includes("MAXIMUM")) {
    colorClass = "text-purple-500 drop-shadow-[0_0_20px_rgba(128,0,255,0.9)]";
  } else if (message.includes("High Speed")) {
    colorClass = "text-orange-500 drop-shadow-[0_0_12px_rgba(255,165,0,0.8)]";
  }

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="animate-bounce-in">
        <h2
          className={`text-4xl md:text-6xl font-black italic ${colorClass} 
          animate-pulse tracking-wider text-center
          [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)]`}
        >
          {message}
        </h2>
      </div>
    </div>
  );
}

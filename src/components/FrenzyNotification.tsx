export default function FrenzyNotification({
  notificationMessage,
}: {
  notificationMessage: string | null;
}) {
  if (!notificationMessage) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-yellow-300 animate-pulse">
        <h2 className="text-4xl font-bold text-center mb-2 drop-shadow-lg">
          {notificationMessage}
        </h2>
      </div>
    </div>
  );
}

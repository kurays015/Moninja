import Leaderboard from "../components/Leaderboard";
import MonadAuth from "../components/MonadAuth";

export default function Home() {
  return (
    <div>
      <MonadAuth />
      <Leaderboard />
    </div>
  );
}

import { cookies } from "next/headers";
import { decryptSessionCookie, getActiveSession } from "./sessions";

export async function getSessionFromRequest() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("game_session");

    if (!sessionCookie) {
      return null;
    }

    const decrypted = await decryptSessionCookie(sessionCookie.value);

    if (!decrypted) {
      return null;
    }

    const session = getActiveSession(decrypted.sessionId);

    return session;
  } catch (error) {
    console.error("Error getting session from request:", error);
    return null;
  }
}

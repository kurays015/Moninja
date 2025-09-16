import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  if (!page || parseInt(page) < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  try {
    const res = await axios.get(
      `${process.env.MONAD_CLIP_BASE_URL}/api/leaderboard?page=${page}&gameId=12&sortBy=scores`
    );

    if (!res.data) {
      return NextResponse.json({ error: res.statusText }, { status: 404 });
    }

    return NextResponse.json({ data: res.data });
  } catch (error: unknown) {
    console.error("Unexpected error in games endpoint:", error);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

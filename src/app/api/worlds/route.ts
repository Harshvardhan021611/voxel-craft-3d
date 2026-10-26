import { db } from "@/db";
import { worlds } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, seed, dimension, mode } = body;

    await db.insert(worlds).values({
      ownerId: 1,
      name: name || "New World",
      seed: seed || Math.random().toString(36).slice(2),
      mode: mode || "survival",
      dimension: dimension || "overworld",
      public: true,
      maxPlayers: 20,
    });

    return NextResponse.json({ success: true, message: "World created" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create world" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const all = await db.select().from(worlds).limit(10);
    return NextResponse.json({ worlds: all });
  } catch {
    return NextResponse.json({ worlds: [] });
  }
}

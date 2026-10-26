import { db } from "@/db";
import { worldPresence, worlds } from "@/db/schema";
import { and, desc, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function randomSeed() {
  return String(Math.floor(Math.random() * 900000) + 1000);
}

export async function POST(req: Request) {
  let requested: { mode?: string; seed?: string; name?: string } = {};
  try {
    requested = await req.json();
  } catch {
    requested = {};
  }

  try {
    // Reuse a public open world when one exists, otherwise create it.
    let row = (
      await db.select().from(worlds).where(eq(worlds.public, true)).orderBy(desc(worlds.id)).limit(1)
    )[0];

    // Give the shared world a proper open-world name if a placeholder exists.
    if (row?.name === "New World") {
      const renamed = await db
        .update(worlds)
        .set({ name: "Verdant Frontier", updatedAt: new Date() })
        .where(eq(worlds.id, row.id))
        .returning();
      row = renamed[0] ?? row;
    }

    if (!row) {
      const created = await db
        .insert(worlds)
        .values({
          ownerId: 1,
          name: requested.name?.slice(0, 40) || "Verdant Frontier",
          seed: requested.seed || randomSeed(),
          mode: requested.mode === "creative" ? "creative" : "survival",
          dimension: "overworld",
          public: true,
          maxPlayers: 32,
          blockData: {},
          chunkData: {},
        })
        .returning();
      row = created[0];
    }

    const since = new Date(Date.now() - 30_000);
    const active = await db
      .select()
      .from(worldPresence)
      .where(and(eq(worldPresence.worldId, row.id), gt(worldPresence.updatedAt, since)));

    return NextResponse.json({
      world: {
        id: row.id,
        name: row.name,
        seed: row.seed,
        mode: row.mode,
        public: row.public,
        maxPlayers: row.maxPlayers,
      },
      edits: (row.blockData as Record<string, number>) ?? {},
      players: active.map((player) => ({
        clientId: player.clientId,
        name: player.name,
        x: player.x,
        y: player.y,
        z: player.z,
        yaw: player.yaw,
        device: player.device,
      })),
    });
  } catch {
    return NextResponse.json({ world: null, edits: {}, players: [] }, { status: 200 });
  }
}

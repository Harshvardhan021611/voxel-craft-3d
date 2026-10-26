import { db } from "@/db";
import { worldPresence, worlds } from "@/db/schema";
import { and, eq, gt, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PresenceBody {
  clientId?: string;
  name?: string;
  device?: string;
  x?: number;
  y?: number;
  z?: number;
  yaw?: number;
  edits?: Record<string, number>;
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const worldId = Number(id);
  if (!Number.isFinite(worldId)) {
    return NextResponse.json({ ok: false, players: [] }, { status: 400 });
  }

  let body: PresenceBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const clientId = (body.clientId || "anonymous").slice(0, 64);
  const name = (body.name || "Explorer").slice(0, 32);
  const device = ["pc", "mobile", "controller"].includes(body.device ?? "") ? body.device! : "pc";

  try {
    await db
      .insert(worldPresence)
      .values({
        worldId,
        clientId,
        name,
        device,
        x: Number(body.x) || 0,
        y: Number(body.y) || 20,
        z: Number(body.z) || 0,
        yaw: Number(body.yaw) || 0,
      })
      .onConflictDoUpdate({
        target: [worldPresence.worldId, worldPresence.clientId],
        set: {
          name,
          device,
          x: Number(body.x) || 0,
          y: Number(body.y) || 20,
          z: Number(body.z) || 0,
          yaw: Number(body.yaw) || 0,
          updatedAt: new Date(),
        },
      });

    // Merge block edits so every platform sees the same persistent world.
    if (body.edits && typeof body.edits === "object") {
      const existing = (await db.select().from(worlds).where(eq(worlds.id, worldId)).limit(1))[0];
      if (existing) {
        const merged: Record<string, number> = {
          ...((existing.blockData as Record<string, number>) ?? {}),
        };
        let count = 0;
        for (const [key, value] of Object.entries(body.edits)) {
          if (typeof value !== "number") continue;
          if (!/^-?\d+\|-?\d+\|-?\d+$/.test(key)) continue;
          merged[key] = value;
          if (++count > 4000) break;
        }
        const keys = Object.keys(merged);
        const trimmed: Record<string, number> = {};
        for (const key of keys.slice(-20000)) trimmed[key] = merged[key];
        await db
          .update(worlds)
          .set({ blockData: trimmed, updatedAt: new Date() })
          .where(eq(worlds.id, worldId));
      }
    }

    const since = new Date(Date.now() - 30_000);
    const active = await db
      .select()
      .from(worldPresence)
      .where(and(eq(worldPresence.worldId, worldId), gt(worldPresence.updatedAt, since), ne(worldPresence.clientId, clientId)));

    return NextResponse.json({
      ok: true,
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
    return NextResponse.json({ ok: false, players: [] }, { status: 200 });
  }
}

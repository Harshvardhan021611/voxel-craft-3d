import { NextResponse } from "next/server";
import { BIOMES, CHUNK_SIZE, SEA_LEVEL, WorldEngine } from "@/lib/voxel/world";

export const dynamic = "force-dynamic";

/** Lightweight generator diagnostics: proves infinite terrain, biomes and structures. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const seed = url.searchParams.get("seed") ?? "90210";
  const x = Number(url.searchParams.get("x") ?? 0) || 0;
  const z = Number(url.searchParams.get("z") ?? 0) || 0;

  const started = performance.now();
  const engine = new WorldEngine(seed);
  const radius = 2;
  const biomeCounts: Record<string, number> = {};
  let blocks = 0;
  let chunkCost = 0;
  let samples = 0;

  for (let cx = Math.floor(x / CHUNK_SIZE) - radius; cx <= Math.floor(x / CHUNK_SIZE) + radius; cx++) {
    for (let cz = Math.floor(z / CHUNK_SIZE) - radius; cz <= Math.floor(z / CHUNK_SIZE) + radius; cz++) {
      const chunkStart = performance.now();
      const data = engine.buildChunk(cx, cz);
      blocks += data.count;
      chunkCost += performance.now() - chunkStart;
      samples++;
      const biomeName = BIOMES[data.biome]?.name ?? "Unknown";
      biomeCounts[biomeName] = (biomeCounts[biomeName] ?? 0) + 1;
    }
  }

  const landmark = engine.nearestLandmark(x, z, 2);
  const origin = engine.columnAt(x, z);

  return NextResponse.json({
    seed,
    generator: "VoxelCraft deterministic value-noise v2",
    infinite: true,
    seaLevel: SEA_LEVEL,
    chunkSize: CHUNK_SIZE,
    origin: { x, z, height: origin.h, biome: BIOMES[origin.biome]?.name ?? "Unknown" },
    chunksSampled: samples,
    blockInstances: blocks,
    biomeCounts,
    nearestLandmark: landmark
      ? { name: landmark.name, type: landmark.type, x: landmark.x, z: landmark.z, distance: Math.round(landmark.distance) }
      : null,
    averageChunkMs: Number((chunkCost / Math.max(1, samples)).toFixed(2)),
    totalMs: Number((performance.now() - started).toFixed(1)),
  });
}

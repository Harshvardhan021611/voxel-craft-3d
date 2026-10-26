import {
  AIR, BRICK, CACTUS, CHEST, CRYSTAL, DIRT, GOLD, GRASS, GRAVEL, ICE, LAMP, LEAVES,
  LOG, OBSIDIAN, PLANKS, SAND, SNOW, STONE, blockInfo, colorRgb, isOpaque, isSolid,
} from "@/lib/blocks";
import { fbm2, fbm3, hash2, hash3, smoothstep } from "./noise";

export const SEA_LEVEL = 16;
export const CHUNK_SIZE = 8;
export const MAX_Y = 74;
export const UNLOAD_PADDING = 2;

export const BIOMES = [
  { id: 0, name: "Ocean", color: "#2f7fae" },
  { id: 1, name: "Beach", color: "#e3d09a" },
  { id: 2, name: "Plains", color: "#7fc25a" },
  { id: 3, name: "Forest", color: "#2f7d3a" },
  { id: 4, name: "Desert", color: "#d8b970" },
  { id: 5, name: "Snowy Peaks", color: "#e6f2ff" },
  { id: 6, name: "Mountains", color: "#9aa4b2" },
] as const;

export interface Column {
  h: number;
  biome: number;
  surface: number;
  subsurface: number;
  treeChance: number;
  treeKind: "oak" | "pine" | "cactus" | null;
}

export interface TreeInfo {
  kind: "oak" | "pine" | "cactus";
  base: number;
  height: number;
}

export type StructureType = "village" | "dungeon" | "treasure" | "landmark";

export interface StructureSite {
  type: StructureType;
  name: string;
  x: number;
  z: number;
  blocks: Map<string, number>;
  ground: number;
  biome: number;
}

export interface Landmark {
  type: StructureType;
  name: string;
  x: number;
  z: number;
  distance: number;
  direction: number;
}

export interface ChunkMeshData {
  cx: number;
  cz: number;
  count: number;
  positions: Float32Array;
  colors: Float32Array;
  chests: Array<[number, number, number]>;
  biome: number;
}

const REGION = 80;
const OAK_TRUNK = 5;

export function key3(x: number, y: number, z: number): string {
  return `${x}|${y}|${z}`;
}

export class WorldEngine {
  readonly seed: number;
  readonly edits = new Map<string, number>();
  private columns = new Map<string, Column>();
  private trees = new Map<string, TreeInfo | null>();
  private regions = new Map<string, StructureSite | null>();

  constructor(seed: number | string) {
    const numeric = typeof seed === "number" ? seed : hashString(String(seed));
    this.seed = Math.abs(Math.floor(numeric)) % 2147483000;
  }

  applyEdits(record: Record<string, number>) {
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === "number") this.edits.set(key, value);
    }
  }

  collectEdits(limit = 8000): Record<string, number> {
    const out: Record<string, number> = {};
    let count = 0;
    for (const [key, value] of this.edits) {
      if (count++ >= limit) break;
      out[key] = value;
    }
    return out;
  }

  columnAt(x: number, z: number): Column {
    const colX = Math.floor(x);
    const colZ = Math.floor(z);
    const cacheKey = `${colX},${colZ}`;
    const cached = this.columns.get(cacheKey);
    if (cached) return cached;

    if (this.columns.size > 90000) this.columns.clear();

    const seed = this.seed;
    const continent = fbm2(colX * 0.0085, colZ * 0.0085, seed + 11, 4);
    const ridge = 1 - Math.abs(fbm2(colX * 0.017, colZ * 0.017, seed + 29, 3) * 2 - 1);
    const temperature = fbm2(colX * 0.0048, colZ * 0.0048, seed + 53, 3);
    const humidity = fbm2(colX * 0.0062, colZ * 0.0062, seed + 71, 3);
    const detail = fbm2(colX * 0.09, colZ * 0.09, seed + 97, 2);

    let h: number;
    if (continent < 0.42) {
      const depth = (0.42 - continent) / 0.42;
      h = Math.round(SEA_LEVEL - 2 - depth * 20);
      const island = fbm2(colX * 0.032, colZ * 0.032, seed + 137, 2);
      if (island > 0.76) {
        h = Math.round(SEA_LEVEL + 1 + (island - 0.76) * 34);
      }
    } else {
      const land = (continent - 0.42) / 0.58;
      const mountain = Math.pow(Math.max(0, ridge - 0.52) / 0.48, 1.25);
      h = Math.round(SEA_LEVEL + land * 9 + mountain * land * 34 + detail * 2.6);
    }
    h = Math.max(3, Math.min(MAX_Y - 12, h));

    const cold = temperature < 0.33;
    const hot = temperature > 0.62;
    let biome = 2;
    if (h < SEA_LEVEL - 1) biome = 0;
    else if (h <= SEA_LEVEL + 1) biome = 1;
    else if (h > 44 || (cold && h > SEA_LEVEL + 8)) biome = 5;
    else if (h > 36) biome = 6;
    else if (cold) biome = 5;
    else if (hot && humidity < 0.48) biome = 4;
    else if (humidity > 0.55) biome = 3;

    let surface = GRASS;
    let subsurface = DIRT;
    let treeKind: Column["treeKind"] = humidity > 0.5 ? "oak" : null;
    let treeChance = 0;

    if (biome === 0) {
      surface = humidity > 0.5 ? GRAVEL : SAND;
      subsurface = SAND;
      treeKind = null;
    } else if (biome === 1) {
      surface = SAND;
      subsurface = SAND;
      treeKind = null;
    } else if (biome === 4) {
      surface = SAND;
      subsurface = SAND;
      treeKind = "cactus";
      treeChance = 0.018;
    } else if (biome === 5) {
      surface = h > 42 ? SNOW : ICE;
      subsurface = STONE;
      treeKind = h > SEA_LEVEL + 4 ? "pine" : null;
      treeChance = 0.026;
    } else if (biome === 6) {
      surface = h > 52 ? SNOW : STONE;
      subsurface = STONE;
      treeKind = null;
    } else if (biome === 3) {
      treeKind = "oak";
      treeChance = 0.055;
    } else {
      treeKind = "oak";
      treeChance = 0.012;
    }

    const column: Column = { h, biome, surface, subsurface, treeChance, treeKind };
    this.columns.set(cacheKey, column);
    return column;
  }

  private treeAt(cx: number, cz: number): TreeInfo | null {
    const cacheKey = `${cx},${cz}`;
    const cached = this.trees.get(cacheKey);
    if (cached !== undefined) return cached;

    if (this.trees.size > 60000) this.trees.clear();
    const column = this.columnAt(cx, cz);
    let result: TreeInfo | null = null;
    if (column.treeChance > 0) {
      const roll = hash2(cx, cz, this.seed + 211);
      if (roll < column.treeChance) {
        const kind = column.treeKind ?? "oak";
        const height = kind === "cactus" ? 3 : kind === "pine" ? 7 : OAK_TRUNK + (hash2(cx, cz, this.seed + 307) > 0.5 ? 1 : 0);
        result = { kind, base: column.h + 1, height };
      }
    }
    this.trees.set(cacheKey, result);
    return result;
  }

  /** Leaves / trunks may reach into neighbouring columns, so sample a 5×5 neighbourhood. */
  private treeBlock(x: number, y: number, z: number): number {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const tree = this.treeAt(x + dx, z + dz);
        if (!tree) continue;
        const tx = x + dx;
        const tz = z + dz;
        const top = tree.base + tree.height;
        if (y < tree.base || y > top + 2) continue;

        if (dx === 0 && dz === 0 && y <= tree.base + tree.height) {
          if (tree.kind === "oak" || tree.kind === "pine") return LOG;
          if (tree.kind === "cactus") return CACTUS;
        }
        if (tree.kind === "cactus") continue;
        if (tree.kind === "oak") {
          const canopyBase = tree.base + tree.height - 2;
          if (y >= canopyBase && y <= canopyBase + 2) {
            const radius = y === canopyBase + 2 ? 1 : 2;
            if (Math.abs(dx) <= radius && Math.abs(dz) <= radius) {
              if (Math.abs(dx) === radius && Math.abs(dz) === radius && y === canopyBase + 2) continue;
              return LEAVES;
            }
          }
        } else if (tree.kind === "pine") {
          const fromTop = top - y;
          if (fromTop >= 0 && fromTop <= 3) {
            const radius = Math.min(2, fromTop);
            if (Math.abs(dx) <= radius && Math.abs(dz) <= radius) return LEAVES;
          }
        }
      }
    }
    return AIR;
  }

  private isCave(x: number, y: number, z: number, column: Column): boolean {
    if (y > column.h - 3 || y < 2) return false;
    const cave = fbm3(x * 0.085, y * 0.13, z * 0.085, this.seed + 401, 2);
    if (cave > 0.63) return true;
    const tunnel = fbm3(x * 0.045, y * 0.05, z * 0.045, this.seed + 503, 2);
    return tunnel > 0.7 && y < column.h - 6;
  }

  terrainBlock(x: number, y: number, z: number): number {
    const column = this.columnAt(x, z);
    if (y < 0) return OBSIDIAN;
    if (y > column.h) {
      const tree = this.treeBlock(x, y, z);
      return tree;
    }
    if (this.isCave(x, y, z, column)) return AIR;
    if (y === column.h) return column.surface;
    const depth = column.h - y;
    if (depth <= 3) return column.subsurface;
    if (y < SEA_LEVEL - 8 && hash3(x, y, z, this.seed + 601) > 0.985) return GOLD;
    if (y < SEA_LEVEL - 12 && hash3(x, y, z, this.seed + 607) > 0.993) return CRYSTAL;
    return STONE;
  }

  // ---------------------------------------------------------------- structures

  private regionSite(rx: number, rz: number): StructureSite | null {
    const cacheKey = `${rx},${rz}`;
    const cached = this.regions.get(cacheKey);
    if (cached !== undefined) return cached;
    if (this.regions.size > 512) this.regions.clear();

    const seed = this.seed;
    const roll = hash2(rx, rz, seed + 733);
    if (roll > 0.62) {
      this.regions.set(cacheKey, null);
      return null;
    }

    const inset = 22;
    const x = rx * REGION + inset + Math.floor(hash2(rx, rz, seed + 811) * (REGION - inset * 2));
    const z = rz * REGION + inset + Math.floor(hash2(rx, rz, seed + 823) * (REGION - inset * 2));
    const column = this.columnAt(x, z);
    const type: StructureType =
      roll < 0.16 && column.h > SEA_LEVEL + 1 && column.h < 40
        ? "village"
        : roll < 0.3
          ? "treasure"
          : roll < 0.46
            ? "dungeon"
            : roll < 0.62
              ? "landmark"
              : "treasure";

    const blocks = new Map<string, number>();
    const put = (bx: number, by: number, bz: number, id: number) => {
      if (bx < rx * REGION || bx > (rx + 1) * REGION || bz < rz * REGION || bz > (rz + 1) * REGION) return;
      if (by < 1 || by >= MAX_Y) return;
      blocks.set(key3(bx, by, bz), id);
    };

    const ground = column.h + 1;
    let name = "Hidden Location";

    if (type === "village") {
      name = "NPC Village";
      const houses = 3 + Math.floor(hash2(rx, rz, seed + 907) * 2);
      for (let i = 0; i < houses; i++) {
        const ox = x + (i % 2) * 9 - 4;
        const oz = z + Math.floor(i / 2) * 9 - 4;
        const w = 5;
        const d = 5;
        for (let dx = 0; dx < w; dx++) {
          for (let dz = 0; dz < d; dz++) {
            const edge = dx === 0 || dz === 0 || dx === w - 1 || dz === d - 1;
            const floorY = this.columnAt(ox + dx, oz + dz).h + 1;
            put(ox + dx, floorY - 1, oz + dz, PLANKS);
            if (edge) {
              for (let dy = 0; dy < 3; dy++) {
                const doorway = (dx === 2 && dz === d - 1) || (dz === 2 && dx === w - 1);
                if (doorway && dy < 2) continue;
                put(ox + dx, floorY + dy, oz + dz, i % 2 === 0 ? PLANKS : BRICK);
              }
            }
            put(ox + dx, floorY + 3, oz + dz, BRICK);
          }
        }
        const houseFloor = this.columnAt(ox + 2, oz + 2).h + 1;
        put(ox + 2, houseFloor + 1, oz + 2, LAMP);
        put(ox + 1, houseFloor, oz + 1, CHEST);
      }
      for (let dz = -6; dz <= 10; dz++) {
        const pathZ = z + dz;
        const pathH = this.columnAt(x, pathZ).h;
        put(x, pathH, pathZ, GRAVEL);
      }
    } else if (type === "dungeon") {
      name = "Dungeon";
      const roomY = Math.max(4, ground - 13);
      const half = 6;
      for (let dx = -half; dx <= half; dx++) {
        for (let dz = -half; dz <= half; dz++) {
          put(x + dx, roomY - 1, z + dz, BRICK);
          put(x + dx, roomY + 4, z + dz, BRICK);
          const edge = Math.abs(dx) === half || Math.abs(dz) === half;
          if (edge) {
            for (let dy = 0; dy < 4; dy++) put(x + dx, roomY + dy, z + dz, OBSIDIAN);
          } else {
            for (let dy = 0; dy < 4; dy++) put(x + dx, roomY + dy, z + dz, AIR);
          }
        }
      }
      for (const [px, pz] of [[-4, -4], [4, 4], [-4, 4], [4, -4]] as const) {
        for (let dy = 0; dy < 2; dy++) put(x + px, roomY + dy, z + pz, OBSIDIAN);
        put(x + px, roomY + 2, z + pz, dy2(pz) ? LAMP : CRYSTAL);
      }
      put(x, roomY, z, CHEST);
      put(x + 1, roomY, z, CHEST);
      put(x - 1, roomY, z, GOLD);
      put(x + 2, roomY, z, GOLD);
      // Entry shaft from the surface.
      for (let y = roomY + 4; y <= ground + 1; y++) put(x, y, z, AIR);
      for (let y = roomY + 4; y <= ground; y += 2) put(x + 1, y, z, PLANKS);
    } else if (type === "treasure") {
      name = "Buried Treasure";
      const chestY = Math.max(2, ground - 4);
      put(x, chestY, z, CHEST);
      put(x + 1, chestY, z, GOLD);
      put(x - 1, chestY, z, GOLD);
      put(x, chestY + 1, z, CHEST);
      for (let y = chestY + 1; y <= ground; y++) put(x, y, z, GRAVEL);
      put(x, ground + 1, z, LAMP);
    } else {
      name = "Ancient Spire";
      const base = ground;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
          put(x + dx, base - 1, z + dz, STONE);
        }
      }
      for (let y = 0; y < 11; y++) {
        put(x, base + y, z, y % 3 === 0 ? CRYSTAL : OBSIDIAN);
      }
      for (const [ax, az] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        put(x + ax, base, z + az, LAMP);
      }
      put(x, base + 11, z, CRYSTAL);
    }

    const site: StructureSite = { type, name, x, z, blocks, ground, biome: column.biome };
    this.regions.set(cacheKey, site);
    return site;
  }

  private structureBlock(x: number, y: number, z: number): number | null {
    const rx = Math.floor(x / REGION);
    const rz = Math.floor(z / REGION);
    const site = this.regionSite(rx, rz);
    if (!site) return null;
    const value = site.blocks.get(key3(x, y, z));
    return value === undefined ? null : value;
  }

  getBlock(x: number, y: number, z: number): number {
    if (y < 0) return OBSIDIAN;
    if (y > MAX_Y) return AIR;
    const key = key3(x, y, z);
    const edited = this.edits.get(key);
    if (edited !== undefined) return edited;
    const structure = this.structureBlock(x, y, z);
    if (structure !== null) return structure;
    return this.terrainBlock(x, y, z);
  }

  setBlock(x: number, y: number, z: number, id: number) {
    this.edits.set(key3(x, y, z), id);
  }

  /** Highest solid/standing surface, used for spawning and map pins. */
  surfaceY(x: number, z: number): number {
    const column = this.columnAt(x, z);
    for (let y = Math.min(MAX_Y - 1, column.h + 14); y >= 1; y--) {
      if (isSolid(this.getBlock(Math.floor(x), y, Math.floor(z)))) return y + 1;
    }
    return SEA_LEVEL + 1;
  }

  buildChunk(cx: number, cz: number): ChunkMeshData {
    const size = CHUNK_SIZE;
    const x0 = cx * size;
    const z0 = cz * size;
    const pad = 1;
    const gridW = size + pad * 2;

    let maxY = SEA_LEVEL + 4;
    let biome = 2;
    for (let x = x0 - pad; x < x0 + size + pad; x++) {
      for (let z = z0 - pad; z < z0 + size + pad; z++) {
        const column = this.columnAt(x, z);
        const top = column.h + (column.treeChance > 0 ? 11 : 0);
        if (top > maxY) maxY = top;
        if (x >= x0 && x < x0 + size && z >= z0 && z < z0 + size) biome = column.biome;
      }
    }
    maxY = Math.min(MAX_Y, maxY + 2);
    const gridH = maxY + pad * 2;

    const grid = new Uint8Array(gridW * gridW * gridH);
    for (let gx = 0; gx < gridW; gx++) {
      for (let gz = 0; gz < gridW; gz++) {
        const wx = x0 - pad + gx;
        const wz = z0 - pad + gz;
        for (let gy = 0; gy < gridH; gy++) {
          const wy = gy - pad;
          grid[(gx * gridW + gz) * gridH + gy] = this.getBlock(wx, wy, wz);
        }
      }
    }

    const positions: number[] = [];
    const colors: number[] = [];
    const chests: Array<[number, number, number]> = [];
    const at = (gx: number, gy: number, gz: number) => grid[(gx * gridW + gz) * gridH + gy];

    for (let gx = 1; gx <= size; gx++) {
      for (let gz = 1; gz <= size; gz++) {
        for (let gy = 1; gy < gridH - 1; gy++) {
          const id = at(gx, gy, gz);
          if (id === AIR || !isOpaque(id)) continue;
          const exposed =
            !isOpaque(at(gx + 1, gy, gz)) ||
            !isOpaque(at(gx - 1, gy, gz)) ||
            !isOpaque(at(gx, gy + 1, gz)) ||
            !isOpaque(at(gx, gy - 1, gz)) ||
            !isOpaque(at(gx, gy, gz + 1)) ||
            !isOpaque(at(gx, gy, gz - 1));
          if (!exposed) continue;

          const wx = x0 - 1 + gx;
          const wy = gy - 1;
          const wz = z0 - 1 + gz;
          positions.push(wx, wy + 0.5, wz);

          const [r, g, b] = colorRgb(id);
          const shade = 0.9 + hash3(wx, wy, wz, this.seed) * 0.16;
          const depthShade = wy > SEA_LEVEL ? 1 : 0.86;
          colors.push(r * shade * depthShade, g * shade * depthShade, b * shade * depthShade);
          if (id === CHEST) chests.push([wx, wy, wz]);
        }
      }
    }

    return {
      cx,
      cz,
      count: positions.length / 3,
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      chests,
      biome,
    };
  }

  nearestLandmark(x: number, z: number, radius = 3): Landmark | null {
    const rx = Math.floor(x / REGION);
    const rz = Math.floor(z / REGION);
    let best: Landmark | null = null;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const site = this.regionSite(rx + dx, rz + dz);
        if (!site) continue;
        const distance = Math.hypot(site.x - x, site.z - z);
        if (!best || distance < best.distance) {
          best = {
            type: site.type,
            name: site.name,
            x: site.x,
            z: site.z,
            distance,
            direction: Math.atan2(site.x - x, site.z - z),
          };
        }
      }
    }
    return best;
  }

  biomeAt(x: number, z: number): number {
    return this.columnAt(x, z).biome;
  }

  isWaterAt(x: number, y: number, z: number): boolean {
    const column = this.columnAt(x, z);
    return y <= SEA_LEVEL && column.h < SEA_LEVEL;
  }

  blockName(id: number): string {
    return blockInfo(id).name;
  }
}

function dy2(value: number): boolean {
  return Math.abs(value) % 4 === 0;
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

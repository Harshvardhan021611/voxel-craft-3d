export const AIR = 0;
export const GRASS = 1;
export const DIRT = 2;
export const STONE = 3;
export const SAND = 4;
export const SNOW = 5;
export const LOG = 6;
export const LEAVES = 7;
export const CACTUS = 8;
export const CHEST = 9;
export const GOLD = 10;
export const CRYSTAL = 11;
export const PLANKS = 12;
export const GRAVEL = 13;
export const BRICK = 14;
export const OBSIDIAN = 15;
export const LAMP = 16;
export const ICE = 17;

export interface BlockInfo {
  id: number;
  name: string;
  color: string;
  solid: boolean;
  opaque: boolean;
  emissive?: boolean;
  loot?: boolean;
}

export const BLOCKS: BlockInfo[] = [
  { id: AIR, name: "Air", color: "#000000", solid: false, opaque: false },
  { id: GRASS, name: "Grass Block", color: "#5fae4a", solid: true, opaque: true },
  { id: DIRT, name: "Dirt", color: "#7a5533", solid: true, opaque: true },
  { id: STONE, name: "Stone", color: "#8b94a3", solid: true, opaque: true },
  { id: SAND, name: "Sand", color: "#e3d09a", solid: true, opaque: true },
  { id: SNOW, name: "Snow", color: "#eef6ff", solid: true, opaque: true },
  { id: LOG, name: "Oak Log", color: "#8a5a33", solid: true, opaque: true },
  { id: LEAVES, name: "Leaves", color: "#2f7d3a", solid: true, opaque: true },
  { id: CACTUS, name: "Cactus", color: "#3f8b4f", solid: true, opaque: true },
  { id: CHEST, name: "Treasure Chest", color: "#c48a3a", solid: true, opaque: true, loot: true },
  { id: GOLD, name: "Gold Block", color: "#f0c050", solid: true, opaque: true },
  { id: CRYSTAL, name: "Crystal", color: "#a78bfa", solid: true, opaque: true, emissive: true },
  { id: PLANKS, name: "Planks", color: "#c08a52", solid: true, opaque: true },
  { id: GRAVEL, name: "Gravel", color: "#7d7a74", solid: true, opaque: true },
  { id: BRICK, name: "Stone Brick", color: "#9d6b5a", solid: true, opaque: true },
  { id: OBSIDIAN, name: "Obsidian", color: "#241d3a", solid: true, opaque: true },
  { id: LAMP, name: "Glow Lamp", color: "#ffd479", solid: true, opaque: true, emissive: true },
  { id: ICE, name: "Ice", color: "#a8d8f0", solid: true, opaque: true },
];

for (const block of BLOCKS) {
  Object.defineProperty(block, "id", { value: block.id, enumerable: true });
}

export function blockInfo(id: number): BlockInfo {
  return BLOCKS[id] ?? BLOCKS[STONE];
}

export function isSolid(id: number): boolean {
  return BLOCKS[id]?.solid ?? false;
}

export function isOpaque(id: number): boolean {
  return BLOCKS[id]?.opaque ?? false;
}

/** Hotbar palette — the blocks players can place. */
export const PALETTE_IDS = [GRASS, STONE, LOG, LEAVES, SAND, SNOW, BRICK, GOLD];

export const BLOCK_TYPES = PALETTE_IDS.map((id) => blockInfo(id));

export function paletteBlock(index: number) {
  const id = PALETTE_IDS[((index % PALETTE_IDS.length) + PALETTE_IDS.length) % PALETTE_IDS.length];
  return blockInfo(id);
}

/** Colour without the leading #, for fast numeric mesh tinting. */
export function colorRgb(id: number): [number, number, number] {
  const hex = blockInfo(id).color;
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

export const LOOT_TABLE = [GOLD, CRYSTAL, PLANKS, BRICK, LAMP, SNOW, LEAVES, STONE];

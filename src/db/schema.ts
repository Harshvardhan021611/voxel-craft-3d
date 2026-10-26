import { pgTable, serial, text, integer, boolean, timestamp, jsonb, real, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login").defaultNow(),
  isOnline: boolean("is_online").default(false),
  premium: boolean("premium").default(false),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
});

export const worlds = pgTable("worlds", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  seed: text("seed").notNull(),
  mode: text("mode").notNull().default("survival"), // survival, creative, adventure
  dimension: text("dimension").default("overworld"),
  chunkData: jsonb("chunk_data").default({}),
  blockData: jsonb("block_data").default({}),
  public: boolean("public").default(true),
  maxPlayers: integer("max_players").default(20),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  code: text("code").notNull(), // FIRST_BLOCK, MASTER_BUILDER, SURVIVOR, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  rewardXp: integer("reward_xp").default(50),
});

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  worldId: integer("world_id").notNull(),
  name: text("name").notNull(),
  blueprintData: jsonb("blueprint_data").notNull(),
  blockCount: integer("block_count").default(0),
  category: text("category").default("other"), // castle, house, farm, city
  public: boolean("public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  blockType: text("block_type").notNull(),
  quantity: integer("quantity").default(0),
  durability: integer("durability").default(100),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rewardType: text("reward_type").notNull(), // cosmetic, xp, block
  rewardValue: text("reward_value").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const deviceSessions = pgTable("device_sessions", {
  id: serial("id").primaryKey(),
  device: text("device").notNull(), // pc, mobile, controller
  platform: text("platform").notNull(),
  touchScreen: boolean("touch_screen").default(false),
  gamepad: boolean("gamepad").default(false),
  gamepadName: text("gamepad_name"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const worldPresence = pgTable(
  "world_presence",
  {
    id: serial("id").primaryKey(),
    worldId: integer("world_id").notNull(),
    clientId: text("client_id").notNull(),
    name: text("name").notNull().default("Explorer"),
    device: text("device").notNull().default("pc"),
    x: real("x").notNull().default(0),
    y: real("y").notNull().default(20),
    z: real("z").notNull().default(0),
    yaw: real("yaw").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("world_presence_world_client").on(table.worldId, table.clientId)]
);

export const cosmeticSkins = pgTable("cosmetic_skins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // skin, block_texture, skybox
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  ownedBy: integer("owned_by").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

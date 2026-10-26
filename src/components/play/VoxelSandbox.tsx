"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  AIR, CHEST, CRYSTAL, GOLD, LOOT_TABLE, blockInfo, isSolid, paletteBlock,
} from "@/lib/blocks";
import { CHUNK_SIZE, SEA_LEVEL, WorldEngine, type ChunkMeshData } from "@/lib/voxel/world";
import { activeMove, consumeLook, drainActions, input } from "@/lib/input";
import { useGameStore, type RemotePlayer } from "@/lib/store";
import { requiredQuality, useSettings } from "@/lib/settings";

const EYE = 1.62;
const CROUCH_EYE = 1.02;
const GRAVITY = 24;
const REACH = 6.5;
const WORLD_DAY_SECONDS = 480;

interface VoxelSandboxProps {
  engine: WorldEngine;
  seed: number;
  players: RemotePlayer[];
}

interface RayHit {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  id: number;
}

function raycast(engine: WorldEngine, origin: THREE.Vector3, dir: THREE.Vector3, maxDistance: number): RayHit | null {
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);
  const stepX = Math.sign(dir.x);
  const stepY = Math.sign(dir.y);
  const stepZ = Math.sign(dir.z);
  const tDeltaX = stepX === 0 ? Infinity : Math.abs(1 / dir.x);
  const tDeltaY = stepY === 0 ? Infinity : Math.abs(1 / dir.y);
  const tDeltaZ = stepZ === 0 ? Infinity : Math.abs(1 / dir.z);
  const fracX = dir.x > 0 ? x + 1 - origin.x : origin.x - x;
  const fracY = dir.y > 0 ? y + 1 - origin.y : origin.y - y;
  const fracZ = dir.z > 0 ? z + 1 - origin.z : origin.z - z;
  let tMaxX = tDeltaX === Infinity ? Infinity : fracX * tDeltaX;
  let tMaxY = tDeltaY === Infinity ? Infinity : fracY * tDeltaY;
  let tMaxZ = tDeltaZ === Infinity ? Infinity : fracZ * tDeltaZ;
  let nx = 0;
  let ny = 0;
  let nz = 0;
  let distance = 0;

  for (let i = 0; i < 96; i++) {
    const id = engine.getBlock(x, y, z);
    if (id !== AIR && isSolid(id)) return { x, y, z, nx, ny, nz, id };
    if (distance > maxDistance) break;
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      distance = tMaxX;
      tMaxX += tDeltaX;
      nx = -stepX; ny = 0; nz = 0;
    } else if (tMaxY < tMaxZ) {
      y += stepY;
      distance = tMaxY;
      tMaxY += tDeltaY;
      nx = 0; ny = -stepY; nz = 0;
    } else {
      z += stepZ;
      distance = tMaxZ;
      tMaxZ += tDeltaZ;
      nx = 0; ny = 0; nz = -stepZ;
    }
  }
  return null;
}

function chunkKey(cx: number, cz: number) {
  return `${cx},${cz}`;
}

const ChunkMesh = memo(function ChunkMesh({
  engine, cx, cz, revision,
}: { engine: WorldEngine; cx: number; cz: number; revision: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo<ChunkMeshData>(() => engine.buildChunk(cx, cz), [engine, cx, cz, revision]);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || data.count === 0) return;
    for (let i = 0; i < data.count; i++) {
      matrix.makeTranslation(data.positions[i * 3], data.positions[i * 3 + 1], data.positions[i * 3 + 2]);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2]));
    }
    mesh.count = data.count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data, matrix, color]);

  if (data.count === 0) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.count]} frustumCulled={false} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
});

function Clouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      x: ((i * 13) % 60) - 30,
      y: 24 + ((i * 7) % 22),
      z: ((i * 17) % 60) - 30,
      sx: 6 + (i % 4) * 2,
    })),
    []
  );
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.position.x = state.camera.position.x;
    group.current.position.z = state.camera.position.z;
    group.current.children.forEach((child, index) => {
      child.position.x += delta * (0.5 + (index % 3) * 0.2);
      if (child.position.x > 36) child.position.x = -36;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((cloud, index) => (
        <mesh key={index} position={[cloud.x, cloud.y, cloud.z]} scale={[cloud.sx, 1, 3]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function RemotePlayers({ players }: { players: RemotePlayer[] }) {
  return (
    <group>
      {players.map((player) => (
        <group key={player.clientId} position={[player.x, player.y + 0.9, player.z]} rotation={[0, player.yaw, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.62, 1.15, 0.42]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0369a1" emissiveIntensity={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <boxGeometry args={[0.44, 0.44, 0.44]} />
            <meshStandardMaterial color="#f4d9b2" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.06]} />
            <meshBasicMaterial color="#a78bfa" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({ engine, players }: { engine: WorldEngine; players: RemotePlayer[] }) {
  const { camera } = useThree();
  const device = useGameStore((s) => s.device.mode);
  const quality = useSettings((s) => s.quality);
  const chunkRadius = useMemo(() => {
    const level = requiredQuality(quality, device);
    if (device === "mobile") return level === "low" ? 2 : 3;
    return level === "ultra" ? 5 : level === "low" ? 2 : 4;
  }, [quality, device]);
  const shadows = device !== "mobile" && requiredQuality(quality, device) !== "low";

  const [chunks, setChunks] = useState<Array<[number, number]>>([]);
  const chunksRef = useRef<Array<[number, number]>>([]);
  const [revisions, setRevisions] = useState<Record<string, number>>({});
  const worldRevision = useGameStore((s) => s.worldRevision);

  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  // Remote players' block edits arrive over the heartbeat — rebuild loaded chunks.
  useEffect(() => {
    if (worldRevision === 0) return;
    setRevisions((prev) => {
      const next = { ...prev };
      for (const [cx, cz] of chunksRef.current) {
        const key = chunkKey(cx, cz);
        next[key] = (next[key] ?? 0) + 1;
      }
      return next;
    });
  }, [worldRevision]);

  const outlineRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const scene = useThree((s) => s.scene);
  const target = useRef<RayHit | null>(null);
  const touchTelemetry = useRef(0);

  const spawn = useMemo(() => {
    for (let radius = 0; radius < 220; radius += 5) {
      for (let angle = 0; angle < 12; angle++) {
        const a = (angle / 12) * Math.PI * 2;
        const x = Math.round(Math.cos(a) * radius);
        const z = Math.round(Math.sin(a) * radius);
        const column = engine.columnAt(x, z);
        if (column.h > SEA_LEVEL + 2) {
          return { x: x + 0.5, z: z + 0.5, y: engine.surfaceY(x, z) + 0.2 };
        }
      }
    }
    return { x: 0.5, z: 0.5, y: engine.surfaceY(0, 0) + 0.2 };
  }, [engine]);

  const player = useRef({
    x: spawn.x,
    y: spawn.y,
    z: spawn.z,
    vy: 0,
    yaw: Math.PI * 0.25,
    pitch: -0.08,
    onGround: false,
    crouch: false,
  });

  const centerRef = useRef({ cx: Math.floor(spawn.x / CHUNK_SIZE), cz: Math.floor(spawn.z / CHUNK_SIZE) });
  const dayRef = useRef({ time: WORLD_DAY_SECONDS * 0.18 });
  const [skyState, setSkyState] = useState({ sun: [40, 60, 20] as [number, number, number], daylight: 1 });
  const fpsClock = useRef({ frames: 0, last: 0 });
  const lastTelemetry = useRef(0);

  // ---- chunk streaming: builds a couple of chunks per tick, never blocks the game
  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const p = player.current;
      const pcx = Math.floor(p.x / CHUNK_SIZE);
      const pcz = Math.floor(p.z / CHUNK_SIZE);
      centerRef.current = { cx: pcx, cz: pcz };

      const wanted: Array<[number, number]> = [];
      for (let dx = -chunkRadius; dx <= chunkRadius; dx++) {
        for (let dz = -chunkRadius; dz <= chunkRadius; dz++) {
          wanted.push([pcx + dx, pcz + dz]);
        }
      }
      wanted.sort((a, b) => (Math.abs(a[0] - pcx) + Math.abs(a[1] - pcz)) - (Math.abs(b[0] - pcx) + Math.abs(b[1] - pcz)));

      setChunks((prev) => {
        const existing = new Set(prev.map(([cx, cz]) => chunkKey(cx, cz)));
        const wantedKeys = new Set(wanted.map(([cx, cz]) => chunkKey(cx, cz)));
        const kept = prev.filter(([cx, cz]) => wantedKeys.has(chunkKey(cx, cz)));
        const missing = wanted.filter(([cx, cz]) => !existing.has(chunkKey(cx, cz)));
        const additions = missing.slice(0, prev.length === 0 ? 9 : 5);
        if (kept.length === prev.length && additions.length === 0) return prev;
        return [...kept, ...additions];
      });
    };

    tick();
    const interval = window.setInterval(tick, 220);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [chunkRadius]);

  // ---- editor helper: rebuild touched chunks, persist edits upstream
  const markEdited = (x: number, y: number, z: number) => {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    const touched: Array<[number, number]> = [[cx, cz]];
    if (lx === 0) touched.push([cx - 1, cz]);
    if (lx === CHUNK_SIZE - 1) touched.push([cx + 1, cz]);
    if (lz === 0) touched.push([cx, cz - 1]);
    if (lz === CHUNK_SIZE - 1) touched.push([cx, cz + 1]);
    setRevisions((prev) => {
      const next = { ...prev };
      for (const [tx, tz] of touched) next[chunkKey(tx, tz)] = (next[chunkKey(tx, tz)] ?? 0) + 1;
      return next;
    });
  };

  const lootChest = (hit: RayHit) => {
    const state = useGameStore.getState();
    const key = `${hit.x},${hit.y},${hit.z}`;
    if (!state.openChest(key)) {
      state.pushNotice("Chest already looted");
      return;
    }
    const drops = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < drops; i++) {
      state.addItem(LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)], 2 + Math.floor(Math.random() * 4));
    }
    state.addItem(GOLD, 2);
    if (Math.random() > 0.6) state.addItem(CRYSTAL, 1);
    state.pushNotice(`Loot found — ${drops + 2} stacks`);
  };

  useLayoutEffect(() => {
    camera.rotation.order = "YXZ";
    camera.position.set(player.current.x, player.current.y + EYE, player.current.z);
  }, [camera]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const state = useGameStore.getState();
    const settings = useSettings.getState();
    const p = player.current;
    // The tutorial is non-blocking: players learn by actually playing.
    const paused = state.paused || (state.overlay !== null && state.overlay !== "tutorial");
    const castTarget = () => {
      const direction = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
      return raycast(engine, camera.position, direction, REACH);
    };

    // ---- day / night ------------------------------------------------------
    if (!paused) dayRef.current.time = (dayRef.current.time + delta) % WORLD_DAY_SECONDS;
    const phase = dayRef.current.time / WORLD_DAY_SECONDS;
    const sunAngle = phase * Math.PI * 2 - Math.PI / 2;
    const elevation = Math.sin(sunAngle);
    const daylight = THREE.MathUtils.clamp(elevation * 1.6 + 0.42, 0.05, 1);
    if (sunRef.current) {
      sunRef.current.position.set(Math.cos(sunAngle) * 60, Math.max(-14, elevation * 70), 26);
      sunRef.current.intensity = 0.28 + daylight * 2.1;
      sunRef.current.color.setHSL(0.11, 0.5 * (1 - daylight) + 0.1, 0.55 + daylight * 0.4);
    }
    if (ambientRef.current) ambientRef.current.intensity = 0.18 + daylight * 0.5;
    const sky = new THREE.Color().setHSL(0.57, 0.42, 0.07 + daylight * 0.63);
    if (scene.background instanceof THREE.Color) scene.background.copy(sky);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(sky);
    if (outlineRef.current) outlineRef.current.visible = false;

    if (paused) {
      drainActions();
      camera.position.set(p.x, p.y + (p.crouch ? CROUCH_EYE : EYE), p.z);
      camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");
      return;
    }

    // ---- look -------------------------------------------------------------
    const look = consumeLook(device);
    const sensitivity = settings.sensitivity;
    const invert = settings.invertY ? -1 : 1;
    p.yaw += look.x * sensitivity;
    p.pitch = THREE.MathUtils.clamp(p.pitch + look.y * sensitivity * invert, -1.45, 1.45);

    // ---- movement ---------------------------------------------------------
    const move = activeMove(device);
    const magnitude = Math.hypot(move.x, move.y);
    p.crouch = input.crouchHeld && !state.fly;
    const inWater = engine.isWaterAt(p.x, p.y + 0.4, p.z);
    const baseSpeed = state.fly ? 11 : p.crouch ? 2.1 : input.sprintHeld ? 7 : 4.7;
    const speed = baseSpeed * (inWater && !state.fly ? 0.55 : 1);

    if (magnitude > 0.001) {
      const nx = move.x / Math.max(magnitude, 1);
      const ny = move.y / Math.max(magnitude, 1);
      const forwardX = -Math.sin(p.yaw);
      const forwardZ = -Math.cos(p.yaw);
      const rightX = Math.cos(p.yaw);
      const rightZ = -Math.sin(p.yaw);
      const vx = (forwardX * ny + rightX * nx) * speed * delta;
      const vz = (forwardZ * ny + rightZ * nx) * speed * delta;
      const feet = Math.round(p.y);

      const canOccupy = (x: number, z: number, y: number) => {
        const bx = Math.round(x);
        const bz = Math.round(z);
        for (let dy = 0; dy < 2; dy++) {
          if (isSolid(engine.getBlock(bx, y + dy, bz))) return false;
        }
        return true;
      };

      const tryAxis = (dx: number, dz: number) => {
        if (state.fly) {
          if (canOccupy(p.x + dx, p.z + dz, feet)) {
            p.x += dx;
            p.z += dz;
          }
          return;
        }
        if (canOccupy(p.x + dx, p.z, feet)) {
          p.x += dx;
          p.z += dz;
        } else if (canOccupy(p.x + dx, p.z, feet + 1) && !isSolid(engine.getBlock(Math.round(p.x), feet + 2, Math.round(p.z)))) {
          p.x += dx;
          p.y = feet + 1;
        }
      };

      tryAxis(vx, 0);
      tryAxis(0, vz);
    }

    // ---- gravity / swim / fly --------------------------------------------
    if (state.fly) {
      if (input.jumpHeld) p.y += 9 * delta;
      if (input.descendHeld) p.y -= 9 * delta;
      p.vy = 0;
    } else if (inWater) {
      p.vy += (input.jumpHeld ? 6.5 : 1.8) * delta;
      p.vy = Math.min(p.vy, 3.2);
      p.vy -= 6 * delta;
      p.y += p.vy * delta;
    } else {
      if (input.jumpHeld && p.onGround) p.vy = 8.4;
      p.vy -= GRAVITY * delta;
      p.y += p.vy * delta;
    }

    // ground collision
    const bx = Math.round(p.x);
    const bz = Math.round(p.z);
    if (!state.fly) {
      const feet = Math.floor(p.y + 0.001);
      for (let y = feet; y >= feet - 2; y--) {
        if (isSolid(engine.getBlock(bx, y, bz))) {
          const top = y + 1;
          if (p.y < top) {
            p.y = top;
            p.vy = 0;
            p.onGround = true;
          }
          break;
        }
      }
      if (p.y < 1) {
        p.y = engine.surfaceY(p.x, p.z) + 0.2;
        p.vy = 0;
      }
    } else {
      p.onGround = false;
    }
    p.y = Math.min(p.y, 96);

    camera.position.set(p.x, p.y + (p.crouch ? CROUCH_EYE : EYE), p.z);
    camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");

    // ---- targeting --------------------------------------------------------
    const hit = castTarget();
    target.current = hit;
    if (outlineRef.current && hit) {
      outlineRef.current.visible = true;
      outlineRef.current.position.set(hit.x, hit.y + 0.5, hit.z);
    }

    // ---- actions ----------------------------------------------------------
    for (const action of drainActions()) {
      if (action === "select-next") state.cycleSelected(1);
      else if (action === "select-prev") state.cycleSelected(-1);
      else if (action === "fly") state.toggleFly();
      else if (action === "drop") state.dropSelected();
      else if (action === "mine") {
        if (!hit) {
          state.pushNotice("Aim at a block to mine");
        } else {
          if (hit.id === CHEST) lootChest(hit);
          else state.addItem(hit.id, 1);
          engine.setBlock(hit.x, hit.y, hit.z, AIR);
          state.registerMine();
          markEdited(hit.x, hit.y, hit.z);
        }
      } else if (action === "place") {
        if (!hit) {
          state.pushNotice("Aim at a surface to build");
        } else {
          const id = paletteBlock(state.selected).id;
          const px = hit.x + hit.nx;
          const py = hit.y + hit.ny;
          const pz = hit.z + hit.nz;
          const occupied = isSolid(engine.getBlock(px, py, pz));
          const insidePlayer =
            Math.abs(px - p.x) < 0.9 && Math.abs(pz - p.z) < 0.9 && py >= Math.floor(p.y) && py <= Math.floor(p.y) + 1;
          if (!occupied && !insidePlayer && state.consumeItem(id, 1)) {
            engine.setBlock(px, py, pz, id);
            state.registerPlace();
            markEdited(px, py, pz);
          } else if (occupied) {
            state.pushNotice("That space is occupied");
          } else if (insidePlayer) {
            state.pushNotice("Step back to place that block");
          } else {
            state.pushNotice(`No ${blockInfo(id).name} left — mine some first`);
          }
        }
      } else if (action === "interact") {
        if (hit?.id === CHEST) lootChest(hit);
        else state.pushNotice("Nothing to interact with here");
      }
    }

    // ---- water follows the camera ----------------------------------------
    if (waterRef.current) {
      waterRef.current.position.x = camera.position.x;
      waterRef.current.position.z = camera.position.z;
    }

    // ---- telemetry --------------------------------------------------------
    const now = performance.now();
    if (now - lastTelemetry.current > 320) {
      lastTelemetry.current = now;
      const landmark = engine.nearestLandmark(p.x, p.z, 1);
      state.setTelemetry({
        x: Math.round(p.x),
        y: Math.round(p.y),
        z: Math.round(p.z),
        biome: engine.biomeAt(p.x, p.z),
        heading: p.yaw,
        underwater: p.y + EYE < SEA_LEVEL && engine.columnAt(p.x, p.z).h < SEA_LEVEL,
        landmark: landmark
          ? { name: landmark.name, type: landmark.type, distance: Math.round(landmark.distance), x: landmark.x, z: landmark.z }
          : null,
      });
    }

    fpsClock.current.frames += 1;
    if (now - fpsClock.current.last > 700) {
      state.setFps(Math.round((fpsClock.current.frames * 1000) / (now - fpsClock.current.last)));
      fpsClock.current.frames = 0;
      fpsClock.current.last = now;
    }

    // Sky refresh (throttled).
    if (now - touchTelemetry.current > 1200) {
      touchTelemetry.current = now;
      setSkyState({
        sun: [Math.cos(sunAngle) * 40, Math.max(2, elevation * 60), 22],
        daylight,
      });
    }
  });

  return (
    <>
      <color attach="background" args={["#8fc6ee"]} />
      <fog attach="fog" args={["#9ccbe8", chunkRadius * 4.2, chunkRadius * 8 - 2]} />
      <Sky sunPosition={skyState.sun} turbidity={5} rayleigh={1.2} mieCoefficient={0.008} mieDirectionalG={0.8} />

      <ambientLight ref={ambientRef} intensity={0.55} />
      <hemisphereLight args={["#dcefff", "#3d4a3c", 0.7]} />
      <directionalLight
        ref={sunRef}
        position={[40, 60, 20]}
        intensity={2.1}
        color="#fff2d8"
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-far={110}
      />
      <pointLight position={[0, 24, 0]} intensity={12} distance={40} color="#8ed0ff" />

      <Clouds />

      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_LEVEL + 0.35, 0]}>
        <planeGeometry args={[420, 420]} />
        <meshStandardMaterial
          color="#2b83b8"
          transparent
          opacity={0.78}
          roughness={0.12}
          metalness={0.5}
          depthWrite={false}
        />
      </mesh>

      {chunks.map(([cx, cz]) => (
        <ChunkMesh
          key={chunkKey(cx, cz)}
          engine={engine}
          cx={cx}
          cz={cz}
          revision={revisions[chunkKey(cx, cz)] ?? 0}
        />
      ))}

      <RemotePlayers players={players} />

      <mesh ref={outlineRef} visible={false}>
        <boxGeometry args={[1.04, 1.04, 1.04]} />
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.9} />
      </mesh>
    </>
  );
}

export default function VoxelSandbox({ engine, seed, players }: VoxelSandboxProps) {
  const device = useGameStore((s) => s.device.mode);
  const quality = useSettings((s) => s.quality);
  const level = requiredQuality(quality, device);

  return (
    <Canvas
      key={`${engine.seed}-${seed}`}
      shadows={device !== "mobile" && level !== "low"}
      dpr={device === "mobile" ? [1, 1.5] : [1, 2]}
      camera={{ fov: 74, near: 0.1, far: 240 }}
      gl={{ antialias: level !== "low", powerPreference: "high-performance" }}
      onCreated={({ camera, scene }) => {
        camera.rotation.order = "YXZ";
        scene.background = new THREE.Color("#8fc6ee");
        scene.fog = new THREE.Fog("#9ccbe8", 34, 140);
      }}
    >
      <Scene engine={engine} players={players} />
    </Canvas>
  );
}

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Sparkles } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

const PALETTE = {
  grass: "#5aa64a",
  grassDark: "#3f8b3c",
  dirt: "#6f4f32",
  stone: "#6f7887",
  stoneDeep: "#4c5461",
  sand: "#d8c690",
  wood: "#8a5a33",
  leaves: "#2f7d3a",
  crystal: "#8b5cf6",
};

function buildIsland(): Voxel[] {
  const voxels: Voxel[] = [];
  const radius = 15;

  for (let x = -radius; x <= radius; x += 2) {
    for (let z = -radius; z <= radius; z += 2) {
      const distance = Math.hypot(x, z);
      if (distance > radius) continue;
      const height = Math.round(
        1.4 + Math.sin(x * 0.26) * 1.9 + Math.cos(z * 0.22) * 1.7 + Math.sin((x + z) * 0.16) * 1.1
      );
      const top = Math.max(-1, Math.min(height, 6));
      for (let y = -4; y <= top; y++) {
        let color = PALETTE.stone;
        if (y === top) color = distance > radius - 3 ? PALETTE.sand : PALETTE.grass;
        else if (y >= top - 1) color = PALETTE.dirt;
        else if (y <= -3) color = PALETTE.stoneDeep;
        voxels.push({ x, y, z, color });
      }

      // Trees on the higher, inland tiles.
      if (top > 2 && distance < radius - 5 && (x * 7 + z * 13) % 23 === 0) {
        for (let t = 1; t <= 2; t++) voxels.push({ x, y: top + t, z, color: PALETTE.wood });
        for (let dx = -2; dx <= 2; dx += 2) {
          for (let dz = -2; dz <= 2; dz += 2) {
            if (Math.abs(dx) + Math.abs(dz) > 2) continue;
            voxels.push({ x: x + dx, y: top + 3, z: z + dz, color: PALETTE.leaves });
            if (Math.abs(dx) + Math.abs(dz) <= 2) {
              voxels.push({ x: x + dx, y: top + 4, z: z + dz, color: PALETTE.leaves });
            }
          }
        }
      }
    }
  }

  return voxels;
}

function Island() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const voxels = useMemo(() => buildIsland(), []);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    voxels.forEach((voxel, index) => {
      matrix.makeTranslation(voxel.x, voxel.y, voxel.z);
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, color.set(voxel.color));
    });
    mesh.count = voxels.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [voxels, matrix, color]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, voxels.length + 8]} castShadow receiveShadow>
      <boxGeometry args={[1.94, 1.94, 1.94]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

function FloatingCrystal() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y += 0.008;
    ref.current.position.y = Math.sin(t * 1.4) * 0.4 + 7;
    ref.current.position.x = Math.sin(t * 0.6) * 1.2;
  });
  return (
    <group>
      <mesh ref={ref} position={[0, 7, 0]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#a78bfa" emissive="#6d28d9" emissiveIntensity={0.9} roughness={0.15} metalness={0.7} />
        <Sparkles count={24} scale={3} size={2.4} speed={0.4} color="#c4b5fd" />
      </mesh>
      <pointLight position={[0, 7, 0]} intensity={14} distance={16} color="#8b5cf6" />
    </group>
  );
}

function Clouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: -22 + i * 9,
        y: 15 + (i % 3) * 2.5,
        z: -16 + ((i * 13) % 28),
        scale: 1.5 + (i % 3) * 0.6,
      })),
    []
  );

  useFrame((_, delta) => {
    group.current?.children.forEach((cloud) => {
      cloud.position.x += delta * 0.3;
      if (cloud.position.x > 28) cloud.position.x = -28;
    });
  });

  return (
    <group ref={group}>
      {clouds.map((cloud, index) => (
        <mesh key={index} position={[cloud.x, cloud.y, cloud.z]} scale={cloud.scale}>
          <boxGeometry args={[5, 0.8, 2.4]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.16} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#0b3a5c" transparent opacity={0.7} roughness={0.18} metalness={0.6} />
    </mesh>
  );
}

export default function VoxelWorld() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [30, 16, 30], fov: 52 }}
        dpr={[1, 1.6]}
        shadows={false}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <hemisphereLight args={["#8fc7ff", "#1a2438", 0.8]} />
        <directionalLight position={[24, 30, 18]} intensity={2.2} color="#fff2d8" />
        <directionalLight position={[-18, 12, -14]} intensity={0.8} color="#6f8dff" />
        <pointLight position={[0, 9, 0]} intensity={18} distance={26} color="#38bdf8" />
        <fog attach="fog" args={["#070b16", 32, 92]} />
        <Stars radius={110} depth={45} count={2200} factor={4} saturation={0} fade speed={0.6} />

        <Island />
        <FloatingCrystal />
        <Clouds />
        <Water />

        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
          <group position={[-3.4, 11, 6]} rotation={[0, 0.32, 0]}>
            {[..."VOXEL"].map((_, index) => (
              <mesh key={index} position={[index * 1.15 - 2.3, 0, 0]}>
                <boxGeometry args={[0.85, 1.15, 0.15]} />
                <meshStandardMaterial
                  color="#00d4ff"
                  emissive="#0e7490"
                  emissiveIntensity={0.8}
                  roughness={0.2}
                  metalness={0.9}
                />
              </mesh>
            ))}
          </group>
        </Float>

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={18}
          maxDistance={64}
          autoRotate
          autoRotateSpeed={0.35}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}

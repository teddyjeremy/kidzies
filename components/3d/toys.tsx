"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Fabric, PaintedWood, Plastic, Rubber, useGlyphTexture } from "@/components/3d/materials";

type V3 = [number, number, number];

export function LetterBlock({ letter, color, position = [0, 0, 0], rotation = [0, 0, 0], size = 1 }: {
  letter: string; color: string; position?: V3; rotation?: V3; size?: number;
}) {
  const tex = useGlyphTexture(letter, color);
  return (
    <group position={position} rotation={rotation} scale={size}>
      <RoundedBox args={[1, 1, 1]} radius={0.16} smoothness={6} castShadow receiveShadow>
        <PaintedWood color={color} />
      </RoundedBox>
      {tex && (
        <>
          <mesh position={[0, 0, 0.505]}>
            <planeGeometry args={[0.78, 0.78]} />
            <meshPhysicalMaterial map={tex} roughness={0.5} clearcoat={0.4} transparent />
          </mesh>
          <mesh position={[0.505, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.78, 0.78]} />
            <meshPhysicalMaterial map={tex} roughness={0.5} clearcoat={0.4} transparent />
          </mesh>
        </>
      )}
    </group>
  );
}

export function Tree({ position, scale = 1, color = "#43c97a", sway = true }: { position: V3; scale?: number; color?: string; sway?: boolean }) {
  const crown = useRef<THREE.Group>(null);
  const offset = useMemo(() => (Math.abs(position[0] * 1.7 + position[2] * 2.3) % 1) * Math.PI * 2, [position]);
  useFrame(({ clock }) => {
    if (!sway || !crown.current) return;
    const t = clock.elapsedTime + offset;
    crown.current.rotation.z = Math.sin(t * 0.9) * 0.04;
    crown.current.rotation.x = Math.cos(t * 0.7) * 0.03;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.19, 1.2, 24]} />
        <PaintedWood color="#a86b3c" />
      </mesh>
      <group ref={crown} position={[0, 1.2, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.72, 48, 48]} />
          <Plastic color={color} roughness={0.55} />
        </mesh>
        <mesh position={[0.45, 0.2, 0.15]} castShadow>
          <sphereGeometry args={[0.48, 40, 40]} />
          <Plastic color={color} roughness={0.55} />
        </mesh>
        <mesh position={[-0.42, 0.25, -0.1]} castShadow>
          <sphereGeometry args={[0.5, 40, 40]} />
          <Plastic color={color} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

export function Cloud({ position, speed = 0.15, range = 26, animate = true }: { position: V3; speed?: number; range?: number; animate?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!animate || !ref.current) return;
    ref.current.position.x += dt * speed;
    if (ref.current.position.x > range / 2) ref.current.position.x = -range / 2;
  });
  return (
    <group ref={ref} position={position}>
      {([[0, 0, 0, 0.9], [0.9, -0.15, 0.1, 0.65], [-0.85, -0.2, 0, 0.6], [0.3, 0.35, -0.1, 0.6]] as const).map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Flower({ position, color }: { position: V3; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.4, 12]} />
        <Rubber color="#2fae5e" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.11, 0.42, Math.sin(a) * 0.11]} castShadow>
            <sphereGeometry args={[0.08, 20, 20]} />
            <Plastic color={color} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <Plastic color="#ffd23f" />
      </mesh>
    </group>
  );
}

function Eyes({ y, z, spread = 0.16, size = 0.07 }: { y: number; z: number; spread?: number; size?: number }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * spread, y, z]}>
          <mesh>
            <sphereGeometry args={[size, 24, 24]} />
            <Rubber color="#1f2340" />
          </mesh>
          <mesh position={[size * 0.35, size * 0.35, size * 0.75]}>
            <sphereGeometry args={[size * 0.3, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Cheeks({ y, z, spread = 0.26 }: { y: number; z: number; spread?: number }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * spread, y, z]} scale={[1, 0.6, 0.4]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#ff8fa3" roughness={0.8} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  );
}

/** Bobo, the friendly plush bear who guides children around the playground. */
export function Bear({ position = [0, 0, 0], scale = 1, color = "#c58b5a", wave = true, rotation = [0, 0, 0] }: {
  position?: V3; scale?: number; color?: string; wave?: boolean; rotation?: V3;
}) {
  const arm = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (arm.current && wave) arm.current.rotation.z = -2.2 + Math.sin(t * 4) * 0.35;
    if (body.current && wave) body.current.position.y = Math.abs(Math.sin(t * 2)) * 0.06;
  });
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <group ref={body}>
        <mesh position={[0, 0.55, 0]} castShadow scale={[1, 1.1, 0.95]}>
          <sphereGeometry args={[0.5, 48, 48]} />
          <Fabric color={color} />
        </mesh>
        <mesh position={[0, 0.5, 0.36]} scale={[1, 1.1, 0.5]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <Fabric color="#f3d9bd" />
        </mesh>
        <mesh position={[0, 1.32, 0]} castShadow>
          <sphereGeometry args={[0.45, 48, 48]} />
          <Fabric color={color} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.34, 1.68, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.15, 24, 24]} />
              <Fabric color={color} />
            </mesh>
            <mesh position={[0, 0, 0.07]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <Fabric color="#f3d9bd" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.22, 0.38]} scale={[1.2, 0.9, 0.8]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <Fabric color="#f3d9bd" />
        </mesh>
        <mesh position={[0, 1.27, 0.5]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <Plastic color="#3b2a20" />
        </mesh>
        <Eyes y={1.42} z={0.38} spread={0.15} size={0.055} />
        <Cheeks y={1.26} z={0.36} spread={0.25} />
        <group ref={arm} position={[0.42, 0.85, 0]} rotation={[0, 0, -2.2]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.3, 12, 24]} />
            <Fabric color={color} />
          </mesh>
        </group>
        <mesh position={[-0.45, 0.65, 0]} rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.12, 0.3, 12, 24]} />
          <Fabric color={color} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.22, 0.12, 0.12]} castShadow>
            <capsuleGeometry args={[0.14, 0.12, 12, 24]} />
            <Fabric color={color} />
          </mesh>
        ))}
        <mesh position={[0, 0.95, 0.12]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.32, 0.05, 16, 48]} />
          <Plastic color="#ff6f59" />
        </mesh>
      </group>
    </group>
  );
}

export function Duck({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { position?: V3; scale?: number; rotation?: V3 }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.35, 0]} scale={[1.15, 0.85, 1]} castShadow>
        <sphereGeometry args={[0.4, 40, 40]} />
        <Plastic color="#ffd23f" />
      </mesh>
      <mesh position={[0, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.28, 40, 40]} />
        <Plastic color="#ffd23f" />
      </mesh>
      <mesh position={[0, 0.8, 0.46]} scale={[1.3, 0.45, 1]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <Plastic color="#ff8a1f" />
      </mesh>
      <Eyes y={0.93} z={0.4} spread={0.11} size={0.045} />
      <mesh position={[0, 0.45, -0.42]} rotation={[-0.6, 0, 0]} scale={[0.8, 0.5, 1]}>
        <coneGeometry args={[0.15, 0.3, 24]} />
        <Plastic color="#ffd23f" />
      </mesh>
    </group>
  );
}

export function Pig({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { position?: V3; scale?: number; rotation?: V3 }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.45, 0]} scale={[1, 0.9, 1.25]} castShadow>
        <sphereGeometry args={[0.45, 40, 40]} />
        <Plastic color="#ff9fb2" />
      </mesh>
      <mesh position={[0, 0.75, 0.5]} castShadow>
        <sphereGeometry args={[0.32, 40, 40]} />
        <Plastic color="#ff9fb2" />
      </mesh>
      <mesh position={[0, 0.7, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 32]} />
        <Plastic color="#ff7f98" />
      </mesh>
      <Eyes y={0.86} z={0.76} spread={0.13} size={0.045} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 1.02, 0.45]} rotation={[0.4, 0, s * -0.4]}>
          <coneGeometry args={[0.09, 0.18, 20]} />
          <Plastic color="#ff8fa6" />
        </mesh>
      ))}
      {[[-0.22, -0.3], [0.22, -0.3], [-0.22, 0.3], [0.22, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.22, 20]} />
          <Plastic color="#ff8fa6" />
        </mesh>
      ))}
    </group>
  );
}

export function Frog({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { position?: V3; scale?: number; rotation?: V3 }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.32, 0]} scale={[1.2, 0.75, 1]} castShadow>
        <sphereGeometry args={[0.42, 40, 40]} />
        <Plastic color="#4fdca5" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.2, 0.68, 0.12]}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 32, 32]} />
            <Plastic color="#4fdca5" />
          </mesh>
          <mesh position={[0, 0.02, 0.1]}>
            <sphereGeometry args={[0.08, 20, 20]} />
            <Rubber color="#1f2340" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.38, 0.38]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.14, 0.025, 12, 32, Math.PI]} />
        <Rubber color="#0e7a55" />
      </mesh>
    </group>
  );
}

export function Sheep({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { position?: V3; scale?: number; rotation?: V3 }) {
  const puffs = useMemo(() => Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [Math.cos(a) * 0.32, 0.5 + Math.sin(i * 1.7) * 0.12, Math.sin(a) * 0.32] as V3;
  }), []);
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.38, 32, 32]} />
        <Fabric color="#f7f4ee" />
      </mesh>
      {puffs.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.18, 24, 24]} />
          <Fabric color="#f7f4ee" />
        </mesh>
      ))}
      <mesh position={[0, 0.62, 0.45]} scale={[0.9, 1, 0.9]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <Plastic color="#3a3f63" />
      </mesh>
      <Eyes y={0.68} z={0.62} spread={0.08} size={0.035} />
      {[[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.15], [0.18, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.25, 16]} />
          <Plastic color="#3a3f63" />
        </mesh>
      ))}
    </group>
  );
}

export function Owl({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { position?: V3; scale?: number; rotation?: V3 }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.5, 0]} scale={[1, 1.25, 0.95]} castShadow>
        <sphereGeometry args={[0.4, 40, 40]} />
        <Fabric color="#a68bff" />
      </mesh>
      <mesh position={[0, 0.42, 0.28]} scale={[1, 1.2, 0.5]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <Fabric color="#efe9ff" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.15, 0.75, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.13, 32, 32]} />
            <Plastic color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.065, 20, 20]} />
            <Rubber color="#1f2340" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.62, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.12, 16]} />
        <Plastic color="#ffa24c" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.22, 1.0, 0]} rotation={[0, 0, s * -0.35]}>
          <coneGeometry args={[0.08, 0.2, 20]} />
          <Fabric color="#8a6cf0" />
        </mesh>
      ))}
    </group>
  );
}

export function StarShape({ color = "#ffd23f", position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { color?: string; position?: V3; scale?: number; rotation?: V3 }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 0.5 : 0.24;
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 8, curveSegments: 12 });
    g.center();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} castShadow>
      <Plastic color={color} roughness={0.25} />
    </mesh>
  );
}

export function Apple({ position = [0, 0, 0], scale = 1 }: { position?: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow scale={[1, 0.92, 1]}>
        <sphereGeometry args={[0.3, 40, 40]} />
        <Plastic color="#ff4d4d" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.14, 10]} />
        <PaintedWood color="#7a4b2a" />
      </mesh>
      <mesh position={[0.08, 0.33, 0]} rotation={[0, 0, -0.8]} scale={[1, 0.35, 0.6]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <Plastic color="#2fae5e" />
      </mesh>
    </group>
  );
}

export function Balloon({ color, position = [0, 0, 0], scale = 1 }: { color: string; position?: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow scale={[1, 1.18, 1]}>
        <sphereGeometry args={[0.3, 40, 40]} />
        <Plastic color={color} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.37, 0]}>
        <coneGeometry args={[0.05, 0.08, 16]} />
        <Plastic color={color} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.7, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function ToyBlock({ color, position = [0, 0, 0], scale = 1 }: { color: string; position?: V3; scale?: number }) {
  return (
    <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.09} smoothness={5} position={position} scale={scale} castShadow>
      <PaintedWood color={color} />
    </RoundedBox>
  );
}

"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { AreaKey } from "@/types";
import { AREAS, type AreaInfo } from "@/lib/learning/areas";
import { PaintedWood, Plastic, Rubber, useLabelTexture } from "@/components/3d/materials";
import { Apple, Balloon, Bear, Cloud, Duck, Flower, LetterBlock, Owl, Pig, StarShape, ToyBlock, Tree } from "@/components/3d/toys";

type V3 = [number, number, number];

export interface PlaygroundSceneProps {
  completed: Partial<Record<AreaKey, number>>;
  assigned: AreaKey[];
  unlocked: string[];
  reducedMotion: boolean;
  lowPower: boolean;
  onSelect: (area: AreaKey) => void;
}

function Island() {
  return (
    <group>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[13.2, 12.4, 1.2, 128]} />
        <meshStandardMaterial color="#c98b5a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[13.4, 13.4, 0.12, 128]} />
        <meshPhysicalMaterial color="#7fd96a" roughness={0.85} sheen={0.6} sheenColor="#d8ffb8" />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[13.4, 0.1, 16, 160]} />
        <Plastic color="#66c457" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** A soft sandy path linking the plaza to every learning area. */
function Paths() {
  const curves = useMemo(
    () =>
      AREAS.map((a) => {
        const end = new THREE.Vector3(a.position[0], 0.05, a.position[1]);
        const mid = end.clone().multiplyScalar(0.5).add(new THREE.Vector3(end.z * 0.12, 0, -end.x * 0.12));
        return new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.05, 0), mid, end]);
      }),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.1, 96]} />
        <meshStandardMaterial color="#ffe7b8" roughness={0.9} />
      </mesh>
      {curves.map((c, i) => (
        <mesh key={i} receiveShadow scale={[1, 0.08, 1]} position={[0, 0.04, 0]}>
          <tubeGeometry args={[c, 48, 0.55, 16, false]} />
          <meshStandardMaterial color="#ffe0a3" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function SchoolHouse() {
  const flag = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 2.5) * 0.25;
  });
  return (
    <group position={[0, 0, 1.2]}>
      <RoundedBox args={[3.2, 2, 2.2]} radius={0.25} smoothness={6} position={[0, 1.05, 0]} castShadow receiveShadow>
        <PaintedWood color="#fff3d6" />
      </RoundedBox>
      <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow scale={[1, 1, 1]}>
        <coneGeometry args={[2.45, 1.4, 4, 1]} />
        <Plastic color="#ff6f59" />
      </mesh>
      <RoundedBox args={[0.9, 1.25, 0.2]} radius={0.12} smoothness={4} position={[0, 0.7, 1.08]} castShadow>
        <Plastic color="#2f9cf4" />
      </RoundedBox>
      <mesh position={[0.28, 0.7, 1.2]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <Plastic color="#ffd23f" />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <group key={x} position={[x, 1.3, 1.1]}>
          <RoundedBox args={[0.7, 0.7, 0.12]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial color="#bfe7ff" roughness={0.05} transmission={0.4} thickness={0.2} clearcoat={1} />
          </RoundedBox>
          <mesh position={[0, 0, 0.07]}>
            <torusGeometry args={[0.38, 0.05, 12, 40]} />
            <Plastic color="#ffd23f" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.2, 1.12]}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 40]} />
        <Plastic color="#ffffff" />
      </mesh>
      <mesh position={[0, 2.2, 1.17]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.04, 0.22, 0.02]} />
        <Rubber color="#1f2340" />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 10]} />
        <Plastic color="#ffffff" />
      </mesh>
      <mesh ref={flag} position={[0.25, 3.95, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <Plastic color="#ffd23f" />
      </mesh>
    </group>
  );
}

function SlideAndClimber() {
  return (
    <group position={[2.9, 0, 3.4]} rotation={[0, -0.6, 0]}>
      {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.75, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.5, 16]} />
          <Plastic color="#8a6cf0" />
        </mesh>
      ))}
      <RoundedBox args={[1.2, 0.12, 1.2]} radius={0.05} position={[0, 1.5, 0]} castShadow>
        <Plastic color="#ffd23f" />
      </RoundedBox>
      {[0.35, 0.75, 1.15].map((y) => (
        <mesh key={y} position={[-0.5, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1, 12]} />
          <Plastic color="#ff8a1f" />
        </mesh>
      ))}
      <mesh position={[0.95, 0.8, 0]} rotation={[0, 0, -0.75]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.7]} />
        <Plastic color="#1fbf85" />
      </mesh>
      {[-0.36, 0.36].map((z) => (
        <mesh key={z} position={[0.95, 0.88, z]} rotation={[0, 0, -0.75]}>
          <cylinderGeometry args={[0.05, 0.05, 1.95, 12]} />
          <Plastic color="#1fbf85" />
        </mesh>
      ))}
    </group>
  );
}

function Swing({ animate }: { animate: boolean }) {
  const seat = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (animate && seat.current) seat.current.rotation.x = Math.sin(clock.elapsedTime * 1.6) * 0.35;
  });
  return (
    <group position={[-3.1, 0, 3.4]} rotation={[0, 0.5, 0]}>
      {[-0.8, 0.8].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.9, 0.35]} rotation={[0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1.95, 12]} />
            <Plastic color="#2f9cf4" />
          </mesh>
          <mesh position={[x, 0.9, -0.35]} rotation={[-0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1.95, 12]} />
            <Plastic color="#2f9cf4" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 16]} />
        <Plastic color="#ff6f59" />
      </mesh>
      <group ref={seat} position={[0, 1.8, 0]}>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, -0.6, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 1.2, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        <RoundedBox args={[0.6, 0.07, 0.3]} radius={0.03} position={[0, -1.2, 0]} castShadow>
          <Plastic color="#ffd23f" />
        </RoundedBox>
      </group>
    </group>
  );
}

function AreaProps({ area }: { area: AreaKey }) {
  switch (area) {
    case "abc-garden":
      return (
        <group>
          <LetterBlock letter="A" color="#ff6f59" position={[-0.55, 0.5, 0]} rotation={[0, 0.3, 0]} size={0.8} />
          <LetterBlock letter="B" color="#2f9cf4" position={[0.4, 0.5, 0.2]} rotation={[0, -0.4, 0]} size={0.8} />
          <LetterBlock letter="C" color="#1fbf85" position={[-0.1, 1.3, 0.1]} rotation={[0, 0.1, 0]} size={0.8} />
          {[[-1.1, 0.7, "#ff9fb2"], [1.1, -0.5, "#a68bff"], [0.9, 0.9, "#ffd23f"], [-1, -0.7, "#ff8a1f"]].map(([x, z, c], i) => (
            <Flower key={i} position={[x as number, 0, z as number]} color={c as string} />
          ))}
        </group>
      );
    case "number-playground":
      return (
        <group>
          <group position={[0, 0, -0.2]}>
            {[-0.9, 0.9].map((x) => (
              <mesh key={x} position={[x, 0.75, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 1.5, 16]} />
                <PaintedWood color="#ff6f59" />
              </mesh>
            ))}
            {[0.45, 0.85, 1.25].map((y, row) => (
              <group key={y}>
                <mesh position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
                  <Plastic color="#ffffff" />
                </mesh>
                {Array.from({ length: 5 }).map((_, i) => (
                  <mesh key={i} position={[-0.55 + i * 0.2 + (row % 2) * 0.25, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <sphereGeometry args={[0.09, 24, 24]} />
                    <Plastic color={["#ffd23f", "#2f9cf4", "#1fbf85"][row]} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
          <Apple position={[-0.9, 0.3, 0.8]} scale={0.9} />
          <Apple position={[-0.4, 0.3, 1]} scale={0.9} />
          <Apple position={[0.9, 0.3, 0.8]} scale={0.9} />
        </group>
      );
    case "animal-world":
      return (
        <group>
          <Duck position={[-0.7, 0, 0.3]} rotation={[0, 0.5, 0]} scale={0.9} />
          <Pig position={[0.7, 0, 0.1]} rotation={[0, -0.4, 0]} scale={0.8} />
          <Owl position={[0, 0, -0.7]} scale={0.8} />
          <mesh position={[0, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.6, 48]} />
            <meshPhysicalMaterial color="#5bb8ff" roughness={0.05} clearcoat={1} />
          </mesh>
        </group>
      );
    case "storytime":
      return (
        <group position={[0, 0.2, 0]}>
          <group rotation={[-0.5, 0, 0]} position={[0, 0.8, 0]}>
            {[-1, 1].map((s) => (
              <RoundedBox key={s} args={[1, 0.12, 1.3]} radius={0.05} position={[s * 0.52, 0, 0]} rotation={[0, 0, s * -0.18]} castShadow>
                <Plastic color={s < 0 ? "#8a6cf0" : "#a68bff"} />
              </RoundedBox>
            ))}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.5, 0.08, 0]} rotation={[0, 0, s * -0.18]}>
                <boxGeometry args={[0.9, 0.04, 1.2]} />
                <meshStandardMaterial color="#fffaf2" roughness={0.9} />
              </mesh>
            ))}
          </group>
          {[["#ff6f59", -1.1], ["#2f9cf4", -0.85], ["#1fbf85", 0.95], ["#ffd23f", 1.2]].map(([c, x], i) => (
            <RoundedBox key={i} args={[0.22, 0.9, 0.7]} radius={0.04} position={[x as number, 0.25, -0.6]} rotation={[0, 0, i % 2 ? 0.08 : -0.06]} castShadow>
              <PaintedWood color={c as string} />
            </RoundedBox>
          ))}
        </group>
      );
    case "shapes-colours":
      return (
        <group>
          <ToyBlock color="#2f9cf4" position={[-0.6, 0.3, 0.2]} scale={1.3} />
          <mesh position={[0.55, 0.4, 0.1]} castShadow>
            <sphereGeometry args={[0.4, 48, 48]} />
            <Plastic color="#ff5a4e" roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.5, -0.65]} castShadow>
            <coneGeometry args={[0.45, 0.9, 48]} />
            <Plastic color="#1fbf85" />
          </mesh>
          <mesh position={[-0.6, 0.78, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.2, 0.08, 24, 48]} />
            <Plastic color="#ffd23f" />
          </mesh>
          <StarShape color="#ff8a1f" position={[0.55, 1.1, 0.1]} scale={0.7} />
        </group>
      );
    case "creative-studio":
      return (
        <group>
          <group position={[0, 0, -0.2]}>
            {[-0.45, 0.45].map((x) => (
              <mesh key={x} position={[x, 0.75, 0]} rotation={[0.15, 0, x > 0 ? -0.08 : 0.08]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 1.6, 10]} />
                <PaintedWood color="#c58b5a" />
              </mesh>
            ))}
            <RoundedBox args={[1.1, 0.9, 0.06]} radius={0.03} position={[0, 1.05, 0.1]} rotation={[-0.15, 0, 0]} castShadow>
              <meshStandardMaterial color="#ffffff" />
            </RoundedBox>
            {[["#ff6f59", -0.2, 1.15], ["#2f9cf4", 0.15, 0.95], ["#ffd23f", 0.05, 1.25]].map(([c, x, y], i) => (
              <mesh key={i} position={[x as number, y as number, 0.17]} rotation={[-0.15, 0, 0]}>
                <circleGeometry args={[0.15, 32]} />
                <meshStandardMaterial color={c as string} />
              </mesh>
            ))}
          </group>
          {["#ff6f59", "#ffd23f", "#2f9cf4", "#1fbf85", "#8a6cf0"].map((c, i) => (
            <group key={c} position={[-0.6 + i * 0.3, 0.1, 0.85]} rotation={[0, 0, Math.PI / 2]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.5, 20]} />
                <Plastic color={c} />
              </mesh>
              <mesh position={[0, 0.31, 0]}>
                <coneGeometry args={[0.07, 0.13, 20]} />
                <Plastic color={c} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "life-skills":
      return (
        <group>
          {[[-0.55, "#ff9fb2", "#2f9cf4"], [0.6, "#bfe7ff", "#ff6f59"]].map(([x, wall, roof], i) => (
            <group key={i} position={[x as number, 0, i ? 0.2 : -0.2]} scale={0.8}>
              <RoundedBox args={[1, 0.9, 0.9]} radius={0.12} position={[0, 0.45, 0]} castShadow>
                <PaintedWood color={wall as string} />
              </RoundedBox>
              <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[0.8, 0.65, 4]} />
                <Plastic color={roof as string} />
              </mesh>
              <RoundedBox args={[0.3, 0.45, 0.05]} radius={0.05} position={[0, 0.28, 0.46]}>
                <Plastic color="#ffd23f" />
              </RoundedBox>
            </group>
          ))}
        </group>
      );
  }
}

function AreaLabel({ text, color, onSelect, hovered }: { text: string; color: string; onSelect: () => void; hovered: boolean }) {
  const label = useLabelTexture(text, color);
  if (!label) return null;
  const height = hovered ? 0.82 : 0.72;
  return (
    <Billboard position={[0, 2.7, 0]}>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <planeGeometry args={[height * label.aspect, height]} />
        <meshBasicMaterial map={label.tex} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

function Station({ area, done, assigned, onSelect, animate }: {
  area: AreaInfo; done: boolean; assigned: boolean; onSelect: (a: AreaKey) => void; animate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useMemo(() => area.position[0] * 0.7, [area.position]);
  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const target = hovered ? 1.08 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, target, 8, dt);
    group.current.scale.setScalar(s);
    if (animate) group.current.position.y = hovered ? 0.15 + Math.sin(clock.elapsedTime * 4) * 0.05 : Math.sin(clock.elapsedTime + phase) * 0.03;
  });
  return (
    <group position={[area.position[0], 0, area.position[1]]}>
      <group
        ref={group}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onSelect(area.key); }}
      >
        <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.75, 1.85, 0.22, 96]} />
          <Plastic color={area.color} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.24, 0]} receiveShadow>
          <cylinderGeometry args={[1.55, 1.55, 0.04, 96]} />
          <meshStandardMaterial color="#fffaf2" roughness={0.8} />
        </mesh>
        <group position={[0, 0.26, 0]}>
          <AreaProps area={area.key} />
        </group>
        {done && <Sparkles count={24} scale={[3, 2.5, 3]} position={[0, 1.6, 0]} size={4} speed={animate ? 0.4 : 0} color="#ffd23f" />}
      </group>
      <AreaLabel text={`${area.title}${done ? " ★" : ""}${assigned ? " •" : ""}`} color={area.color} onSelect={() => onSelect(area.key)} hovered={hovered} />
    </group>
  );
}

function Unlockables({ unlocked, animate }: { unlocked: string[]; animate: boolean }) {
  const balloons = useRef<THREE.Group>(null);
  const kite = useRef<THREE.Group>(null);
  const carousel = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    if (balloons.current) balloons.current.position.y = 3.2 + Math.sin(t) * 0.2;
    if (kite.current) { kite.current.position.x = -2 + Math.sin(t * 0.5) * 1.5; kite.current.rotation.z = Math.sin(t) * 0.3; }
    if (carousel.current) carousel.current.rotation.y += dt * 0.6;
  });
  return (
    <group>
      {unlocked.includes("balloons") && (
        <group ref={balloons} position={[1.8, 3.2, -1]}>
          <Balloon color="#ff6f59" position={[0, 0, 0]} />
          <Balloon color="#ffd23f" position={[0.45, 0.2, 0.1]} />
          <Balloon color="#2f9cf4" position={[-0.4, 0.15, -0.1]} />
        </group>
      )}
      {unlocked.includes("kite") && (
        <group ref={kite} position={[-2, 6.5, -3]}>
          <mesh rotation={[0, 0, Math.PI / 4]} scale={[1, 1.4, 1]}>
            <boxGeometry args={[0.9, 0.9, 0.04]} />
            <Plastic color="#e84f8a" />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1.8, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
      {unlocked.includes("carousel") && (
        <group ref={carousel} position={[0, 0, 4.9]} scale={0.7}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[1.3, 1.3, 0.2, 64]} />
            <Plastic color="#ffd23f" />
          </mesh>
          <mesh position={[0, 1.8, 0]} castShadow>
            <coneGeometry args={[1.5, 0.8, 64]} />
            <Plastic color="#ff6f59" />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.7, 12]} />
            <Plastic color="#ffffff" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.9, 0.6, Math.sin((i * Math.PI) / 2) * 0.9]} castShadow>
              <sphereGeometry args={[0.22, 24, 24]} />
              <Plastic color={["#2f9cf4", "#1fbf85", "#8a6cf0", "#ff8a1f"][i]} />
            </mesh>
          ))}
        </group>
      )}
      {unlocked.includes("rainbow") && (
        <group position={[0, 0, -10.5]}>
          {["#ff5a4e", "#ff8a1f", "#ffd23f", "#1fbf85", "#2f9cf4", "#8a6cf0"].map((c, i) => (
            <mesh key={c}>
              <torusGeometry args={[5 - i * 0.35, 0.17, 16, 96, Math.PI]} />
              <Plastic color={c} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function Scenery({ animate }: { animate: boolean }) {
  const trees: [number, number, number, string][] = [
    [-10, -1.5, 1.2, "#43c97a"], [-9.5, 3, 1, "#5fd68c"], [-1.5, 8.6, 1.1, "#43c97a"], [2.4, 8.4, 0.9, "#7ddc6a"],
    [10, 1.8, 1.1, "#5fd68c"], [9.8, -3.2, 0.9, "#43c97a"], [-3.6, -9.2, 1, "#7ddc6a"], [3.6, -9.4, 1.1, "#5fd68c"],
    [-11, -5.5, 0.8, "#43c97a"], [11.2, -6.2, 0.8, "#7ddc6a"], [7.8, 7.6, 0.9, "#43c97a"], [-8.2, 7.8, 1, "#5fd68c"],
  ];
  return (
    <group>
      {trees.map(([x, z, s, c], i) => <Tree key={i} position={[x, 0, z]} scale={s} color={c} sway={animate} />)}
      {[[-10.5, 0.1, 5.5], [10.6, 0.1, 4.8], [0.5, 0.1, 10.5], [-6, 0.1, 9.8]].map(([x, y, z], i) => (
        <Flower key={i} position={[x, y, z] as V3} color={["#ff9fb2", "#a68bff", "#ffd23f", "#ff8a1f"][i]} />
      ))}
      <Cloud position={[-8, 8, -7]} speed={0.2} animate={animate} />
      <Cloud position={[4, 9, -9]} speed={0.12} animate={animate} />
      <Cloud position={[10, 7.5, -4]} speed={0.16} animate={animate} />
    </group>
  );
}

export default function PlaygroundScene({ completed, assigned, unlocked, reducedMotion, lowPower, onSelect }: PlaygroundSceneProps) {
  const animate = !reducedMotion;
  return (
    <Canvas
      shadows={!lowPower}
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 15.5, 19.5], fov: 42 }}
      gl={{ antialias: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      aria-label="Kidzies 3D playground"
    >
      <color attach="background" args={["#bfe8ff"]} />
      <fog attach="fog" args={["#d6f0ff", 30, 60]} />
      <hemisphereLight args={["#ffffff", "#8fd07a", 0.9]} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.8}
        castShadow={!lowPower}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      {!lowPower && (
        <Environment resolution={128} frames={1}>
          <Lightformer form="ring" intensity={2.2} position={[0, 10, 0]} scale={10} color="#fff7e6" />
          <Lightformer form="rect" intensity={1.4} position={[-10, 4, 6]} scale={[8, 4, 1]} color="#ffe0f0" />
          <Lightformer form="rect" intensity={1.2} position={[10, 4, -6]} scale={[8, 4, 1]} color="#dff1ff" />
        </Environment>
      )}
      <Suspense fallback={null}>
        <Island />
        <Paths />
        <SchoolHouse />
        <SlideAndClimber />
        <Swing animate={animate} />
        <Scenery animate={animate} />
        <Bear position={[-1.4, 0.08, 3.4]} scale={0.9} wave={animate} rotation={[0, 0.3, 0]} />
        {AREAS.map((a) => (
          <Station key={a.key} area={a} done={(completed[a.key] ?? 0) > 0} assigned={assigned.includes(a.key)} onSelect={onSelect} animate={animate} />
        ))}
        <Unlockables unlocked={unlocked} animate={animate} />
        <ContactShadows position={[0, 0.06, 0]} opacity={0.35} scale={28} blur={2.4} far={6} resolution={lowPower ? 256 : 1024} frames={animate ? Infinity : 1} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={12}
        maxDistance={26}
        minPolarAngle={0.45}
        maxPolarAngle={1.1}
        enableDamping
        target={[0, 0.5, 0]}
      />
    </Canvas>
  );
}

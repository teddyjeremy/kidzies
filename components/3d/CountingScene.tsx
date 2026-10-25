"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { CountableObject } from "@/lib/learning/content";
import { Apple, Balloon, StarShape, ToyBlock, Tree, Flower } from "@/components/3d/toys";
import { Plastic, PaintedWood } from "@/components/3d/materials";

const BALLOON_COLORS = ["#ff6f59", "#2f9cf4", "#ffd23f", "#1fbf85", "#8a6cf0", "#ff8a1f"];

function Item({ kind, index, home, collected, slot, onCollect, animate }: {
  kind: CountableObject; index: number; home: THREE.Vector3; collected: boolean; slot: number; onCollect: (i: number) => void; animate: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const basketPos = useMemo(() => new THREE.Vector3(-0.3 + (slot % 4) * 0.22, 0.75 + Math.floor(slot / 4) * 0.25, 2.2 + ((slot * 37) % 3) * 0.05), [slot]);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const target = collected ? basketPos : home;
    ref.current.position.lerp(target, animate ? Math.min(1, dt * 6) : 1);
    if (!collected && animate) ref.current.position.y = home.y + Math.sin(clock.elapsedTime * 2 + index) * 0.06;
    const s = THREE.MathUtils.damp(ref.current.scale.x, collected ? 0.55 : hover ? 1.15 : 1, 10, dt);
    ref.current.scale.setScalar(s);
  });
  return (
    <group
      ref={ref}
      position={home.toArray()}
      onClick={(e) => { e.stopPropagation(); onCollect(index); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
    >
      {kind === "apple" && <Apple />}
      {kind === "star" && <StarShape color="#ffd23f" scale={0.75} />}
      {kind === "balloon" && <Balloon color={BALLOON_COLORS[index % BALLOON_COLORS.length]} scale={0.9} />}
      {kind === "block" && <ToyBlock color={BALLOON_COLORS[index % BALLOON_COLORS.length]} scale={1.1} />}
    </group>
  );
}

function Basket() {
  return (
    <group position={[0, 0, 2.2]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.6, 0.7, 64, 1, true]} />
        <PaintedWood color="#d9925a" />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 64]} />
        <PaintedWood color="#b8743f" />
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.06, 16, 64]} />
        <PaintedWood color="#b8743f" />
      </mesh>
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.72, 0.04, 12, 64, Math.PI]} />
        <PaintedWood color="#b8743f" />
      </mesh>
    </group>
  );
}

export default function CountingScene({ kind, total, collected, onCollect, reducedMotion }: {
  kind: CountableObject; total: number; collected: number[]; onCollect: (i: number) => void; reducedMotion: boolean;
}) {
  const homes = useMemo(
    () => Array.from({ length: total }).map((_, i) => {
      const a = (i / total) * Math.PI * 1.6 + Math.PI * 0.7;
      const r = 1.9 + (i % 2) * 0.55;
      return new THREE.Vector3(Math.cos(a) * r, kind === "balloon" ? 1.3 + (i % 3) * 0.25 : 0.35, Math.sin(a) * r - 0.4);
    }),
    [total, kind],
  );
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 4.2, 6.4], fov: 45 }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
      <color attach="background" args={["#dff1ff"]} />
      <hemisphereLight args={["#ffffff", "#9be08a", 0.9]} />
      <directionalLight position={[4, 8, 5]} intensity={1.7} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="ring" intensity={2} position={[0, 6, 2]} scale={5} />
      </Environment>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[4.6, 4.6, 0.1, 96]} />
        <meshPhysicalMaterial color="#86dc72" roughness={0.85} sheen={0.5} sheenColor="#e2ffc8" />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[4.6, 4.3, 0.4, 96]} />
        <meshStandardMaterial color="#c98b5a" />
      </mesh>
      <Tree position={[-3.3, 0, -2.4]} scale={1.2} sway={!reducedMotion} />
      <Tree position={[3.4, 0, -2.2]} scale={1} color="#5fd68c" sway={!reducedMotion} />
      <Flower position={[2.8, 0, 1.8]} color="#ff9fb2" />
      <Flower position={[-2.9, 0, 1.6]} color="#a68bff" />
      <mesh position={[0, 0.02, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 3.1, 64]} />
        <Plastic color="#fff3d6" roughness={0.9} />
      </mesh>
      <Basket />
      {homes.map((h, i) => (
        <Item key={i} kind={kind} index={i} home={h} collected={collected.includes(i)} slot={collected.indexOf(i)} onCollect={onCollect} animate={!reducedMotion} />
      ))}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={10} blur={2} far={3} />
    </Canvas>
  );
}

"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { AnimalKey } from "@/lib/learning/content";
import { Bear, Duck, Frog, Owl, Pig, Sheep, Tree } from "@/components/3d/toys";

const ORDER: AnimalKey[] = ["duck", "pig", "frog", "bear", "sheep", "owl"];

function Animal({ kind, x, selected, onSelect, animate }: { kind: AnimalKey; x: number; selected: boolean; onSelect: (k: AnimalKey) => void; animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const s = THREE.MathUtils.damp(ref.current.scale.x, selected ? 1.25 : hover ? 1.1 : 1, 8, dt);
    ref.current.scale.setScalar(s);
    if (animate) ref.current.position.y = selected ? Math.abs(Math.sin(clock.elapsedTime * 6)) * 0.25 : 0;
    if (animate) ref.current.rotation.y = selected ? Math.sin(clock.elapsedTime * 3) * 0.3 : THREE.MathUtils.damp(ref.current.rotation.y, 0, 4, dt);
  });
  const props = { scale: kind === "bear" ? 0.55 : 0.9 };
  return (
    <group position={[x, 0, 0]}>
      <group
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onSelect(kind); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
      >
        {kind === "duck" && <Duck {...props} />}
        {kind === "pig" && <Pig {...props} />}
        {kind === "frog" && <Frog {...props} />}
        {kind === "bear" && <Bear {...props} wave={selected && animate} />}
        {kind === "sheep" && <Sheep {...props} />}
        {kind === "owl" && <Owl {...props} />}
      </group>
      {selected && <Sparkles count={16} scale={[1.4, 1.6, 1.4]} position={[0, 0.9, 0]} size={5} color="#ffd23f" speed={animate ? 0.6 : 0} />}
    </group>
  );
}

export default function AnimalStage({ selected, onSelect, reducedMotion }: { selected: AnimalKey | null; onSelect: (k: AnimalKey) => void; reducedMotion: boolean }) {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 2.6, 6.6], fov: 42 }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
      <color attach="background" args={["#dcfbef"]} />
      <hemisphereLight args={["#ffffff", "#9be08a", 0.9]} />
      <directionalLight position={[3, 7, 5]} intensity={1.7} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="ring" intensity={2} position={[0, 6, 3]} scale={5} />
      </Environment>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[5.2, 5.2, 0.12, 96]} />
        <meshPhysicalMaterial color="#86dc72" roughness={0.85} sheen={0.5} sheenColor="#e2ffc8" />
      </mesh>
      <Tree position={[-3.8, 0, -2]} sway={!reducedMotion} />
      <Tree position={[3.9, 0, -1.8]} color="#5fd68c" sway={!reducedMotion} />
      {ORDER.map((k, i) => (
        <Animal key={k} kind={k} x={(i - 2.5) * 1.35} selected={selected === k} onSelect={onSelect} animate={!reducedMotion} />
      ))}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={12} blur={2} far={3} />
    </Canvas>
  );
}

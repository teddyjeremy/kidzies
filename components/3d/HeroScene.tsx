"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Bear, Balloon, LetterBlock, StarShape, ToyBlock } from "@/components/3d/toys";
import { Plastic } from "@/components/3d/materials";

/** A light, self-contained toy scene for the homepage hero (does not load the playground). */
export default function HeroScene({ reducedMotion }: { reducedMotion: boolean }) {
  const f = !reducedMotion;
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [0, 1.6, 7.2], fov: 38 }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }} aria-hidden="true">
      <hemisphereLight args={["#ffffff", "#ffe2c8", 1]} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="ring" intensity={2.4} position={[0, 6, 3]} scale={5} color="#fff6e8" />
        <Lightformer form="rect" intensity={1.2} position={[-5, 2, 3]} scale={[5, 3, 1]} color="#ffd9ec" />
        <Lightformer form="rect" intensity={1.2} position={[5, 2, -2]} scale={[5, 3, 1]} color="#d6efff" />
      </Environment>
      <Bear position={[0, -1.4, 0]} scale={1.3} wave={f} rotation={[0, -0.2, 0]} />
      <Float enabled={f} speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <LetterBlock letter="A" color="#ff6f59" position={[-2.3, 0.9, 0]} rotation={[0.2, 0.5, 0.1]} size={0.85} />
      </Float>
      <Float enabled={f} speed={1.6} rotationIntensity={0.6} floatIntensity={1}>
        <LetterBlock letter="B" color="#2f9cf4" position={[2.3, 1.2, -0.4]} rotation={[-0.1, -0.6, -0.1]} size={0.8} />
      </Float>
      <Float enabled={f} speed={2.4} rotationIntensity={0.8} floatIntensity={0.9}>
        <LetterBlock letter="3" color="#1fbf85" position={[-1.7, -0.6, 0.8]} rotation={[0, 0.3, 0.2]} size={0.65} />
      </Float>
      <Float enabled={f} speed={1.8} rotationIntensity={1} floatIntensity={1.2}>
        <StarShape position={[1.5, 2.1, 0.4]} scale={0.8} rotation={[0, 0, 0.2]} />
      </Float>
      <Float enabled={f} speed={1.4} floatIntensity={1.4}>
        <Balloon color="#8a6cf0" position={[2.6, -0.2, 0.6]} scale={1.1} />
      </Float>
      <Float enabled={f} speed={2.2} rotationIntensity={1.2}>
        <mesh position={[-2.6, 2.1, -0.6]} castShadow>
          <torusGeometry args={[0.35, 0.14, 32, 64]} />
          <Plastic color="#ffd23f" />
        </mesh>
      </Float>
      <Float enabled={f} speed={2} rotationIntensity={1}>
        <ToyBlock color="#ff8a1f" position={[1.2, -1.0, 1.2]} />
      </Float>
      <ContactShadows position={[0, -1.42, 0]} opacity={0.35} scale={9} blur={2.5} far={3} />
    </Canvas>
  );
}

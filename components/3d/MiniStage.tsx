"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/** A small lit stage for showing one or two toys inside an activity. */
export default function MiniStage({ children, camera = [0, 1.2, 4.2], reducedMotion = false, height = 260 }: {
  children: React.ReactNode; camera?: [number, number, number]; reducedMotion?: boolean; height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: camera, fov: 40 }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
        <hemisphereLight args={["#ffffff", "#ffe7c2", 1]} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment resolution={64} frames={1}>
          <Lightformer form="ring" intensity={2} position={[0, 5, 2]} scale={4} />
          <Lightformer form="rect" intensity={1} position={[-4, 2, 3]} scale={[4, 2, 1]} color="#ffe0f0" />
        </Environment>
        <Float enabled={!reducedMotion} speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
          {children}
        </Float>
        <ContactShadows position={[0, -0.75, 0]} opacity={0.4} scale={6} blur={2.2} far={3} />
      </Canvas>
    </div>
  );
}

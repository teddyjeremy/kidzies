"use client";
import * as THREE from "three";

import { useMemo } from "react";

/** Glossy moulded-plastic look used for most toys. */
export function Plastic({ color, roughness = 0.32 }: { color: string; roughness?: number }) {
  return <meshPhysicalMaterial color={color} roughness={roughness} metalness={0} clearcoat={0.85} clearcoatRoughness={0.25} />;
}

/** Matte rubber, for wheels, eyes and soft parts. */
export function Rubber({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.85} metalness={0} />;
}

/** Soft fabric with sheen, for plush toys and cushions. */
export function Fabric({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.95} sheen={1} sheenColor="#ffffff" sheenRoughness={0.6} />;
}

/** Painted wood: lightly glossy with a warm tint. */
export function PaintedWood({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={0.4} clearcoatRoughness={0.5} />;
}

/** A canvas texture with a big rounded letter or symbol, so no font files are downloaded. */
export function useGlyphTexture(glyph: string, background: string, foreground = "#ffffff") {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.25, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `700 ${glyph.length > 1 ? 120 : 170}px "Fredoka", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 14;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.strokeText(glyph, size / 2, size / 2 + 12);
    ctx.fillStyle = foreground;
    ctx.fillText(glyph, size / 2, size / 2 + 8);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [glyph, background, foreground]);
}

/** A rounded "pill" label drawn to a canvas texture, so labels stay inside the 3D scene. */
export function useLabelTexture(text: string, background: string) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const scale = 2;
    const font = `700 ${34 * scale}px "Fredoka", "Trebuchet MS", sans-serif`;
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return null;
    probe.font = font;
    const w = Math.ceil(probe.measureText(text).width + 56 * scale);
    const h = 64 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h + 8 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const r = h / 2;
    const pill = (y: number) => {
      ctx.beginPath();
      ctx.moveTo(r, y);
      ctx.arcTo(w, y, w, y + h, r);
      ctx.arcTo(w, y + h, 0, y + h, r);
      ctx.arcTo(0, y + h, 0, y, r);
      ctx.arcTo(0, y, w, y, r);
      ctx.closePath();
    };
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    pill(8 * scale);
    ctx.fill();
    ctx.fillStyle = background;
    pill(0);
    ctx.fill();
    ctx.font = font;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2 * scale);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { tex, aspect: canvas.width / canvas.height };
  }, [text, background]);
}

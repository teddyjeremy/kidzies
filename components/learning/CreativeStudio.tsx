"use client";

import { useState } from "react";
import { Check, Eraser, RotateCcw } from "lucide-react";
import { useSound } from "@/lib/client/sound";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";

const PALETTE = [
  { name: "Red", hex: "#ff5a4e" }, { name: "Orange", hex: "#ff8a1f" }, { name: "Yellow", hex: "#ffd23f" }, { name: "Green", hex: "#1fbf85" },
  { name: "Sky blue", hex: "#5bb8ff" }, { name: "Blue", hex: "#2f6ff4" }, { name: "Purple", hex: "#8a6cf0" }, { name: "Pink", hex: "#ff9fb2" },
  { name: "Brown", hex: "#a86b3c" }, { name: "White", hex: "#ffffff" },
];

const PICTURES = {
  house: {
    title: "Happy house",
    regions: [
      { id: "sky", label: "sky", d: "M0 0 H400 V230 H0 Z" },
      { id: "sun", label: "sun", d: "M330 60 m-36 0 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0" },
      { id: "grass", label: "grass", d: "M0 230 Q100 210 200 228 T400 225 V300 H0 Z" },
      { id: "wall", label: "house wall", d: "M110 150 H270 V265 H110 Z" },
      { id: "roof", label: "roof", d: "M95 152 L190 80 L285 152 Z" },
      { id: "door", label: "door", d: "M172 200 H210 V265 H172 Z" },
      { id: "window1", label: "left window", d: "M125 170 H160 V200 H125 Z" },
      { id: "window2", label: "right window", d: "M222 170 H257 V200 H222 Z" },
      { id: "tree", label: "tree leaves", d: "M40 150 m-30 0 a30 34 0 1 0 60 0 a30 34 0 1 0 -60 0" },
      { id: "trunk", label: "tree trunk", d: "M34 180 H46 V240 H34 Z" },
    ],
  },
  fish: {
    title: "Friendly fish",
    regions: [
      { id: "water", label: "water", d: "M0 0 H400 V300 H0 Z" },
      { id: "body", label: "fish body", d: "M120 150 Q200 70 290 150 Q200 230 120 150 Z" },
      { id: "tail", label: "tail", d: "M120 150 L70 110 L80 150 L70 190 Z" },
      { id: "fin", label: "top fin", d: "M190 100 Q215 70 245 105 Z" },
      { id: "stripe", label: "stripe", d: "M200 95 Q215 150 200 205 L220 200 Q235 150 220 100 Z" },
      { id: "bubble1", label: "big bubble", d: "M320 80 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" },
      { id: "bubble2", label: "small bubble", d: "M345 45 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" },
      { id: "plant", label: "seaweed", d: "M40 300 Q20 250 45 220 Q60 250 50 300 Z" },
      { id: "sand", label: "sand", d: "M0 270 Q200 250 400 272 V300 H0 Z" },
    ],
  },
} as const;
type PictureKey = keyof typeof PICTURES;

export function CreativeStudio() {
  const { chime, speak } = useSound();
  const [picture, setPicture] = useState<PictureKey>("house");
  const [colour, setColour] = useState(PALETTE[0].hex);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const save = useActivitySave("creative-studio");
  const pic = PICTURES[picture];
  const coloured = Object.keys(fills).length;

  const paint = (id: string, label: string) => {
    setFills((f) => ({ ...f, [id]: colour }));
    chime("pop");
    speak(`${PALETTE.find((p) => p.hex === colour)?.name ?? ""} ${label}`);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_300px]">
      <div className="card p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {(Object.keys(PICTURES) as PictureKey[]).map((k) => (
            <button key={k} type="button" className={`btn btn-sm ${picture === k ? "btn-sky" : "btn-secondary"}`} onClick={() => { setPicture(k); setFills({}); }} aria-pressed={picture === k}>
              {PICTURES[k].title}
            </button>
          ))}
        </div>
        <svg viewBox="0 0 400 300" className="w-full rounded-2xl border-4 border-ink-900/10 bg-white" role="group" aria-label={`Colouring page: ${pic.title}`}>
          {pic.regions.map((r) => (
            <path key={r.id} d={r.d} fill={fills[r.id] ?? "#ffffff"} stroke="#1f2340" strokeWidth={3} strokeLinejoin="round"
              className="cursor-pointer focus:outline-none" tabIndex={0} role="button" aria-label={`Colour the ${r.label}`} data-testid="paint-region"
              onClick={() => paint(r.id, r.label)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); paint(r.id, r.label); } }} />
          ))}
        </svg>
      </div>
      <div className="flex flex-col gap-4">
        <div className="card p-4">
          <h2 className="mb-3 text-xl font-bold">Pick a crayon</h2>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Colours">
            {PALETTE.map((p) => (
              <button key={p.hex} type="button" role="radio" aria-checked={colour === p.hex} aria-label={p.name} onClick={() => { setColour(p.hex); speak(p.name); }}
                className={`aspect-square rounded-full border-4 shadow-toy transition ${colour === p.hex ? "scale-110 border-ink-900" : "border-white"}`} style={{ background: p.hex }} />
            ))}
          </div>
          <button type="button" className="btn btn-secondary btn-sm mt-3 w-full" onClick={() => setColour("#ffffff")}><Eraser size={16} aria-hidden="true" /> Rubber</button>
        </div>
        <p className="text-center font-bold text-ink-700" aria-live="polite">{coloured} of {pic.regions.length} parts coloured</p>
        <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(true)}><RotateCcw size={18} aria-hidden="true" /> Start again</button>
        <button type="button" className="btn btn-mint" disabled={coloured < 3}
          onClick={() => void save.finish({ score: 1, max: 1, answers: Object.entries(fills).map(([region, c]) => ({ region, colour: c })), mistakes: [] })}>
          <Check size={20} aria-hidden="true" /> {coloured < 3 ? "Colour 3 parts to finish" : "I'm finished!"}
        </button>
      </div>
      {confirmReset && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4">
          <div className="card max-w-sm p-6 text-center">
            <p className="font-display text-2xl font-bold">Clear your picture?</p>
            <div className="mt-4 flex justify-center gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(false)}>No, keep it</button>
              <button type="button" className="btn btn-primary" onClick={() => { setFills({}); setConfirmReset(false); }}>Yes, clear</button>
            </div>
          </div>
        </div>
      )}
      <ActivityResult save={save} onAgain={() => setFills({})} />
    </div>
  );
}

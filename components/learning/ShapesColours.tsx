"use client";

import { useMemo, useRef, useState } from "react";
import { COLOURS, SHAPES, type ColourKey, type ShapeKind } from "@/lib/learning/content";
import { shuffle } from "@/lib/learning/scoring";
import { useSound } from "@/lib/client/sound";
import { ShapeIcon } from "@/components/learning/ShapeIcon";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";

interface Piece { id: string; shape: ShapeKind; colour: ColourKey }
type Mode = "shape" | "colour";

const HEX: Record<ColourKey, string> = Object.fromEntries(COLOURS.map((c) => [c.key, c.hex])) as Record<ColourKey, string>;

function buildPieces(seed: number): { shape: Piece[]; colour: Piece[] } {
  const cols = COLOURS.map((c) => c.key);
  const shapePieces = shuffle(SHAPES).map((s, i) => ({ id: `s-${seed}-${i}`, shape: s, colour: cols[(i + seed) % cols.length] }));
  const colourPieces = shuffle(cols).map((c, i) => ({ id: `c-${seed}-${i}`, shape: SHAPES[(i + seed + 1) % SHAPES.length], colour: c }));
  return { shape: shapePieces, colour: colourPieces };
}

/** Sort shapes into shape buckets, then things into colour buckets. Drag-and-drop or tap-then-tap. */
export function ShapesColours() {
  const { speak, chime } = useSound();
  const [game, setGame] = useState(0);
  const sets = useMemo(() => buildPieces(game), [game]);
  const [mode, setMode] = useState<Mode>("shape");
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [missed, setMissed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string>("Drag each shape into the bucket with the same shape.");
  const save = useActivitySave("shapes-colours");
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const pieces = mode === "shape" ? sets.shape : sets.colour;
  const buckets: { key: string; label: string }[] = mode === "shape"
    ? SHAPES.map((s) => ({ key: s, label: s[0].toUpperCase() + s.slice(1) }))
    : COLOURS.map((c) => ({ key: c.key, label: c.name }));

  const drop = (pieceId: string, bucket: string) => {
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece || placed[pieceId]) return;
    const ok = mode === "shape" ? piece.shape === bucket : piece.colour === bucket;
    if (ok) {
      chime("correct");
      const nextPlaced = { ...placed, [pieceId]: true };
      setPlaced(nextPlaced);
      setSelected(null);
      const name = mode === "shape" ? piece.shape : COLOURS.find((c) => c.key === piece.colour)?.name ?? "";
      setMessage(`Yes! That is ${mode === "shape" ? "a " : ""}${name.toLowerCase()}.`);
      speak(`Yes! ${name}!`);
      if (pieces.every((p) => nextPlaced[p.id])) {
        if (mode === "shape") {
          window.setTimeout(() => {
            setMode("colour");
            setMessage("Now put each toy in the bucket with the same colour.");
            speak("Now match the colours!");
          }, 900);
        } else {
          const all = [...sets.shape, ...sets.colour];
          const score = all.filter((p) => !missed[p.id]).length;
          const mistakes = all.filter((p) => missed[p.id]).map((p) => (sets.shape.includes(p) ? `Shape: ${p.shape}` : `Colour: ${p.colour}`));
          void save.finish({ score, max: all.length, answers: all.map((p) => ({ shape: p.shape, colour: p.colour, first_try: missed[p.id] ? "no" : "yes" })), mistakes });
        }
      }
    } else {
      chime("wrong");
      setMissed((m) => ({ ...m, [pieceId]: true }));
      setMessage("Hmm, look again. Try another bucket!");
      speak("Try another bucket!");
      setSelected(null);
    }
  };

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (placed[id]) return;
    startPoint.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ id, x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag) setDrag({ ...drag, x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const moved = startPoint.current ? Math.hypot(e.clientX - startPoint.current.x, e.clientY - startPoint.current.y) : 0;
    const id = drag.id;
    setDrag(null);
    if (moved < 8) {
      setSelected((s) => (s === id ? null : id));
      return;
    }
    const target = document.elementsFromPoint(e.clientX, e.clientY).find((el) => (el as HTMLElement).dataset?.bucket) as HTMLElement | undefined;
    if (target?.dataset.bucket) drop(id, target.dataset.bucket);
  };

  const dragging = drag ? pieces.find((p) => p.id === drag.id) : null;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div className="card mb-4 p-5 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-500">{mode === "shape" ? "Part 1 · Shapes" : "Part 2 · Colours"}</p>
        <p className="mt-1 font-display text-2xl font-bold" role="status" aria-live="polite" data-testid="shape-message">{message}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Toys to sort">
        {pieces.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={placed[p.id]}
            onPointerDown={(e) => onPointerDown(e, p.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(p.id); } }}
            aria-pressed={selected === p.id}
            aria-label={`${COLOURS.find((c) => c.key === p.colour)?.name} ${p.shape}`}
            data-testid="shape-piece"
            data-shape={p.shape}
            data-colour={p.colour}
            className={`card grid h-32 touch-none place-items-center transition ${placed[p.id] ? "opacity-25" : "hover:-translate-y-1"} ${selected === p.id ? "ring-4 ring-sky-400" : ""} ${drag?.id === p.id ? "opacity-40" : ""}`}
          >
            <ShapeIcon shape={p.shape} color={HEX[p.colour]} size={84} />
          </button>
        ))}
      </div>
      <p className="my-4 text-center text-sm text-ink-500">Drag a toy into a bucket, or tap a toy and then tap a bucket.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {buckets.map((b) => (
          <button
            key={b.key}
            type="button"
            data-bucket={b.key}
            data-testid={`bucket-${b.key}`}
            onClick={() => selected && drop(selected, b.key)}
            className="flex h-40 flex-col items-center justify-end rounded-b-[3rem] rounded-t-2xl border-4 border-dashed pb-4 font-display text-xl font-bold transition hover:scale-[1.02]"
            style={mode === "colour" ? { background: `${HEX[b.key as ColourKey]}33`, borderColor: HEX[b.key as ColourKey] } : { background: "#ffffff", borderColor: "#a6abc8" }}
          >
            <span data-bucket={b.key} className="pointer-events-none">
              {mode === "shape" ? <ShapeIcon shape={b.key as ShapeKind} color="#d7dbee" size={56} /> : <span className="block size-12 rounded-full" style={{ background: HEX[b.key as ColourKey] }} />}
            </span>
            <span data-bucket={b.key} className="pointer-events-none">{b.label}</span>
          </button>
        ))}
      </div>
      {drag && dragging && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <ShapeIcon shape={dragging.shape} color={HEX[dragging.colour]} size={96} />
        </div>
      )}
      <ActivityResult save={save} onAgain={() => { setGame((g) => g + 1); setMode("shape"); setPlaced({}); setMissed({}); setMessage("Drag each shape into the bucket with the same shape."); }} />
    </div>
  );
}

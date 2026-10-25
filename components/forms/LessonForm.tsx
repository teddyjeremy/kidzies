"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { lessonSchema, type LessonInput } from "@/lib/validation";
import { saveLesson } from "@/app/actions/teacher";
import { AREAS } from "@/lib/learning/areas";

const SUBJECT_LABELS: Record<string, string> = {
  literacy: "Literacy & Phonics", numeracy: "Numbers & Counting", shapes: "Shapes & Colours", science: "Science Discovery",
  "creative-arts": "Creative Arts", "social-emotional": "Feelings & Friendship", "life-skills": "Life Skills",
};
const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple choice", matching: "Matching", counting: "Counting", letter: "Letter recognition", shape: "Shape recognition", colour: "Colour matching",
};

type FormValues = Omit<LessonInput, "objectives" | "questions"> & {
  objectivesText: string;
  questions: { prompt: string; emoji?: string; optionsText?: string; answer?: string; object?: string; target?: string }[];
};

const TEMPLATES: Record<string, Partial<FormValues>> = {
  multiple_choice: { subject: "science", location: "animal-world", instructions: "Listen and tap the right answer.", questions: [{ prompt: "Which animal says moo?", emoji: "🐄", optionsText: "Cow, Duck, Cat", answer: "Cow" }] },
  matching: { subject: "literacy", location: "abc-garden", instructions: "Match each picture with its word.", questions: [{ prompt: "Match the picture: 🐟", emoji: "🐟", optionsText: "Fish, Hat, Sun", answer: "Fish" }] },
  counting: { subject: "numeracy", location: "number-playground", instructions: "Tap the toys to collect them, then press Done.", questions: [{ prompt: "Collect 4 apples", object: "apple", target: "4" }, { prompt: "Collect 6 stars", object: "star", target: "6" }] },
  letter: { subject: "literacy", location: "abc-garden", instructions: "Listen to the word and tap its first letter.", questions: [{ prompt: "Fish starts with…", emoji: "🐟", optionsText: "F, G, H", answer: "F" }] },
  shape: { subject: "shapes", location: "shapes-colours", instructions: "Tap the shape that matches.", questions: [{ prompt: "Which shape is a wheel?", emoji: "🛞", optionsText: "Circle, Square, Triangle", answer: "Circle" }] },
  colour: { subject: "shapes", location: "shapes-colours", instructions: "Tap the colour of each thing.", questions: [{ prompt: "What colour is a tomato?", emoji: "🍅", optionsText: "Red, Blue, Green", answer: "Red" }] },
};

function toInput(v: FormValues): LessonInput {
  return {
    ...v,
    objectives: v.objectivesText.split("\n").map((s) => s.trim()).filter(Boolean),
    questions: v.questions.map((q) => ({
      prompt: q.prompt, emoji: q.emoji ?? "", answer: q.answer ?? "", object: q.object ?? "", target: q.target ?? "",
      options: (q.optionsText ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    })),
  };
}

export function LessonForm({ initial }: { initial?: LessonInput & { id?: string } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const { register, control, handleSubmit, watch, reset, getValues, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      id: initial?.id ?? "",
      title: initial?.title ?? "",
      subject: initial?.subject ?? "literacy",
      level: initial?.level ?? "KG1",
      description: initial?.description ?? "",
      objectivesText: (initial?.objectives ?? []).join("\n"),
      instructions: initial?.instructions ?? "",
      activity_type: initial?.activity_type ?? "letter",
      location: initial?.location ?? "abc-garden",
      media_url: initial?.media_url ?? "",
      questions: initial?.questions?.map((q) => ({ ...q, optionsText: (q.options ?? []).join(", ") })) ?? [{ prompt: "", emoji: "", optionsText: "", answer: "" }],
      points_per_question: initial?.points_per_question ?? 1,
      pass_mark: initial?.pass_mark ?? 60,
      status: initial?.status ?? "draft",
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });
  const type = watch("activity_type");

  const onSubmit = (values: FormValues) => {
    const input = toInput(values);
    const parsed = lessonSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setValidation(`${issue.path.join(" › ")}: ${issue.message}`);
      return;
    }
    setValidation(null);
    start(async () => {
      const res = await saveLesson(input);
      if (res.ok) router.push(`/teacher/lessons/${res.data.id}?saved=1`);
      else setServerError(res.error);
    });
  };

  const applyTemplate = (t: string) => {
    const tpl = TEMPLATES[t];
    reset({ ...getValues(), activity_type: t as FormValues["activity_type"], ...tpl, questions: tpl.questions ?? [] });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => setValidation("Please complete the highlighted fields."))} className="space-y-6" noValidate>
      <section className="card p-5">
        <h2 className="text-lg font-bold">Start from a template</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(TEMPLATES).map((t) => (
            <button key={t} type="button" className="btn btn-secondary btn-sm" onClick={() => applyTemplate(t)}>{TYPE_LABELS[t]}</button>
          ))}
        </div>
      </section>

      <section className="card grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="title">Lesson title</label>
          <input id="title" className="input" {...register("title", { required: "Add a title", minLength: { value: 3, message: "At least 3 characters" } })} aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="mt-1 text-sm text-coral-700">{errors.title.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="subject">Subject</label>
          <select id="subject" className="input" {...register("subject")}>{Object.entries(SUBJECT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </div>
        <div>
          <label className="label" htmlFor="level">Kindergarten level</label>
          <select id="level" className="input" {...register("level")}><option>Pre-K</option><option>KG1</option><option>KG2</option></select>
        </div>
        <div>
          <label className="label" htmlFor="activity_type">Activity type</label>
          <select id="activity_type" className="input" {...register("activity_type")}>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </div>
        <div>
          <label className="label" htmlFor="location">Playground location</label>
          <select id="location" className="input" {...register("location")}>{AREAS.map((a) => <option key={a.key} value={a.key}>{a.emoji} {a.title}</option>)}</select>
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" rows={2} className="input" {...register("description")} />
        </div>
        <div>
          <label className="label" htmlFor="objectivesText">Learning objectives (one per line)</label>
          <textarea id="objectivesText" rows={3} className="input" {...register("objectivesText")} />
        </div>
        <div>
          <label className="label" htmlFor="instructions">Instructions for the child</label>
          <textarea id="instructions" rows={3} className="input" {...register("instructions")} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="media_url">Optional audio or media link (https)</label>
          <input id="media_url" className="input" placeholder="https://" {...register("media_url")} />
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Questions</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => append(type === "counting" ? { prompt: "", object: "apple", target: "3" } : { prompt: "", emoji: "", optionsText: "", answer: "" })}>
            <Plus size={16} aria-hidden="true" /> Add question
          </button>
        </div>
        <ol className="mt-4 space-y-4">
          {fields.map((f, i) => (
            <li key={f.id} className="rounded-2xl bg-cream p-4">
              <div className="flex items-center justify-between"><span className="font-bold">Question {i + 1}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(i)} disabled={fields.length === 1} aria-label={`Remove question ${i + 1}`}><Trash2 size={16} /></button>
              </div>
              <div className="mt-2 grid gap-3 md:grid-cols-[2fr_1fr]">
                <div><label className="label" htmlFor={`q${i}`}>Question prompt</label><input id={`q${i}`} className="input" {...register(`questions.${i}.prompt` as const, { required: true })} /></div>
                {type === "counting" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label" htmlFor={`o${i}`}>Object</label>
                      <select id={`o${i}`} className="input" {...register(`questions.${i}.object` as const)}><option value="apple">Apples</option><option value="star">Stars</option><option value="balloon">Balloons</option><option value="block">Blocks</option></select></div>
                    <div><label className="label" htmlFor={`t${i}`}>Correct count</label><input id={`t${i}`} type="number" min={1} max={10} className="input" {...register(`questions.${i}.target` as const)} /></div>
                  </div>
                ) : (
                  <div><label className="label" htmlFor={`e${i}`}>Picture (emoji, optional)</label><input id={`e${i}`} className="input" maxLength={8} {...register(`questions.${i}.emoji` as const)} /></div>
                )}
                {type !== "counting" && (
                  <>
                    <div><label className="label" htmlFor={`opts${i}`}>Answer options (comma separated)</label><input id={`opts${i}`} className="input" placeholder="Cat, Dog, Fish" {...register(`questions.${i}.optionsText` as const)} /></div>
                    <div><label className="label" htmlFor={`a${i}`}>Correct answer</label><input id={`a${i}`} className="input" {...register(`questions.${i}.answer` as const)} /></div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card grid gap-4 p-5 md:grid-cols-3">
        <div><label className="label" htmlFor="ppq">Points per question</label><input id="ppq" type="number" min={1} max={10} className="input" {...register("points_per_question")} /></div>
        <div><label className="label" htmlFor="pass">Pass mark (%)</label><input id="pass" type="number" min={0} max={100} className="input" {...register("pass_mark")} /></div>
        <div><label className="label" htmlFor="status">Publication status</label>
          <select id="status" className="input" {...register("status")}><option value="draft">Draft (only you)</option><option value="published">Published (can be assigned)</option><option value="archived">Archived</option></select></div>
      </section>

      {(validation || serverError) && <p role="alert" className="rounded-2xl bg-coral-50 p-3 font-semibold text-coral-700">{validation ?? serverError}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save lesson"}</button>
      </div>
    </form>
  );
}

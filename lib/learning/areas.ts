import type { AreaKey } from "@/types";

export interface AreaInfo {
  key: AreaKey;
  title: string;
  short: string;
  description: string;
  color: string;
  emoji: string;
  /** Position on the 3D playground island (x, z). */
  position: [number, number];
}

export const AREAS: AreaInfo[] = [
  {
    key: "abc-garden",
    title: "Alphabet Garden",
    short: "Letters & sounds",
    description: "Toy letter blocks grow among the flowers. Tap a letter to hear its sound, then find the picture that starts with it.",
    color: "#ff6f59",
    emoji: "🔤",
    position: [-6.9, 0.2],
  },
  {
    key: "number-playground",
    title: "Number Playground",
    short: "Counting fun",
    description: "Collect apples, stars and balloons and count them into the basket, one by one.",
    color: "#2f9cf4",
    emoji: "🔢",
    position: [6.9, 0],
  },
  {
    key: "animal-world",
    title: "Animal World",
    short: "Meet the animals",
    description: "Say hello to friendly animals, hear what they say and help them find their homes.",
    color: "#1fbf85",
    emoji: "🐾",
    position: [-4.6, 5.4],
  },
  {
    key: "storytime",
    title: "Storytime Corner",
    short: "Listen & read",
    description: "Cosy picture stories read aloud, with little questions at the end.",
    color: "#8a6cf0",
    emoji: "📚",
    position: [0, -6.4],
  },
  {
    key: "shapes-colours",
    title: "Shapes & Colours",
    short: "Sort & match",
    description: "Drag circles, squares, triangles and stars into the matching buckets.",
    color: "#ff8a1f",
    emoji: "🔺",
    position: [4.8, 5.4],
  },
  {
    key: "creative-studio",
    title: "Creative Studio",
    short: "Colour & create",
    description: "Pick a crayon and colour in a happy picture. Start again any time.",
    color: "#e84f8a",
    emoji: "🎨",
    position: [-6.4, -6.6],
  },
  {
    key: "life-skills",
    title: "Life Skills Village",
    short: "Everyday skills",
    description: "Washing hands, sharing, feelings and staying safe, told through gentle little stories.",
    color: "#f5b700",
    emoji: "🏡",
    position: [6.4, -6.6],
  },
];

export const AREA_BY_KEY: Record<AreaKey, AreaInfo> = Object.fromEntries(AREAS.map((a) => [a.key, a])) as Record<AreaKey, AreaInfo>;

export function isAreaKey(value: string): value is AreaKey {
  return value in AREA_BY_KEY;
}

/** Public "Learning Adventures" catalogue on the marketing site (includes Science Discovery). */
export const LEARNING_ADVENTURES = [
  { slug: "alphabet-adventures", title: "Alphabet Adventures", area: "abc-garden", emoji: "🔤", color: "#ff6f59",
    description: "Letter recognition and first phonics sounds through toy letters, songs and picture matching.",
    skills: ["Recognising capital letters", "First sounds (phonics)", "Matching letters to objects"], status: "available" },
  { slug: "number-playground", title: "Number Playground", area: "number-playground", emoji: "🔢", color: "#2f9cf4",
    description: "Counting, one-to-one correspondence and early number sense by collecting toys in 3D.",
    skills: ["Counting to 10", "One-to-one correspondence", "Comparing more and fewer"], status: "available" },
  { slug: "animal-world", title: "Animal World", area: "animal-world", emoji: "🐾", color: "#1fbf85",
    description: "Animal names, sounds and homes, with simple facts and sorting games.",
    skills: ["Naming animals", "Animal sounds", "Sorting by habitat"], status: "available" },
  { slug: "storytime-corner", title: "Storytime Corner", area: "storytime", emoji: "📚", color: "#8a6cf0",
    description: "Short narrated stories that build listening, vocabulary and comprehension.",
    skills: ["Listening", "New words", "Remembering what happened"], status: "available" },
  { slug: "shapes-and-colours", title: "Shapes and Colours", area: "shapes-colours", emoji: "🔺", color: "#ff8a1f",
    description: "Recognise shapes and colours with drag-and-drop sorting buckets.",
    skills: ["Naming 2D shapes", "Primary colours", "Sorting by attribute"], status: "available" },
  { slug: "science-discovery", title: "Science Discovery", area: null, emoji: "🔬", color: "#5bb8ff",
    description: "Weather, plants and floating & sinking experiments to try at home.",
    skills: ["Observing", "Predicting", "Talking about change"], status: "coming-soon" },
  { slug: "creative-art-studio", title: "Creative Art Studio", area: "creative-studio", emoji: "🎨", color: "#e84f8a",
    description: "Colouring and creating with a big, friendly crayon palette.",
    skills: ["Colour choice", "Fine motor control", "Self-expression"], status: "available" },
  { slug: "life-skills-village", title: "Life Skills Village", area: "life-skills", emoji: "🏡", color: "#f5b700",
    description: "Hygiene, routines, sharing, feelings and everyday safety in gentle scenarios.",
    skills: ["Healthy habits", "Naming feelings", "Kind choices"], status: "available" },
] as const;

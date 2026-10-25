export const ALPHABET: { letter: string; word: string; emoji: string; sound: string }[] = [
  { letter: "A", word: "Apple", emoji: "🍎", sound: "a" }, { letter: "B", word: "Ball", emoji: "⚽", sound: "buh" },
  { letter: "C", word: "Cat", emoji: "🐱", sound: "cuh" }, { letter: "D", word: "Duck", emoji: "🦆", sound: "duh" },
  { letter: "E", word: "Egg", emoji: "🥚", sound: "eh" }, { letter: "F", word: "Fish", emoji: "🐟", sound: "fff" },
  { letter: "G", word: "Grapes", emoji: "🍇", sound: "guh" }, { letter: "H", word: "Hat", emoji: "🎩", sound: "huh" },
  { letter: "I", word: "Igloo", emoji: "🧊", sound: "ih" }, { letter: "J", word: "Jelly", emoji: "🍮", sound: "juh" },
  { letter: "K", word: "Kite", emoji: "🪁", sound: "kuh" }, { letter: "L", word: "Lion", emoji: "🦁", sound: "lll" },
  { letter: "M", word: "Moon", emoji: "🌙", sound: "mmm" }, { letter: "N", word: "Nest", emoji: "🪺", sound: "nnn" },
  { letter: "O", word: "Octopus", emoji: "🐙", sound: "o" }, { letter: "P", word: "Pig", emoji: "🐷", sound: "puh" },
  { letter: "Q", word: "Queen", emoji: "👑", sound: "kwuh" }, { letter: "R", word: "Rainbow", emoji: "🌈", sound: "rrr" },
  { letter: "S", word: "Sun", emoji: "☀️", sound: "sss" }, { letter: "T", word: "Tiger", emoji: "🐯", sound: "tuh" },
  { letter: "U", word: "Umbrella", emoji: "☂️", sound: "uh" }, { letter: "V", word: "Van", emoji: "🚐", sound: "vvv" },
  { letter: "W", word: "Whale", emoji: "🐳", sound: "wuh" }, { letter: "X", word: "Fox", emoji: "🦊", sound: "ks" },
  { letter: "Y", word: "Yo-yo", emoji: "🪀", sound: "yuh" }, { letter: "Z", word: "Zebra", emoji: "🦓", sound: "zzz" },
];

export const ANIMALS = [
  { key: "duck", name: "Duck", sound: "Quack quack!", home: "pond", fact: "Ducks have waterproof feathers, so they stay dry when they swim.", color: "#ffd23f" },
  { key: "pig", name: "Pig", sound: "Oink oink!", home: "farm", fact: "Pigs roll in mud to keep cool on hot days.", color: "#ff9fb2" },
  { key: "frog", name: "Frog", sound: "Ribbit!", home: "pond", fact: "Frogs start life as tiny tadpoles that live in water.", color: "#4fdca5" },
  { key: "bear", name: "Bear", sound: "Grrr!", home: "forest", fact: "Bears sleep for a long time in winter. That is called hibernating.", color: "#b07a4f" },
  { key: "sheep", name: "Sheep", sound: "Baa baa!", home: "farm", fact: "Sheep grow soft wool that can be made into warm jumpers.", color: "#f4f1ea" },
  { key: "owl", name: "Owl", sound: "Hoo hoo!", home: "forest", fact: "Owls are awake at night and can turn their heads a long way round.", color: "#a68bff" },
] as const;
export type AnimalKey = (typeof ANIMALS)[number]["key"];

export const HOMES = [
  { key: "farm", name: "Farm", emoji: "🚜" },
  { key: "pond", name: "Pond", emoji: "💧" },
  { key: "forest", name: "Forest", emoji: "🌲" },
] as const;

export interface StoryPage { text: string; scene: string[]; background: string }
export interface Story { key: string; title: string; cover: string; pages: StoryPage[]; questions: { prompt: string; options: string[]; answer: string }[] }

export const STORIES: Story[] = [
  {
    key: "pip-umbrella",
    title: "Pip and the Big Blue Umbrella",
    cover: "☂️",
    pages: [
      { text: "Pip the penguin woke up and looked outside. Drip, drop! It was raining.", scene: ["🐧", "🌧️", "🏠"], background: "#dff1ff" },
      { text: "Pip found a big blue umbrella by the door. \"Now I can play outside!\" said Pip.", scene: ["🐧", "☂️"], background: "#e7f6ff" },
      { text: "In the garden, Pip saw Bella the bunny. Bella was getting very wet.", scene: ["🐧", "☂️", "🐰", "💧"], background: "#dcfbef" },
      { text: "\"Come under my umbrella!\" said Pip. Bella hopped in, and they both stayed dry.", scene: ["🐧", "☂️", "🐰", "😊"], background: "#fff5cc" },
      { text: "Soon the rain stopped and a rainbow came out. Sharing made the day happy!", scene: ["🌈", "🐧", "🐰", "☀️"], background: "#ffe9d6" },
    ],
    questions: [
      { prompt: "What colour was Pip's umbrella?", options: ["Blue", "Red", "Green"], answer: "Blue" },
      { prompt: "Who did Pip share the umbrella with?", options: ["A bunny", "A cat", "A fish"], answer: "A bunny" },
      { prompt: "What came out when the rain stopped?", options: ["A rainbow", "The moon", "A rocket"], answer: "A rainbow" },
    ],
  },
  {
    key: "tumble-tower",
    title: "Tumble the Tall Tower",
    cover: "🧱",
    pages: [
      { text: "Milo the monkey had five wooden blocks: red, yellow, blue, green and orange.", scene: ["🐵", "🟥", "🟨", "🟦", "🟩", "🟧"], background: "#fff4f1" },
      { text: "He stacked them up, one, two, three, four, five. What a tall tower!", scene: ["🐵", "🧱", "⬆️"], background: "#fff5cc" },
      { text: "Wobble, wobble… CRASH! The tower tumbled down. Milo felt sad.", scene: ["🐵", "😢", "🧱"], background: "#efe9ff" },
      { text: "His friend Ellie the elephant said, \"Let's try again together. Big blocks at the bottom!\"", scene: ["🐵", "🐘", "🤝"], background: "#dcfbef" },
      { text: "This time the tower stood tall. Milo smiled. Trying again helped!", scene: ["🐵", "🐘", "🏆", "😄"], background: "#dff1ff" },
    ],
    questions: [
      { prompt: "How many blocks did Milo have?", options: ["Five", "Two", "Ten"], answer: "Five" },
      { prompt: "Who helped Milo?", options: ["An elephant", "A lion", "A duck"], answer: "An elephant" },
      { prompt: "What did Milo learn?", options: ["Try again", "Give up", "Go to sleep"], answer: "Try again" },
    ],
  },
];

export interface LifeScenario { key: string; title: string; scene: string[]; story: string; prompt: string; options: { text: string; emoji: string; correct: boolean; reply: string }[] }

export const LIFE_SCENARIOS: LifeScenario[] = [
  {
    key: "wash-hands", title: "Washing hands", scene: ["🧼", "🙌", "🚰"],
    story: "Kip has been playing in the garden and now it is time for lunch.",
    prompt: "What should Kip do before eating?",
    options: [
      { text: "Wash hands with soap and water", emoji: "🧼", correct: true, reply: "Yes! Soap and water wash the germs away. Scrub for as long as it takes to sing Happy Birthday twice." },
      { text: "Eat straight away", emoji: "🍽️", correct: false, reply: "Hmm, hands can have germs after playing. Let's try another choice." },
    ],
  },
  {
    key: "sharing", title: "Sharing", scene: ["🧸", "👧", "👦"],
    story: "Nia is playing with the teddy. Her friend Sam would like a turn too.",
    prompt: "What is a kind thing Nia can do?",
    options: [
      { text: "Hold on and say no", emoji: "🙅", correct: false, reply: "Sam might feel sad. Is there a kinder choice?" },
      { text: "Take turns with the teddy", emoji: "🔄", correct: true, reply: "Lovely! Taking turns means everyone gets to play." },
    ],
  },
  {
    key: "feelings", title: "Feelings", scene: ["😢", "🎈"],
    story: "Leo's red balloon floated away into the sky. He feels like crying.",
    prompt: "How is Leo feeling?",
    options: [
      { text: "Sad", emoji: "😢", correct: true, reply: "That's right. It's okay to feel sad. A hug or talking to a grown-up can help." },
      { text: "Excited", emoji: "🤩", correct: false, reply: "Look at Leo's face again. How might he feel?" },
    ],
  },
  {
    key: "road-safety", title: "Staying safe", scene: ["🚦", "🧑‍🧒", "🚗"],
    story: "Ava and her dad want to cross the road to get to the park.",
    prompt: "What should Ava do?",
    options: [
      { text: "Hold a grown-up's hand and wait for the green person", emoji: "🤝", correct: true, reply: "Super safe! Always cross with a grown-up and look both ways." },
      { text: "Run across by herself", emoji: "🏃", correct: false, reply: "Roads can be busy. Let's choose the safest way." },
    ],
  },
  {
    key: "bedtime", title: "Bedtime routine", scene: ["🪥", "🛁", "🛏️"],
    story: "It is getting late and the moon is coming up.",
    prompt: "What helps us get ready for bed?",
    options: [
      { text: "Brush teeth and read a story", emoji: "🪥", correct: true, reply: "Yes! Brushing teeth and a calm story help our bodies rest." },
      { text: "Jump on the bed", emoji: "🤸", correct: false, reply: "That sounds fun, but it makes it hard to fall asleep. Try again!" },
    ],
  },
];

export const SHAPES = ["circle", "square", "triangle", "star"] as const;
export type ShapeKind = (typeof SHAPES)[number];
export const COLOURS = [
  { key: "red", name: "Red", hex: "#ff5a4e" },
  { key: "blue", name: "Blue", hex: "#2f9cf4" },
  { key: "yellow", name: "Yellow", hex: "#ffd23f" },
  { key: "green", name: "Green", hex: "#1fbf85" },
] as const;
export type ColourKey = (typeof COLOURS)[number]["key"];

export const COUNTABLE_OBJECTS = ["apple", "star", "balloon", "block"] as const;
export type CountableObject = (typeof COUNTABLE_OBJECTS)[number];

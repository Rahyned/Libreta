export interface Mood {
  emoji: string;
  label: string;
}

export const MOODS: Mood[] = [
  { emoji: "😍", label: "Increíble" },
  { emoji: "😄", label: "Me encantó" },
  { emoji: "🙂", label: "Me gustó" },
  { emoji: "😐", label: "Regular" },
  { emoji: "😒", label: "No mucho" },
  { emoji: "😞", label: "No recomiendo" },
];

export const GENRES: string[] = [
  "Drama",
  "Comedia",
  "Romance",
  "Acción",
  "Ciencia ficción",
  "Terror",
  "Animación",
  "Documental",
  "Thriller",
  "Fantasía",
];

export const USER_COLORS: string[] = [
  "#d4a5a5",
  "#a8d5d5",
  "#ffe4d4",
  "#c9b8e8",
  "#a8d0a8",
  "#f2c894",
];

export const WATCHED_AT_OPTIONS: string[] = ["En Casa", "En el Cine"];

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function formatDate(value: string | null): string {
  if (!value) return "";
  const [y, m, d] = value.slice(0, 10).split("-");
  if (!y || !m || !d) return value.slice(0, 10);
  const month = MONTHS[Number(m) - 1] ?? m;
  return `${d} ${month} ${y}`;
}

export function moodToString(mood: Mood): string {
  return `${mood.emoji} ${mood.label}`;
}

export function parseMood(value: string | null): Mood | null {
  if (!value) return null;
  return MOODS.find((m) => value === moodToString(m)) ?? null;
}

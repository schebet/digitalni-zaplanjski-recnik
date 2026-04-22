import data from "./recnik.json";

export interface Entry {
  headword: string;
  pos: string;
  definition: string;
  letter: string;
}

export interface RecnikData {
  alphabet: string[];
  stats: Record<string, number>;
  byLetter: Record<string, Entry[]>;
}

export const recnik = data as RecnikData;

/** Ukloni kombinujuće akcente i razmake da olakša pretragu i sortiranje. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export const TOTAL_ENTRIES = Object.values(recnik.stats).reduce(
  (a, b) => a + b,
  0,
);

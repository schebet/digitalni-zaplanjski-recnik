import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recnik, normalize, type Entry } from "@/data/recnik";

type SortMode = "alpha" | "letter";

/** Po opadajućem broju odrednica, sa "Остало" uvek na kraju radi jasnije navigacije. */
function getOrderedCategories(): { name: string; count: number }[] {
  const stats = recnik.categoryStats ?? {};
  const list = Object.entries(stats).map(([name, count]) => ({ name, count }));
  list.sort((a, b) => {
    if (a.name === "Остало") return 1;
    if (b.name === "Остало") return -1;
    return b.count - a.count;
  });
  return list;
}

/** Sve odrednice spljoštene jednom — kategorije se filtriraju iz ovog niza. */
const ALL_ENTRIES: Entry[] = Object.values(recnik.byLetter).flat();

const CategoryBrowser = () => {
  const categories = useMemo(getOrderedCategories, []);
  const [active, setActive] = useState<string>(categories[0]?.name ?? "Остало");
  const [sort, setSort] = useState<SortMode>("alpha");

  const entries = useMemo(() => {
    const filtered = ALL_ENTRIES.filter((e) => e.category === active);
    if (sort === "alpha") {
      return [...filtered].sort((a, b) =>
        normalize(a.headword).localeCompare(normalize(b.headword), "sr"),
      );
    }
    // sort === "letter": grupisanje sledi prirodni redosled azbuke
    return [...filtered].sort((a, b) => {
      const la = recnik.alphabet.indexOf(a.letter);
      const lb = recnik.alphabet.indexOf(b.letter);
      if (la !== lb) return la - lb;
      return normalize(a.headword).localeCompare(normalize(b.headword), "sr");
    });
  }, [active, sort]);

  // Group za prikaz po slovu (samo kad sort === "letter")
  const grouped = useMemo(() => {
    if (sort !== "letter") return null;
    const map = new Map<string, Entry[]>();
    entries.forEach((e) => {
      const arr = map.get(e.letter) ?? [];
      arr.push(e);
      map.set(e.letter, arr);
    });
    return Array.from(map.entries());
  }, [entries, sort]);

  return (
    <section
      id="kategorije"
      className="border-t border-border bg-background"
      aria-labelledby="kategorije-heading"
    >
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
          <Tag className="h-4 w-4" />
          Категорије
        </div>
        <h2
          id="kategorije-heading"
          className="mb-3 text-center font-serif text-3xl font-semibold"
        >
          Речи по темама
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Изабери категорију — нпр. дунђерлук, овчарство, одећа — и прегледај
          све одреднице које припадају тој теми.
        </p>

        {/* Tabovi kategorija */}
        <div
          role="tablist"
          aria-label="Категорије речи"
          className="mb-6 flex flex-wrap justify-center gap-2"
        >
          {categories.map((c) => {
            const isActive = c.name === active;
            return (
              <button
                key={c.name}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls="category-panel"
                onClick={() => setActive(c.name)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort toolbar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {entries.length}
            </span>{" "}
            одредница у категорији „{active}"
          </p>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
            <Button
              type="button"
              size="sm"
              variant={sort === "alpha" ? "default" : "ghost"}
              onClick={() => setSort("alpha")}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Азбучно
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sort === "letter" ? "default" : "ghost"}
              onClick={() => setSort("letter")}
              className="h-8 px-3 text-xs"
            >
              По слову
            </Button>
          </div>
        </div>

        {/* Panel sa odrednicama */}
        <div
          id="category-panel"
          role="tabpanel"
          aria-label={`Одреднице у категорији ${active}`}
        >
          {entries.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Нема одредница у овој категорији.
            </Card>
          ) : grouped ? (
            <div className="space-y-8">
              {grouped.map(([letter, items]) => (
                <div key={letter}>
                  <div className="mb-3 flex items-baseline gap-3 border-b border-border pb-2">
                    <Link
                      to={`/recnik/${letter}`}
                      className="font-serif text-3xl font-bold text-primary hover:underline"
                      aria-label={`Отвори све одреднице на слово ${letter}`}
                    >
                      {letter}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {items.length} одредница
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {items.map((e, i) => (
                      <EntryRow key={`${e.headword}-${i}`} entry={e} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {entries.map((e, i) => (
                <EntryRow key={`${e.headword}-${i}`} entry={e} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

/** Dosledan red prikaza odrednice — koristi se i pri grupisanju i pri sortiranju. */
const EntryRow = ({ entry }: { entry: Entry }) => (
  <li>
    <Link
      to={`/recnik/${entry.letter}`}
      className="group block rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-serif text-base font-bold text-primary">
          {entry.headword}
        </span>
        <Badge variant="secondary" className="font-mono text-[10px]">
          {entry.pos}
        </Badge>
      </div>
      {entry.definition && (
        <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
          {entry.definition}
        </p>
      )}
    </Link>
  </li>
);

export default CategoryBrowser;

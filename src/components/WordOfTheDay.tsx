import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { recnik } from "@/data/recnik";
import ShareButtons from "./ShareButtons";

/** Deterministic daily index based on day-of-year. */
function getDayIndex(modulo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % modulo;
}

const WordOfTheDay = () => {
  const entry = useMemo(() => {
    const all = Object.values(recnik.byLetter).flat();
    if (all.length === 0) return null;
    return all[getDayIndex(all.length)];
  }, []);

  if (!entry) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/recnik/${entry.letter}`
      : "";
  const shareTitle = `Реч дана из Заплањског речника: ${entry.headword}`;

  return (
    <section className="mx-auto max-w-4xl px-6 pb-4">
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
          <Sparkles className="h-4 w-4" />
          Реч дана
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            to={`/recnik/${entry.letter}`}
            className="font-serif text-3xl font-bold text-primary hover:underline sm:text-4xl"
          >
            {entry.headword}
          </Link>
          <Badge variant="secondary" className="font-mono text-xs">
            {entry.pos}
          </Badge>
        </div>
        {entry.definition && (
          <p className="mt-3 text-base leading-relaxed text-foreground/85">
            {entry.definition}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/recnik/${entry.letter}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Још одредница на слово {entry.letter} →
          </Link>
          <ShareButtons url={shareUrl} title={shareTitle} />
        </div>
      </Card>
    </section>
  );
};

export default WordOfTheDay;

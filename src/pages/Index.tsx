import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, BookOpen, Hash } from "lucide-react";
import { toast } from "sonner";
import { recnik, TOTAL_ENTRIES } from "@/data/recnik";
import BackToTop from "@/components/BackToTop";
import CategoryBrowser from "@/components/CategoryBrowser";

const PDF_PATH = "/downloads/ZAPLANJSKI_RECNIK_modern.pdf";
const DOCX_PATH = "/downloads/ZAPLANJSKI_RECNIK_modern.docx";

const ALPHABET = [
  "А","Б","В","Г","Д","Ђ","Е","Ж","З","И","Ј","К","Л","Љ","М","Н","Њ",
  "О","П","Р","С","Т","Ћ","У","Ц","Ч","Џ","Ш",
];

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const Index = () => {
  const handlePdfDownload = () => {
    triggerDownload(PDF_PATH, "ZAPLANJSKI_RECNIK_modern.pdf");
    toast.success("Преузимање PDF-а је започето", {
      description: "271 страна • 2,7 MB",
    });
  };

  const handleDocxDownload = () => {
    triggerDownload(DOCX_PATH, "ZAPLANJSKI_RECNIK_modern.docx");
    toast.success("Преузимање DOCX-а је започето", {
      description: "Word формат • 363 KB",
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(217_60%_30%/0.08),_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <p className="mb-6 inline-block rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Дигитални речник заплањског говора
          </p>
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-7xl">
            Заплањски
            <br />
            <span className="text-primary">Речник</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Преко {TOTAL_ENTRIES.toLocaleString("sr-Cyrl")} одредница
            заплањског говора, преуређених у модерни речник са алфабетском
            навигацијом, доследним размацима и чистом типографијом.
          </p>

          {/* One-click downloads */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={handlePdfDownload}
              className="h-14 gap-3 px-8 text-base font-semibold shadow-lg shadow-primary/20"
            >
              <Download className="h-5 w-5" />
              Преузми PDF
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDocxDownload}
              className="h-14 gap-3 px-8 text-base font-semibold"
            >
              <FileText className="h-5 w-5" />
              Преузми DOCX
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Један клик · без регистрације · спремно за штампу
          </p>
        </div>
      </section>

      {/* Word of the day */}
      <WordOfTheDay />

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {TOTAL_ENTRIES.toLocaleString("sr-Cyrl")}
              </div>
              <div className="text-sm text-muted-foreground">одредница</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">28</div>
              <div className="text-sm text-muted-foreground">слова азбуке</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">271</div>
              <div className="text-sm text-muted-foreground">страна</div>
            </div>
          </Card>
        </div>
      </section>

      {/* Alphabet */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="mb-2 text-center font-serif text-2xl font-semibold">
          Азбука речника
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Кликни на слово да отвориш одреднице
        </p>
        <div className="grid grid-cols-7 gap-2 sm:grid-cols-10 md:grid-cols-14">
          {ALPHABET.map((letter) => {
            const count = recnik.stats[letter] ?? 0;
            return (
              <Link
                key={letter}
                to={`/recnik/${letter}`}
                aria-label={`Отвори одреднице на слово ${letter} (${count})`}
                className="group relative flex aspect-square items-center justify-center rounded-md border border-border bg-card font-serif text-xl font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {letter}
                <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <CategoryBrowser />

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-10 text-center font-serif text-3xl font-semibold">
            Шта је ново у овом издању
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                title: "Свако слово на новој страни",
                desc: "Велики декоративни банер са почетним словом отвара свако поглавље.",
              },
              {
                title: "Доследна типографија",
                desc: "Серифни Cambria за тело текста, висећа увлака, уједначен размак између одредница.",
              },
              {
                title: "Уредна заглавља страна",
                desc: "Назив речника лево, тренутно слово десно, центрирани бројеви страна у дну.",
              },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <h3 className="mb-2 font-serif text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={handlePdfDownload}
              className="h-14 gap-3 px-10 text-base font-semibold shadow-lg shadow-primary/20"
            >
              <Download className="h-5 w-5" />
              Преузми PDF (2,7 MB)
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Заплањски Речник · Модерно дигитално издање
      </footer>
      <BackToTop />
    </main>
  );
};

export default Index;

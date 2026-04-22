import { Facebook, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  size?: "sm" | "default";
  variant?: "icon" | "full";
}

const ShareButtons = ({
  url,
  title = "Заплањски Речник",
  size = "sm",
  variant = "full",
}: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleFacebook = () => {
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}&quote=${encodeURIComponent(title)}`;
    window.open(fb, "_blank", "noopener,noreferrer,width=626,height=436");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Линк је копиран");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Грешка при копирању");
    }
  };

  if (variant === "icon") {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleFacebook}
          aria-label="Подели на Facebook-у"
          className="h-8 w-8"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          aria-label="Копирај линк"
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size={size}
        variant="outline"
        onClick={handleFacebook}
        className="gap-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white border-transparent"
      >
        <Facebook className="h-4 w-4" />
        Подели на Facebook-у
      </Button>
      <Button size={size} variant="outline" onClick={handleCopy} className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Копирано" : "Копирај линк"}
      </Button>
    </div>
  );
};

export default ShareButtons;

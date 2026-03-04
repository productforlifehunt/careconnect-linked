import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", flag: "🇺🇸" },
  { code: "zh-CN", flag: "🇨🇳" },
  { code: "zh-TW", flag: "🇹🇼" },
  { code: "ja", flag: "🇯🇵" },
  { code: "ko", flag: "🇰🇷" },
  { code: "es", flag: "🇪🇸" },
  { code: "fr", flag: "🇫🇷" },
  { code: "de", flag: "🇩🇪" },
  { code: "pt", flag: "🇧🇷" },
  { code: "hi", flag: "🇮🇳" },
  { code: "ar", flag: "🇸🇦" },
  { code: "vi", flag: "🇻🇳" },
  { code: "th", flag: "🇹🇭" },
  { code: "id", flag: "🇮🇩" },
  { code: "tl", flag: "🇵🇭" },
  { code: "ru", flag: "🇷🇺" },
  { code: "it", flag: "🇮🇹" },
] as const;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const currentFlag = LANGUAGES.find(l => l.code === currentLang)?.flag || "🌐";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={t("language.label")}>
          <span className="text-base leading-none">{currentFlag}</span>
          <span className="sr-only">{t("language.label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto bg-card border shadow-lg z-[60]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={currentLang === lang.code ? "bg-accent font-medium" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {t(`language.${lang.code}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

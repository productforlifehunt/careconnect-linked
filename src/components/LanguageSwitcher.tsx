import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { LANGUAGES as SETTING_LANGUAGES, runSettingSkill } from "@/lib/ai-dynamic-knowledge";

const LANGUAGES = SETTING_LANGUAGES;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;


  const selectLanguage = (code: string) => {
    // One write path: the "set-language" skill in ai-dynamic-knowledge.ts.
    void runSettingSkill("set-language", code);
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground hover:text-foreground" title={t("language.label")}>
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium uppercase leading-none">{(currentLang || "en").split("-")[0]}</span>
          <span className="sr-only">{t("language.label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto bg-card border shadow-lg z-[60]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => selectLanguage(lang.code)}
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

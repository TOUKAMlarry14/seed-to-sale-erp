import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { fr } from "@/i18n/fr";
import { en } from "@/i18n/en";

type Lang = "fr" | "en";
type Dict = Record<string, string>;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const dictionaries: Record<Lang, Dict> = { fr, en };
const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("agroconnect-lang") as Lang) || "fr";
    }
    return "fr";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("agroconnect-lang", l);
  };

  const t = useCallback((key: string) => dictionaries[lang][key] || dictionaries.fr[key] || key, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

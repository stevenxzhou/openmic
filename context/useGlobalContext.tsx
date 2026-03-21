"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { detectDeviceLanguage, Language, translate } from "@/lib/i18n";

type SupportedLanguage = "en" | "zh";

const initialGlobalContext = {
  language: "en" as SupportedLanguage,
  setLanguage: (nextLanguage: SupportedLanguage) => {},
  t: (key: string, replacements?: Record<string, string | number>) =>
    translate("en", key, replacements),
};

const GlobalContext = createContext(initialGlobalContext);

export { GlobalContext };

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider",
    );
  }
  return context;
};

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<Language>("en");

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("openmic_language", nextLanguage);
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) =>
      translate(language, key, replacements),
    [language],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("openmic_language") as Language | null;
    if (saved === "en" || saved === "zh") {
      setLanguageState(saved);
      return;
    }

    const detected = detectDeviceLanguage();
    setLanguageState(detected);
    localStorage.setItem("openmic_language", detected);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return (
    <GlobalContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </GlobalContext.Provider>
  );
};

"use client";
import { useEffect, useState } from "react";
import { getLang, setLang, t } from "@/lib/i18n";

export default function LangToggle() {
  const [lang, setLangState] = useState<"en" | "ur">("en");

  useEffect(() => {
    setLangState(getLang());
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ur" : "en";
    setLang(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-full text-xs font-bold border border-[#00D4AA]/30 text-[#00D4AA] bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 transition"
    >
      {t[lang].language}
    </button>
  );
}

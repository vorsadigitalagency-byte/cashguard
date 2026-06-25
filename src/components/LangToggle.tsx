"use client";
import { useEffect, useState } from "react";
import { getLang, setLang } from "@/lib/i18n";

export default function LangToggle() {
  const [lang, setLangState] = useState<"en" | "ur">("en");

  useEffect(() => {
    setLangState(getLang());
  }, []);

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ur" : "en")}
      className="bg-red-500 text-white font-bold p-2 rounded z-50 relative"
      style={{ display: 'block', minWidth: '60px' }}
    >
      LANG: {lang.toUpperCase()}
    </button>
  );
}

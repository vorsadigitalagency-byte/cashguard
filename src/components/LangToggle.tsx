"use client";
import { getLang, setLang, t } from "@/lib/i18n";

export default function LangToggle() {
  const lang = getLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ur" : "en")}
      className="px-3 py-1 rounded-full text-xs font-bold border border-[#00D4AA]/30 text-[#00D4AA] bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 transition"
    >
      {t[lang].language}
    </button>
  );
}

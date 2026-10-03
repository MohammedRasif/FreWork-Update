import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "ro", name: "Română" },
  { code: "ru", name: "Русский" },
];

function useLanguageSelection() {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ro").split("-")[0];

  const selectLanguage = (language) => {
    if (language !== currentLanguage) i18n.changeLanguage(language);
  };

  return { t, currentLanguage, selectLanguage };
}

export function LanguageMenuItems() {
  const { t, currentLanguage, selectLanguage } = useLanguageSelection();

  return (
    <>
      <DropdownMenuSeparator className="bg-[#e9e6e0]" />
      <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#617082]">
        {t("language")}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup value={currentLanguage} onValueChange={selectLanguage} aria-label={t("language")}>
        {languages.map(({ code, name }) => (
          <DropdownMenuRadioItem
            key={code}
            value={code}
            className="min-h-10 cursor-pointer rounded-lg text-[#617082] data-[state=checked]:bg-[#f7f3ec] data-[state=checked]:font-semibold data-[state=checked]:text-[#172b43] focus:bg-[#f7f3ec] focus:text-[#172b43]"
          >
            <span lang={code}>{name}</span>
            <span aria-hidden="true" className="ml-auto text-[11px] font-bold uppercase tracking-wider text-[#8b7554]">{code}</span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator className="bg-[#e9e6e0]" />
    </>
  );
}

export default function LanguageToggleButton({ className = "" }) {
  const { t, currentLanguage, selectLanguage } = useLanguageSelection();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-[#e1e5e9] bg-[#f4f5f6] p-0.5", className)}
    >
      {languages.map(({ code, name }) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-label={name}
          title={name}
          aria-pressed={currentLanguage === code}
          onClick={() => selectLanguage(code)}
          className={`flex h-9 min-w-10 items-center justify-center rounded-[9px] px-2 text-xs font-extrabold uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c88f2a] focus-visible:ring-offset-2 motion-reduce:transition-none ${currentLanguage === code ? "bg-[#172b43] text-white" : "text-[#617082] hover:bg-white hover:text-[#172b43]"}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

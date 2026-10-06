import { useTranslation } from "react-i18next";
import romanianDocument from "../../../politica_de_confidentialitate.txt?raw";
import russianDocument from "@/content/legal/privacy.ru.txt?raw";
import LegalDocument from "./LegalDocument";

export default function Privacy() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "ro";
  return (
    <LegalDocument
      text={language === "ru" ? russianDocument : romanianDocument}
      language={language}
      title={t("privacy_policy")}
      otherPage={{ href: "/termeni-si-conditii", label: t("terms_and_conditions") }}
      sectionPrefix="privacy"
    />
  );
}

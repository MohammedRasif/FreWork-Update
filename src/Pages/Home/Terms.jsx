import { useTranslation } from "react-i18next";
import romanianDocument from "../../../termeni_si_conditii.txt?raw";
import russianDocument from "@/content/legal/terms.ru.txt?raw";
import LegalDocument from "./LegalDocument";

export default function Terms() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith("ru") ? "ru" : "ro";
  return (
    <LegalDocument
      text={language === "ru" ? russianDocument : romanianDocument}
      language={language}
      title={t("terms_and_conditions")}
      otherPage={{ href: "/politica-de-confidentialitate", label: t("privacy_policy") }}
      sectionPrefix="terms"
    />
  );
}

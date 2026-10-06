import React from "react";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

function Terms() {
  const { t } = useTranslation();
  const sections = Array.from({ length: 17 }, (_, index) => {
    const number = index + 1;
    return { id: `terms-${number}`, number: String(number), title: t(`terms.${number}.title`) };
  });

  return (
    <LegalLayout
      title={t("terms_and_conditions")}
      documentTitle={t("terms.title")}
      otherPage={{ href: "/politica-de-confidentialitate", label: t("privacy_policy") }}
      sections={sections}
    >
      <section id="terms-1">
        <h2 className="text-2xl font-bold mb-3">1. {t("terms.1.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.1.text")}</p>
      </section>

      <section id="terms-2">
        <h2 className="text-2xl font-bold mb-3">2. {t("terms.2.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.2.text")}</p>
      </section>

      <section id="terms-3">
        <h2 className="text-2xl font-bold mb-3">3. {t("terms.3.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.3.text")}</p>
      </section>

      <section id="terms-4">
        <h2 className="text-2xl font-bold mb-3">4. {t("terms.4.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.4.text")}</p>
      </section>

      <section id="terms-5">
        <h2 className="text-2xl font-bold mb-3">5. {t("terms.5.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.5.text")}</p>
      </section>

      <section id="terms-6">
        <h2 className="text-2xl font-bold mb-3">6. {t("terms.6.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.6.text")}</p>
      </section>

      <section id="terms-7">
        <h2 className="text-2xl font-bold mb-3">7. {t("terms.7.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.7.text")}</p>
      </section>

      <section id="terms-8">
        <h2 className="text-2xl font-bold mb-3">8. {t("terms.8.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.8.text")}</p>
      </section>

      <section id="terms-9">
        <h2 className="text-2xl font-bold mb-3">9. {t("terms.9.title")}</h2>
        <p>{t("terms.9.text")}</p>
      </section>

      <section id="terms-10">
        <h2 className="text-2xl font-bold mb-3">10. {t("terms.10.title")}</h2>
        <p className="whitespace-pre-line">{t("terms.10.text")}</p>
      </section>

      <section id="terms-11">
        <h2 className="text-2xl font-bold mb-3">11. {t("terms.11.title")}</h2>
        <p>{t("terms.11.text")}</p>
      </section>

      <section id="terms-12">
        <h2 className="text-2xl font-bold mb-3">12. {t("terms.12.title")}</h2>
        <p>{t("terms.12.text")}</p>
      </section>

      <section id="terms-13">
        <h2 className="text-2xl font-bold mb-3">13. {t("terms.13.title")}</h2>
        <p>{t("terms.13.text")}</p>
      </section>

      <section id="terms-14">
        <h2 className="text-2xl font-bold mb-3">14. {t("terms.14.title")}</h2>
        <p>{t("terms.14.text")}</p>
      </section>

      <section id="terms-15">
        <h2 className="text-2xl font-bold mb-3">15. {t("terms.15.title")}</h2>
        <p>{t("terms.15.text")}</p>
      </section>

      <section id="terms-16">
        <h2 className="text-2xl font-bold mb-3">16. {t("terms.16.title")}</h2>
        <p className="">{t("terms.16.text")}</p>
      </section>

      <section id="terms-17">
        <h2 className="text-2xl font-bold mb-3">17. {t("terms.17.title")}</h2>
        <p>{t("terms.17.text")}</p>
      </section>
    </LegalLayout>
  );
}

export default Terms;

import React from "react";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

const Privacy = () => {
  const { t } = useTranslation();
  const sections = Array.from({ length: 13 }, (_, index) => {
    const number = index + 1;
    return {
      id: `privacy-${number}`,
      number: String(number),
      title: number === 10
        ? `${t("cookie_policy")} ${t("privacy.10.integrated")}`
        : t(`privacy.${number}.title`),
    };
  });

  return (
    <LegalLayout
      title={t("privacy_policy")}
      documentTitle={t("privacy.title")}
      otherPage={{ href: "/termeni-si-conditii", label: t("terms_and_conditions") }}
      sections={sections}
    >
        {/* 1 */}
        <section id="privacy-1">
          <h2 className="text-2xl font-bold mb-3">1. {t("privacy.1.title")}</h2>
          <p>
            Ilie Fabian – {t("privacy.1.type")}
            <br />
            {t("vat_placeholder")}
            <br />
            {t("privacy.1.address")}{t("registered_address")}
            <br />
            {t("email_address_label")}:{" "}
            <a
              href="mailto:privacy@vacanzamycost.it"
              className="text-blue-600 hover:underline"
            >
              privacy@vacanzamycost.it
            </a>
          </p>
          <p className="mt-3">{t("privacy.1.text")}</p>
        </section>

        {/* 2 */}
        <section id="privacy-2">
          <h2 className="text-2xl font-bold mb-3">2. {t("privacy.2.title")}</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            2.1 {t("privacy.2_1.title")}
          </h3>
          <p>
            {t("full_name_label")}
            <br />
            {t("email_address_label")}
            <br />
            {t("phone_number")}
            <br />
            {t("city_location")}
            <br />
            {t("privacy.2_1.list5")}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            2.2 {t("privacy.2_2.title")}
          </h3>
          <p>
            {t("business_name")}
            <br />
            {t("vat_id")}
            <br />
            {t("logo_images")}
            <br />
            {t("offer_descriptions")}
            <br />
            {t("business_contacts")}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            2.3 {t("privacy.2_3.title")}
          </h3>
          <p>
            {t("ip_address")}
            <br />
            {t("browser_type")}
            <br />
            {t("operating_system")}
            <br />
            {t("technical_statistical_cookies")}
            <br />
            {t("security_logs")}
            <br />
            {t("privacy.2_3.last")}
          </p>
        </section>

        {/* 3 */}
        <section id="privacy-3">
          <h2 className="text-2xl font-bold mb-3">3. {t("privacy.3.title")}</h2>
          <p>{t("privacy.3.intro")}</p>
          <ol className="list-decimal pl-8 mt-3 space-y-1">
            <li>{t("privacy.3.item1")}</li>
            <li>{t("privacy.3.item2")}</li>
            <li>{t("privacy.3.item3")}</li>
            <li>{t("privacy.3.item4")}</li>
            <li>{t("privacy.3.item5")}</li>
            <li>{t("privacy.3.item6")}</li>
            <li>{t("privacy.3.item7")}</li>
          </ol>
          <p className="mt-4 font-semibold">{t("privacy.3.no_sale")}</p>
        </section>

        {/* 4–9 */}
        <section id="privacy-4">
          <h2 className="text-2xl font-bold mb-3">4. {t("privacy.4.title")}</h2>
          <p className="whitespace-pre-line">{t("privacy.4.text")}</p>
        </section>

        <section id="privacy-5">
          <h2 className="text-2xl font-bold mb-3">5. {t("privacy.5.title")}</h2>
          <p className="whitespace-pre-line">{t("privacy.5.text")}</p>
        </section>

        <section id="privacy-6">
          <h2 className="text-2xl font-bold mb-3">6. {t("privacy.6.title")}</h2>
          <p className="whitespace-pre-line">{t("privacy.6.text")}</p>
        </section>

        <section id="privacy-7">
          <h2 className="text-2xl font-bold mb-3">7. {t("privacy.7.title")}</h2>
          <p className="whitespace-pre-line">{t("privacy.7.text")}</p>
        </section>

        <section id="privacy-8">
          <h2 className="text-2xl font-bold mb-3">8. {t("privacy.8.title")}</h2>
          <p className="whitespace-pre-line">{t("privacy.8.text")}</p>
        </section>

        <section id="privacy-9">
          <h2 className="text-2xl font-bold mb-3">9. {t("privacy.9.title")}</h2>
          <p className="whitespace-pre-line">{t("privacy.9.text")}</p>
        </section>

        {/* COOKIE POLICY */}
        <section id="privacy-10">
          <h2 className="text-3xl font-bold mb-6">
            {t("cookie_policy")} {t("privacy.10.integrated")}
          </h2>

          <h3 className="text-xl font-semibold mb-2">
            10.1 {t("privacy.10_1.title")}
          </h3>
          <p>{t("privacy.10_1.text")}</p>

          <h3 className="text-xl font-semibold mt-8 mb-2">
            10.2 {t("privacy.10_2.title")}
          </h3>
          <p>
            <strong>A) {t("privacy.10_2.a_title")}</strong>
            <br />
            {t("privacy.10_2.a_text")}
          </p>
          <p className="mt-4">
            <strong>B) {t("privacy.10_2.b_title")}</strong>
            <br />
            {t("privacy.10_2.b_text")}
          </p>
          <p className="mt-4">
            <strong>C) {t("privacy.10_2.c_title")}</strong>
            <br />
            {t("privacy.10_2.c_text")}
          </p>
          <p className="mt-4">
            <strong>D) {t("privacy.10_2.d_title")}</strong>
            <br />
            {t("privacy.10_2.d_text")}
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-2">
            10.3 {t("privacy.10_3.title")}
          </h3>
          <p className="whitespace-pre-line">{t("privacy.10_3.text")}</p>

          <h3 className="text-xl font-semibold mt-8 mb-2">
            10.4 {t("privacy.10_4.title")}
          </h3>
          <p className="whitespace-pre-line">{t("privacy.10_4.text")}</p>

          <h3 className="text-xl font-semibold mt-8 mb-2">
            10.5 {t("privacy.10_5.title")}
          </h3>
          <p className="whitespace-pre-line">{t("privacy.10_5.text")}</p>
        </section>

        {/* 11–13 */}
        <section id="privacy-11">
          <h2 className="text-2xl font-bold mb-3">
            11. {t("privacy.11.title")}
          </h2>
          <p className="whitespace-pre-line">{t("privacy.11.text")}</p>
        </section>

        <section id="privacy-12">
          <h2 className="text-2xl font-bold mb-3">
            12. {t("privacy.12.title")}
          </h2>
          <p className="whitespace-pre-line">{t("privacy.12.text")}</p>
        </section>

        <section id="privacy-13">
          <h2 className="text-2xl font-bold mb-3">
            13. {t("privacy.13.title")}
          </h2>
          <p className="whitespace-pre-line">{t("privacy.13.text")}</p>
        </section>
    </LegalLayout>
  );
};

export default Privacy;

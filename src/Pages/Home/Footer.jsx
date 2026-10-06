import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import BrandWordmark from "@/components/BrandWordmark";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#10243a] px-5 pb-8 pt-16 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm">
            <h2 className="text-2xl font-bold tracking-tight">
              <BrandWordmark inverse />
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/65">{t("address_line1")}<br />{t("address_line2")}</p>
            <a className="mt-3 inline-block text-sm font-medium text-white/80 hover:text-[#e4b154]" href="mailto:info@treioferte.md">{t("email_contact")}</a>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-[#e4b154]">{t("about_us")}</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
              <NavLink to="/cum-functioneaza" className="hover:text-white">{t("who_work")}</NavLink>
              <NavLink to="/pentru-agentii" className="hover:text-white">{t("for_agencies")}</NavLink>
              <NavLink to="/blog" className="hover:text-white">{t("blog")}</NavLink>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-[#e4b154]">{t("contact_us")}</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
              <NavLink to="/contact" className="hover:text-white">{t("contact_us")}</NavLink>
              <NavLink to="/agentii-verificate" className="hover:text-white">{t("agencies")}</NavLink>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>© 2026 {t("company_name")}. {t("all_rights_reserved")}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <NavLink to="/politica-de-confidentialitate" className="hover:text-white">{t("privacy_notice")}</NavLink>
            <NavLink to="/termeni-si-conditii" className="hover:text-white">{t("terms_of_service")}</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

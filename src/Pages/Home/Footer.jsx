import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-10">
  <div className="container mx-auto px-4 md:hidden">
    <div className="grid grid-cols-2 gap-10 text-start">
      {/* VacanzaMyCost.it */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-100">VacanzaMyCost.it</h3>
        <p className="text-sm text-gray-400">
          {t("address_line1")} <br />
          {t("address_line2")}
        </p>
        <p className="text-sm text-gray-400">{t("email")}</p>
      </div>

      {/* About Us */}
      <div className="space-y-2 pl-10">
        <h3 className="text-2xl font-bold text-gray-100">{t("about_us")}</h3>
        <div className="space-y-1">
          <NavLink to="/contact" className="block text-gray-400 hover:text-white text-sm">
            {t("contact_us")}
          </NavLink>
          <NavLink to="/membership" className="block text-gray-400 hover:text-white text-sm">
            {t("agencies")}
          </NavLink>
          <NavLink to="/blog" className="block text-gray-400 hover:text-white text-sm">
            {t("blog")}
          </NavLink>
        </div>
      </div>

      {/* Follow Us */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-100">{t("follow_us")}</h3>
        <div className="flex justify-start space-x-6 pt-3">
          <a href="#" className="text-gray-400 hover:text-white"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"> {/* Facebook */} <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg></a>
          <a href="#" className="text-gray-400 hover:text-white"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"> {/* Twitter */} <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .386.045.762.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.732-.666 1.584-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.030-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.175-.068 2.187 1.405 4.771 2.241 7.548 2.241 9.054 0 14.002-7.496 14.002-13.986 0-.214-.005-.426-.014-.637.962-.695 1.797-1.562 2.457-2.549z" /></svg></a>
          <a href="#" className="text-gray-400 hover:text-white"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"> {/* LinkedIn */} <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.026-3.058-1.866-3.058-1.865 0-2.149 1.451-2.149 2.953v5.709h-3v-11h2.861v1.527h.041c.398-.752 1.369-1.544 2.818-1.544 3.018 0 3.576 1.984 3.576 4.562v6.455z" /></svg></a>
        </div>
      </div>
    </div>
  </div>

  <div className="container mx-auto px-4 hidden md:block ">
    <div className="flex justify-between items-start container mx-auto ">
      {/* Left: Company Info */}
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-100">VacanzaMyCost.it</h3>
        <p className="text-sm text-gray-400">
          {t("address_line1")} <br />
          {t("address_line2")}
        </p>
        <p className="text-sm text-gray-400">{t("email")}</p>
      </div>

      {/* Center: Links */}
      <div className="space-y-4 ">
        <h3 className="text-3xl font-bold text-gray-100">{t("about_us")}</h3>
        <div className="space-y-2 pt-4">
          <NavLink to="/contact" className="block text-gray-400 hover:text-white text-sm">
            {t("contact_us")}
          </NavLink>
          <NavLink to="/membership" className="block text-gray-400 hover:text-white text-sm">
            {t("agencies")}
          </NavLink>
          <NavLink to="/blog" className="block text-gray-400 hover:text-white text-sm">
            {t("blog")}
          </NavLink>
        </div>
      </div>

      {/* Right: Social */}
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-100">{t("follow_us")}</h3>
        <div className="flex space-x-6 pt-4">
          <a href="#" className="text-gray-400 hover:text-white"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg></a>
          <a href="#" className="text-gray-400 hover:text-white"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .386.045.762.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.732-.666 1.584-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.030-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.175-.068 2.187 1.405 4.771 2.241 7.548 2.241 9.054 0 14.002-7.496 14.002-13.986 0-.214-.005-.426-.014-.637.962-.695 1.797-1.562 2.457-2.549z" /></svg></a>
          <a href="#" className="text-gray-400 hover:text-white"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.026-3.058-1.866-3.058-1.865 0-2.149 1.451-2.149 2.953v5.709h-3v-11h2.861v1.527h.041c.398-.752 1.369-1.544 2.818-1.544 3.018 0 3.576 1.984 3.576 4.562v6.455z" /></svg></a>
        </div>
      </div>
    </div>
  </div>

  <div className="mt-10 pt-6 border-t border-gray-800">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
        <p>© 2024 {t("company_name")}. {t("all_rights_reserved")}</p>
        <div className="flex gap-8">
          <NavLink to="/privacy" className="text-gray-400 hover:text-white font-medium">
            {t("privacy_notice")}
          </NavLink>
          <NavLink to="/terms" className="text-gray-400 hover:text-white font-medium">
            {t("terms_of_service")}
          </NavLink>
        </div>
      </div>
    </div>
  </div>
</footer>
  );
};

export default Footer;

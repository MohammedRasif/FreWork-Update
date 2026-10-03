import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPageTitle } from "@/lib/pageTitle";

const DynamicTitle = ({ pathname }) => {
  const { t, i18n } = useTranslation();

  // Set the route fallback before individual pages provide a more specific title.
  useLayoutEffect(() => {
    document.title = `TreiOferte | ${getPageTitle(pathname, t)}`;
  }, [pathname, t, i18n.language]);

  return null;
};

export default DynamicTitle;

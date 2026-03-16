import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      document.title = "Vacanza | Home";
      return;
    }

    const title = path
      .replace("/", "")
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    document.title = `Vacanza | ${title}`;
  }, [location]);

  return null;
};

export default DynamicTitle;
import { StrictMode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.jsx";
import { store } from "./redux/sotre.js";
import { Provider } from "react-redux";
import "../i18n.js";
import CookieBanner from "./components/CookieBanner";
import DynamicTitle from "./routes/DynamicTitle.jsx";

const subscribeToRoute = (onChange) => router.subscribe(onChange);
const getPathname = () => router.state.location.pathname;

function RouteMetadata() {
  const pathname = useSyncExternalStore(subscribeToRoute, getPathname, getPathname);
  return <DynamicTitle pathname={pathname} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <RouteMetadata />
      <CookieBanner />
    </Provider>
  </StrictMode>,
);

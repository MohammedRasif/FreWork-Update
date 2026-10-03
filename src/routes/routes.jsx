import { createBrowserRouter, Navigate, useLocation, useParams } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home/Home";
import Registration from "../Pages/Authentication/Registration";
import Login from "../Pages/Authentication/Login";
import EmailVerification from "../Pages/Authentication/EmailVerification";
import OTP_Verification from "../Pages/Authentication/OTP_Verification";
import ResetPassword from "../Pages/Authentication/ResetPassword";
import AdminHome from "../Layout/Admin/AdminHome";
import UserDashboardLayout from "../Layout/User/UserDashboardLayout";
import Membership from "@/Pages/Home/Membership";
import Pricing from "@/Pages/Home/Pricing";
import AdminProfile from "../Layout/Admin/AdminProfile";
import ChatInterface from "../Layout/User/ChatInterface";
import UserProfile from "../Layout/User/UserProfile";
import UserEditProfile from "@/Layout/User/UserEditProfile";
import Messages from "@/Layout/User/Messages";
import AdminProfileEdit from "../Layout/Admin/AdminProfileEdit";
import AdminPricing from "@/Layout/Admin/AdminPricing";
import AdminNotification from "@/Layout/Admin/AdminNotification";
import TourPlan from "@/Pages/Home/TourPlan";
import Contact from "@/Pages/Home/Contact";
import AdminDashboardLayout from "@/Layout/Admin/AdminDashboardLayout";
import HomeLayout from "@/Layout/User";
import CreatedPlan from "@/Layout/User/CreatedPlan";
import PublishedPlan from "@/Layout/User/PublishedPlan";
import CreatePlan from "@/Layout/User/CreatePlan";
import Favorite from "@/Layout/User/Favorite";
import UserAccepte from "@/Layout/User/UserAccepte";
import SinglePost from "@/Pages/SinglePost/SinglePost";
import ViewAllPost from "@/Pages/ViewAllPost/ViewAllPost";
import PrivateRoute from "./PrivetRoute";
import SubscriptionSuccess from "@/Pages/Home/SubscriptionSuccess";
import TourPlanDouble from "@/Pages/Home/TourPlanDouble";
import AcceptedOffers from "@/Pages/Home/AcceptedOffers";
import Blog from "@/Pages/Home/Blog";
import BlogDetails from "@/Pages/Home/BlogDetails";
import Privacy from "@/Pages/Home/Privacy";
import Terms from "@/Pages/Home/Terms";
import WhoItWork from "@/Pages/Home/WhoItWork";
import PendingForAdmin from "@/Pages/Home/PanndingForAdmin";

const legacyPaths = [
  ["/agenzie-certificate", "/agentii-verificate"],
  ["/per-agenzie", "/pentru-agentii"],
  ["/crea-richiesta", "/creeaza-cerere"],
  ["/richieste", "/cereri"],
  ["/richieste/:id", "/cereri/:id"],
  ["/offerte-accettate", "/oferte-acceptate"],
  ["/contatti", "/contact"],
  ["/tutte-le-richieste", "/toate-cererile"],
  ["/come-funziona", "/cum-functioneaza"],
  ["/privacy-policy", "/politica-de-confidentialitate"],
  ["/termini-e-condizioni", "/termeni-si-conditii"],
  ["/registrazione", "/inregistrare"],
  ["/login", "/autentificare"],
  ["/registrazione-completata", "/inregistrare-finalizata"],
  ["/verifica-account", "/verificare-cont"],
  ["/verifica-otp", "/verificare-otp"],
  ["/recupero-password", "/resetare-parola"],
  ["/successo", "/succes"],
  ["/in-attesa", "/in-asteptare"],
  ["/admin", "/agentie"],
  ["/admin/dashboard", "/agentie/dashboard"],
  ["/admin/profilo", "/agentie/profil"],
  ["/admin/modifica-profilo", "/agentie/modifica-profil"],
  ["/admin/gestione-abbonamento", "/agentie/abonament"],
  ["/admin/notifiche", "/agentie/notificari"],
  ["/admin/chat", "/agentie/mesaje"],
  ["/admin/chat/:id", "/agentie/mesaje/:id"],
  ["/user", "/cont"],
  ["/user/dashboard", "/cont/dashboard"],
  ["/user/richieste-pubblicate", "/cont/cereri-publicate"],
  ["/user/richieste-accettate", "/cont/cereri-acceptate"],
  ["/user/preferiti", "/cont/favorite"],
  ["/user/chat", "/cont/mesaje"],
  ["/user/chat/:id", "/cont/mesaje/:id"],
  ["/user/profilo", "/cont/profil"],
  ["/user/crea-richiesta", "/cont/creeaza-cerere"],
  ["/user/modifica-richiesta", "/cont/modifica-cerere"],
  ["/user/notification", "/cont/notificari"],
  ["/user/modifica-profilo", "/cont/modifica-profil"],
];

function LegacyRedirect({ to }) {
  const params = useParams();
  const { search, hash } = useLocation();
  const pathname = to.replace(/:([a-z]+)/gi, (_, key) => params[key] ?? "");
  return <Navigate to={{ pathname, search, hash }} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <Navigate to="/" replace />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogDetails /> },
      { path: "/agentii-verificate", element: <Membership /> },
      { path: "/pentru-agentii", element: <Pricing /> },
      { path: "/creeaza-cerere", element: <TourPlan /> },
      { path: "/cereri", element: <TourPlanDouble /> },
      { path: "/cereri/:slug", element: <SinglePost /> },
      { path: "/oferte-acceptate", element: <AcceptedOffers /> },
      { path: "/contact", element: <Contact /> },
      { path: "/toate-cererile", element: <ViewAllPost /> },
      { path: "/cum-functioneaza", element: <WhoItWork /> },
      { path: "/politica-de-confidentialitate", element: <Privacy /> },
      { path: "/termeni-si-conditii", element: <Terms /> },
    ],
  },

  {
    path: "/agentie",
    element: <PrivateRoute><AdminDashboardLayout /></PrivateRoute>,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "dashboard", element: <AdminHome /> },
      { path: "profil", element: <AdminProfile /> },
      { path: "modifica-profil", element: <AdminProfileEdit /> },
      { path: "abonament", element: <AdminPricing /> },
      { path: "notificari", element: <AdminNotification /> },
      {
        path: "mesaje",
        element: <ChatInterface />,
        children: [
          {
            path: ":id",
            element: <Messages />,
          },
        ],
      },
    ],
  },

  {
    path: "/cont",
    element: <PrivateRoute><UserDashboardLayout /></PrivateRoute>,
    children: [
      { index: true, element: <HomeLayout><CreatedPlan /></HomeLayout> },
      { path: "dashboard", element: <HomeLayout><CreatedPlan /></HomeLayout> },
      { path: "cereri-publicate", element: <HomeLayout><PublishedPlan /></HomeLayout> },
      { path: "cereri-acceptate", element: <HomeLayout><UserAccepte /></HomeLayout> },
      { path: "favorite", element: <HomeLayout><Favorite /></HomeLayout> },
      {
        path: "mesaje",
        element: <ChatInterface />,
        children: [{ path: ":id", element: <Messages /> }],
      },
      { path: "profil", element: <UserProfile /> },
      { path: "creeaza-cerere", element: <CreatePlan /> },
      { path: "modifica-cerere", element: <CreatePlan /> },
      { path: "notificari", element: <AdminNotification /> },
      { path: "modifica-profil", element: <UserEditProfile /> },
    ],
  },

  { path: "/inregistrare", element: <Registration /> },
  { path: "/autentificare", element: <Login /> },
  { path: "/inregistrare-finalizata", element: <SubscriptionSuccess /> },
  { path: "/verificare-cont", element: <EmailVerification /> },
  { path: "/verificare-otp", element: <OTP_Verification /> },
  { path: "/resetare-parola", element: <ResetPassword /> },
  { path: "/succes", element: <SubscriptionSuccess /> },
  { path: "/in-asteptare", element: <PendingForAdmin /> },
  ...legacyPaths.map(([path, to]) => ({
    path,
    element: <LegacyRedirect to={to} />,
  })),
]);

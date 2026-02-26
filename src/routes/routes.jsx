import { createBrowserRouter, Navigate } from "react-router-dom";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <Navigate to="/" replace />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:id", element: <BlogDetails /> },
      { path: "/abbonamenti-agenzie", element: <Membership /> },
      { path: "/prezzi-agenzie", element: <Pricing /> },
      { path: "/crea-richiesta", element: <TourPlan /> },
      { path: "/richieste", element: <TourPlanDouble /> },
      { path: "/offerte-accettate", element: <AcceptedOffers /> },
      { path: "/contatti", element: <Contact /> },
      { path: "/tutte-le-richieste", element: <ViewAllPost /> },
      { path: "/come-funziona", element: <WhoItWork /> },
      { path: "/privacy-policy", element: <Privacy /> },
      { path: "/termini-e-condizioni", element: <Terms /> },
    ],
  },

  {
    path: "/admin",
    element: <PrivateRoute><AdminDashboardLayout /></PrivateRoute>,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "dashboard", element: <AdminHome /> },
      { path: "profilo", element: <AdminProfile /> },
      { path: "modifica-profilo", element: <AdminProfileEdit /> },
      { path: "gestione-abbonamento", element: <AdminPricing /> },
      { path: "notifiche", element: <AdminNotification /> },
      {
        path: "chat", 
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
    path: "/user",
    element: <PrivateRoute><UserDashboardLayout /></PrivateRoute>,
    children: [
      {
        index: true,
        path: "",
        element: (
          <HomeLayout>
            <CreatedPlan />
          </HomeLayout>
        ),
      }, 
      {
        index: true,
        path: "richieste-pubblicate",
        element: (
          <HomeLayout>
            <PublishedPlan />
          </HomeLayout>
        ),
      }, 
      {
        index: true,
        path: "richieste-accettate",
        element: (
          <HomeLayout>
            <UserAccepte />
          </HomeLayout>
        ),
      },
      {
        index: true,
        path: "preferiti",
        element: (
          <HomeLayout>
            <Favorite />
          </HomeLayout>
        ),
      },
    ],
  },

  { path: "/registrazione", element: <Registration /> },
  { path: "/login", element: <Login /> },
  { path: "/registrazione-completata", element: <SubscriptionSuccess /> },
  { path: "/verifica-account", element: <EmailVerification /> },
  { path: "/verifica-otp", element: <OTP_Verification /> },
  { path: "/recupero-password", element: <ResetPassword /> },
  { path: "/successo", element: <SubscriptionSuccess /> },
  { path: "/in-attesa", element: <PendingForAdmin /> },
  {
    path: "/user",
    element: <UserDashboardLayout />,
    children: [
      { index: true, element: <HomeLayout /> },
      { path: "dashboard", element: <HomeLayout /> },
      {
        path: "chat", 
        element: <ChatInterface />,
        children: [
          {
            path: ":id",
            element: <Messages />,
          },
        ],
      },
      { path: "profilo", element: <UserProfile /> },
      { path: "crea-richiesta", element: <CreatePlan /> },
      { path: "modifica-richiesta", element: <CreatePlan /> },
      { path: "notification", element: <AdminNotification /> },
      { path: "modifica-profilo", element: <UserEditProfile /> },
    ],
  },

  
  { path: `/richieste/:id`, element: <SinglePost /> },
  { path: "/registrazione", element: <Registration /> },
  { path: "/login", element: <Login /> },
  { path: "/verifica-account", element: <EmailVerification /> },
  { path: "/verifica-otp", element: <OTP_Verification /> },
  { path: "/recupero-password", element: <ResetPassword /> },
]);

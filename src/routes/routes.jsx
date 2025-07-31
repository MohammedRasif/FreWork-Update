import { createBrowserRouter } from "react-router-dom";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/membership", element: <Membership /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/tourPlan", element: <TourPlan /> },
      { path: "/contact", element: <Contact /> },
      { path: "/viewall", element: <ViewAllPost /> },
    ],
  },

  {
    path: "/admin",
    element: <PrivateRoute><AdminDashboardLayout /></PrivateRoute>,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "dashboard", element: <AdminHome /> },
      { path: "profile", element: <AdminProfile /> },
      { path: "editProfile", element: <AdminProfileEdit /> },
      { path: "membership", element: <AdminPricing /> },
      { path: "admin_notification", element: <AdminNotification /> },
      {
        path: "chat", // Changed from "user" to "chat" to avoid repetition
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
      }, // Default route for /user (maps to /user/)
      {
        index: true,
        path: "published",
        element: (
          <HomeLayout>
            <PublishedPlan />
          </HomeLayout>
        ),
      }, // Default route for /user (maps to /user/)
      {
        index: true,
        path: "accepted",
        element: (
          <HomeLayout>
            <UserAccepte />
          </HomeLayout>
        ),
      },
      {
        index: true,
        path: "favourite",
        element: (
          <HomeLayout>
            <Favorite />
          </HomeLayout>
        ),
      },
    ],
  },

  { path: "/register", element: <Registration /> },
  { path: "/login", element: <Login /> },
  { path: "/Successfully", element: <SubscriptionSuccess /> },
  { path: "/verify", element: <EmailVerification /> },
  { path: "/otp_verify", element: <OTP_Verification /> },
  { path: "/reset_password", element: <ResetPassword /> },
  {
    path: "/user",
    element: <UserDashboardLayout />,
    children: [
      { index: true, element: <HomeLayout /> },
      { path: "dashboard", element: <HomeLayout /> },
      {
        path: "chat", // Changed from "user" to "chat" to avoid repetition
        element: <ChatInterface />,
        children: [
          {
            path: ":id",
            element: <Messages />,
          },
        ],
      },
      { path: "profile", element: <UserProfile /> },
      { path: "CreatePlan", element: <CreatePlan /> },
      { path: "editCreatePlan", element: <CreatePlan /> },
      { path: "notification", element: <AdminNotification /> },
      { path: "editProfile", element: <UserEditProfile /> },
    ],
  },

  // make it private
  { path: `/tour-plans/:id`, element: <SinglePost /> },
  { path: "/register", element: <Registration /> },
  { path: "/login", element: <Login /> },
  { path: "/verify", element: <EmailVerification /> },
  { path: "/otp_verify", element: <OTP_Verification /> },
  { path: "/reset_password", element: <ResetPassword /> },
]);

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://endlessly-unified-guppy.ngrok-free.app",
    prepareHeaders: (header) => {
      header.set("ngrok-skip-browser-warning", "true");
      return header;
    },
  }),

  tagTypes: [],
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/normal_signup/",
        method: "POST",
        body: userData,
      }),
    }),
    logIn: builder.mutation({
      query: (loginData) => ({
        url: "/auth/login/",
        method: "POST",
        body: loginData,
      }),
    }),
    otpVerify: builder.mutation({
      query: (otpData) => ({
        url: "/auth/verify_otp/",
        method: "POST",
        body: otpData,
      }),
    }),
    reSendOtp: builder.mutation({
      query: (email) => ({
        url: "/auth/resend_otp/",
        method: "POST",
        body: email,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password/",
        method: "POST",
        body: email,
      }),
    }),
    // agency
    getAllAgency: builder.query({
      query: () => "/public/agencies/",
    }),
    getTopAgency: builder.query({
      query: () => "/public/top-agencies/",
    }),
    searchAgency: builder.query({
      query: (search) => `public/agencies/?search=${search}`,
    }),
    // tour plan
    getTourPlanPublic: builder.query({
      query: () => `/public/tour-plans/`,
    }),
    filterTourPlanPublic: builder.query({
      query: (query) =>
        `/public/tour-plans?search=${query.search}&min_budget=${query.min}&max_budget=${query.max}&country=${query.country}&type=${query.type}&category=${query.category}`,
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useLogInMutation,
  useOtpVerifyMutation,
  useReSendOtpMutation,
  useVerifyEmailMutation,
  useUpdatePasswordMutation,
  // agency
  useGetAllAgencyQuery,
  useGetTopAgencyQuery,
  useSearchAgencyQuery,
  // tour plan
  useFilterTourPlanPublicQuery,
  useGetTourPlanPublicQuery,
} = baseApi;

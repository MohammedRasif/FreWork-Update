import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://well-anteater-happy.ngrok-free.app/",
    //baseUrl: "https://api.vacanzamycost.com/",
     baseUrl: "http://31.97.39.215/",
    
    // prepareHeaders: (headers) => {
    //   headers.set("ngrok-skip-browser-warning", "true");
    //   return headers;
    // },
  }),
  tagTypes: ["User", "Agency", "TourPlan"],
  endpoints: (builder) => ({
    // User-related mutations
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/normal_signup/",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"], 
    }),
    logIn: builder.mutation({
      query: (loginData) => ({
        url: "/auth/login/",
        method: "POST",
        body: loginData,
      }),
      invalidatesTags: ["User"], 
    }),
    otpVerify: builder.mutation({
      query: (otpData) => ({
        url: "/auth/verify_otp/",
        method: "POST",
        body: otpData,
      }),
      invalidatesTags: ["User"], 
    }),
    reSendOtp: builder.mutation({
      query: (email) => ({
        url: "/auth/resend_otp/",
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"], 
    }),
    verifyEmail: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password/",
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"], 
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/reset-password/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"], 
    }),
    // Agency-related queries
    getAllAgency: builder.query({
      query: () => "/public/agencies/",
      providesTags: ["Agency"], 
    }),
    getTopAgency: builder.query({
      query: () => "/public/top-agencies/",
      providesTags: ["Agency"], 
    }),
    searchAgency: builder.query({
      query: (search) => `/public/agencies/?search=${search}`,
      providesTags: ["Agency"], 
    }),
   
    filterTourPlanPublic: builder.query({
      query: (query) =>
        `/public/tour-plans/?search=${query.search}&min_budget=${query.min}&max_budget=${query.max}&country=${query.country}&type=${query.type}&category=${query.category}`,
      providesTags: ["TourPlan"], 
    }),

    AcceptedAllOffers: builder.query({
      query: () => "/public/completed-tour-plans",
      providesTags: ["Offer"],
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
  // Agency
  useGetAllAgencyQuery,
  useGetTopAgencyQuery,
  useSearchAgencyQuery,
  // Tour Plan
  useFilterTourPlanPublicQuery,
  useAcceptedAllOffersQuery,
} = baseApi;
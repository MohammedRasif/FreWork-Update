import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { data } from "react-router-dom";

export const sqQuery = createApi({
  reducerPath: "sqQuery",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://endlessly-unified-guppy.ngrok-free.app",
    prepareHeaders: (headers, { endpoint }) => {
      headers.set("ngrok-skip-browser-warning", "true");

      // ✅ Skip token for public endpoints
      const publicEndpoints = ["getOneDetail", "getTourPlanPublic"];
      if (!publicEndpoints.includes(endpoint)) {
        const token = localStorage.getItem("access_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return headers;
    },
  }),

  tagTypes: [
    "TourPlan",
    "TouristProfile",
    "AgencyProfile",
    "Subscription",
    "Offer",
    "AcceptedOffer",
    "FavoriteAgency",
    "Review",
    "Notification",
    "Chat",
    "UserProfile",
    "Discount",
  ],
  endpoints: (builder) => ({
    newPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserProfile"],
    }),
    getTuristProfile: builder.query({
      query: () => "/tourist/profile/",
      providesTags: ["TouristProfile"],
    }),
    updateTuristProfile: builder.mutation({
      query: (data) => ({
        url: "/tourist/profile/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["TouristProfile"],
    }),

    // plans
    getPlans: builder.query({
      query: () => "/tour-plans/",
      providesTags: ["TourPlan"],
    }),

    // showSubscription data
    showSubscriptionData: builder.query({
      query: () => "subscriptions/plans/",
      providesTags: ["Subscription"],
    }),

    createPlanOne: builder.mutation({
      query: (data) => ({
        url: "/tour-plans/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TourPlan"],
    }),
    updatePlan: builder.mutation({
      query: (data) => ({
        url: `/tour-plans/${data.id}/`,
        method: "PATCH",
        body: data.updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "TourPlan", id }, "TourPlan"],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/tour-plans/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "TourPlan", id }, "TourPlan"],
    }),
    getOneDetail: builder.query({
      query: (id) => `/tour-plans/${id}/`,
      providesTags: (result, error, id) => [{ type: "TourPlan", id }],
    }),
    // agency profile
    getAgencyProfile: builder.query({
      query: () => `/agency/profile/`,
      providesTags: ["AgencyProfile"],
    }),
    updateAgencyProfile: builder.mutation({
      query: (data) => ({
        url: "/agency/profile/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AgencyProfile"],
    }),
    // like
    likePost: builder.mutation({
      query: (int) => ({
        url: `/tour-plans/${int.id}/interact/`,
        method: "POST",
        body: int.data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "TourPlan", id }, "TourPlan"],
    }),
    // offer a budget
    offerBudget: builder.mutation({
      query: ({ id, data }) => ({
        url: `/offers/${id}/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Offer"],
    }),
    acceptOffer: builder.mutation({
      query: (id) => ({
        url: `/offers/${id}/accept/`,
        method: "POST",
      }),
      invalidatesTags: ["Offer", "AcceptedOffer"],
    }),
    getAllacceptedOffer: builder.query({
      query: () => "/accepted-offers/",
      providesTags: ["AcceptedOffer"],
    }),
    // add to favorite
    addToFavorit: builder.mutation({
      query: (id) => ({
        url: `/agencies/${id}/favorite/`,
        method: "POST",
      }),
      invalidatesTags: ["FavoriteAgency"],
    }),
    allFavoritAgency: builder.query({
      query: () => `/tourist/favorite-agencies/`,
      providesTags: ["FavoriteAgency"],
    }),
    // give review
    giveReview: builder.mutation({
      query: (data) => ({
        url: `/review/plan/${data.agency_id}/`,
        method: "POST",
        body: { comment: data.comment, rating: data.rating },
      }),
      invalidatesTags: ["Review"],
    }),
    getOfferedPlan: builder.query({
      query: () => "/offers/",
      providesTags: ["Offer"],
    }),
    getOneTourPlan: builder.query({
      query: (id) => `/tour-plans/${id}/`,
      providesTags: (result, error, id) => [{ type: "TourPlan", id }],
    }),
    // notifications
    getNotifications: builder.query({
      query: () => `/notifications/`,
      providesTags: ["Notification"],
    }),
    // chats
    inviteToChat: builder.mutation({
      query: (data) => ({
        url: `/chat/start/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),

    // subscription
    subscription: builder.mutation({
      query: (data) => ({
        url: "subscriptions/create-checkout-session/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),

    // publicis response
    getPublicisResponse: builder.query({
      query: (id) => `/agency_details/${id}/`,
      providesTags: (result, error, id) => [{ type: "AgencyProfile", id }],
    }),

    getChatList: builder.query({
      query: () => "/chat/conversations/",
      providesTags: ["Chat"],
    }),

    getChatHsitory: builder.query({
      query: (id) => `/chat/conversations/${id}/messages/`,
      providesTags: (result, error, id) => [{ type: "Chat", id }],
    }),

    showUserInpormation: builder.query({
      query: () => "/auth/user_profile/",
      providesTags: ["UserProfile"],
    }),
    // all about discount
    askForDiscount: builder.mutation({
      query: ({ planid, chatid }) => ({
        url: `/chat/conversations/${chatid}/request-discount/`,
        method: "POST",
        body: { tour_plan_id: planid },
      }),
      invalidatesTags: ["Discount", "Chat"],
    }),
    offerDiscount: builder.mutation({
      query: ({ id, data }) => ({
        url: `/chat/conversations/${id}/offer-discount/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Discount", "Chat"],
    }),
    finalOffer:builder.mutation({
      query:({id,data})=>({
        url:`/chat/conversations/${id}/send-final-offer/`,
        method:"POST",
        body:data
      })
    }),
    acceptFinalOffer:builder.mutation({
      query:({id,data})=>({
        url:`/chat/conversations/${id}/accept-final-offer/`,
        method:"POST",
        body:data
      })
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserProfile"],
    }),
  }),
});

export const {
  useNewPasswordMutation,
  useGetTuristProfileQuery,
  useUpdateTuristProfileMutation,
  // plans
  useGetPlansQuery,
  useCreatePlanOneMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useGetOneDetailQuery,
  // agency profile
  useGetAgencyProfileQuery,
  useUpdateAgencyProfileMutation,
  // int
  useLikePostMutation,
  // offer
  useOfferBudgetMutation,
  useAcceptOfferMutation,
  useGetAllacceptedOfferQuery,
  // favorite
  useAddToFavoritMutation,
  useAllFavoritAgencyQuery,
  // review
  useGiveReviewMutation,
  // show subscription data
  useShowSubscriptionDataQuery,
  // Subscription
  useSubscriptionMutation,
  // publicis response
  useGetPublicisResponseQuery,

  useGetOfferedPlanQuery,
  useGetOneTourPlanQuery,
  // notifications
  useGetNotificationsQuery,
  // chat
  useInviteToChatMutation,
  useGetChatListQuery,
  useGetChatHsitoryQuery,
  // show user information
  useShowUserInpormationQuery,
  // discount
  useAskForDiscountMutation,
  useOfferDiscountMutation,
  useFinalOfferMutation,
  useAcceptFinalOfferMutation,

  // change password
  useChangePasswordMutation,
} = sqQuery;
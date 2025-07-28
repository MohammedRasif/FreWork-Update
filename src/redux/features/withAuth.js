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

tagTypes: ["TourPlan"],
  endpoints: (builder) => ({
    newPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password/",
        method: "POST",
        body: data,
      }),
    }),
    getTuristProfile: builder.query({
      query: () => "/tourist/profile/",
    }),
    updateTuristProfile: builder.mutation({
      query: (data) => ({
        url: "/tourist/profile/",
        method: "PATCH",
        body: data,
      }),
    }),




    // plans
    getPlans: builder.query({
      query: () => "/tour-plans/",
      providesTags: ["TourPlan"],
    }),

    // showSubscription data
    showSubscriptionData: builder.query({
      query:() =>"subscriptions/plans/"
    }),







    createPlanOne: builder.mutation({
      query: (data) => ({
        url: "/tour-plans/",
        method: "POST",
        body: data,
      }),
    }),
    updatePlan: builder.mutation({
      query: (data) => ({
        url: `/tour-plans/${data.id}/`,
        method: "PATCH",
        body: data.updates,
      }),
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/tour-plans/${id}/`,
        method: "DELETE",
      }),
    }),
    getOneDetail: builder.query({
      query: (id) => `/tour-plans/${id}/`,
      
    }),
    // agency profile
    getAgencyProfile: builder.query({
      query: () => `/agency/profile/`,
    }),
    updateAgencyProfile: builder.mutation({
      query: (data) => ({
        url: "/agency/profile/",
        method: "PATCH",
        body: data,
      }),
    }),
    // like
    likePost: builder.mutation({
      query: (int) => ({
        url: `/tour-plans/${int.id}/interact/`,
        method: "POST",
        body: int.data,
      }),
    }),
    // offer a budget
    offerBudget: builder.mutation({
      query: ({ id, data }) => ({
        url: `/offers/${id}/`,
        method: "POST",
        body: data,
      }),
    }),
    acceptOffer: builder.mutation({
      query: (id) => ({
        url: `/offers/${id}/accept/`,
        method: "POST",
      }),
    }),
    getAllacceptedOffer: builder.query({
      query: () => "/accepted-offers/",
    }),
    // add to favorite
    addToFavorit: builder.mutation({
      query: (id) => ({
        url: `/agencies/${id}/favorite/`,
        method: "POST",
      }),
    }),
    allFavoritAgency: builder.query({
      query: () => `/tourist/favorite-agencies/`,
    }),
    // give review
    giveReview: builder.mutation({
      query: (data) => ({
        url: `/review/plan/${data.agency_id}/`,
        method: "POST",
        body: { comment: data.comment, rating: data.rating },
      }),
    }),
    getOfferedPlan: builder.query({
      query:() => "/offers/"
    }),
    getOneTourPlan: builder.query({
      query: (id) => `/tour-plans/${id}/`,
    }),
    //notifications
    getNotifications: builder.query({
      query: () => `/notifications/`,
    }),
    // chats
    inviteToChat: builder.mutation({
      query: (data) => ({
        url: `/chat/start/`,
        method: "POST",
        body: data,
      }),
    }),

    // subscription 
    subscription: builder.mutation({
      query: (data) => ({
        url: "subscriptions/create-checkout-session/",
        method: "POST",
        body: data,
      }),
    }),

    //publicis response
    getPublicisResponse: builder.query({
      query: (id) => `/agency_details/${id}/`,
    }),





    getChatList: builder.query({
      query: () => "/chat/conversations/",
    }),
    
    getChatHsitory: builder.query({
      query: (id) => `/chat/conversations/${id}/messages/`,
    }),


    showUserInpormation: builder.query({
      query: () => "/auth/user_profile/"
    }),
    // all about discount
    askForDiscount: builder.mutation({
      query: ({ planid, chatid }) => ({
        url: `/chat/conversations/${chatid}/request-discount/`,
        method: 'POST',
        body: { tour_plan_id: planid },
      }),
    }),
    offerDiscount:builder.mutation({
      query:({id,data})=>({
        url:`/chat/conversations/${id}/offer-discount/`,
        method:"POST",
        body:data
      })
    }),


    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password/",
        method: "POST",
        body: data,
      })
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
  //review
  useGiveReviewMutation,
  // show subscrition data
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

  // change password
  useChangePasswordMutation,
} = sqQuery;

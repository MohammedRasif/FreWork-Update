import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./features/baseApi";
import { sqQuery } from "./features/withAuth";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [sqQuery.reducerPath]: sqQuery.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(sqQuery.middleware),
});

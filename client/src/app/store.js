import { configureStore } from "@reduxjs/toolkit";
import { authApi } from '../features/api/authApi';
import rootReducer from "./rootReducer";
import { logout } from '../features/authSlice';

export const appStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

const initializeApp = async () => {
  try {
    const result = await appStore.dispatch(authApi.endpoints.loadUser.initiate(undefined, { forceRefetch: true }));
    if (result.error) {
      appStore.dispatch(logout());
    }
  } catch (error) {
    appStore.dispatch(logout());
  }
};

initializeApp();
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  authUser: null,
  credentials: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setAuthUser(state, action) {
      state.authUser = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.authUser = null;
      state.credentials = null;
    },

    // ✅ Store credentials for later use
    setCredentials(state, action) {
      state.credentials = action.payload;
    },

    // ✅ ADD THIS
    markProfileCompleted(state) {
      if (!state.user?.data?.user) return;

      state.user.data.user.isProfileCompleted = true;

      // 🔥 IMPORTANT: currentStep is meaningless after completion
      state.user.data.user.currentStep = null;
    },

    // ✅ Update the current step in Redux
    updateCurrentStep(state, action) {
      if (!state.user?.data?.user) return;
      state.user.data.user.currentStep = action.payload;
    },
  },
});

export const {
  setUser,
  setAuthUser,
  clearUser,
  markProfileCompleted,
  updateCurrentStep,
  setCredentials
} = userSlice.actions;

export default userSlice.reducer;

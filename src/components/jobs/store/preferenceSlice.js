import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  preferenceData: null,
};

const preferenceSlice = createSlice({
  name: "preference",
  initialState,
  reducers: {
    savePreference(state, action) {
      state.preferenceData = action.payload;
    },
    clearPreference(state) {
      state.preferenceData = null;
    },
  },
});

export const { savePreference, clearPreference } = preferenceSlice.actions;
export default preferenceSlice.reducer;

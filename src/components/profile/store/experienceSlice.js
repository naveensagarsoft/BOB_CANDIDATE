import { createSlice } from '@reduxjs/toolkit';

const experienceSlice = createSlice({
  name: 'experience',
  initialState: {
    parsed: null,
    list: []  // ✅ Store API-fetched experience records
  },
  reducers: {
    setParsedExperience: (state, action) => {
      state.parsed = action.payload;
    },
    // ✅ New action to store API-fetched experience list
    setExperienceList: (state, action) => {
      state.list = action.payload;
    },
    clearParsedExperience: (state) => {
      state.parsed = null;
    },
    resetExperience: (state) => {
      state.parsed = null;
      state.list = [];
    },
    removeParsedExperienceById: (state, action) => {
      const id = action.payload;
      if (!state.parsed || !Array.isArray(state.parsed)) return;
      if (!id) return;
      const idx = state.parsed.findIndex(e => e.__tempId === id);
      if (idx === -1) return;
      state.parsed.splice(idx, 1);
    }
  }
});

export const { setParsedExperience, setExperienceList, clearParsedExperience, resetExperience, removeParsedExperienceById } = experienceSlice.actions;
export default experienceSlice.reducer;


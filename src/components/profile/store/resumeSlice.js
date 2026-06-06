import { createSlice } from '@reduxjs/toolkit';

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    parsed: null,
    list: []  // ✅ Store API-fetched education records
  },
  reducers: {
    setParsedResume: (state, action) => {
      state.parsed = action.payload;
    },
    // ✅ New action to store API-fetched education list
    setEducationList: (state, action) => {
      state.list = action.payload;
    },
    clearParsedResume: (state) => {
      state.parsed = null;
    },
    resetResume: (state) => {
      state.parsed = null;
      state.list = [];
    },
    removeParsedEducationById: (state, action) => {
      const id = action.payload;
      if (!state.parsed || !Array.isArray(state.parsed.education)) return;
      if (!id) return;
      const idx = state.parsed.education.findIndex(e => e.__tempId === id);
      if (idx === -1) return;
      state.parsed.education.splice(idx, 1);
    }
  }
});

export const { setParsedResume, setEducationList, clearParsedResume, resetResume, removeParsedEducationById } = resumeSlice.actions;
export default resumeSlice.reducer;


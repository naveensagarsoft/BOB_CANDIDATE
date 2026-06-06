import { createSlice } from '@reduxjs/toolkit';

const idProofSlice = createSlice({
  name: 'idProof',
  initialState: {
    name: '',
    dob: '',
  },
  reducers: {
    setExtractedData: (state, action) => {
      state.name = action.payload.name;
      state.dob = action.payload.dob;
      state.isNewUpload = true;
    },
    clearExtractedData: (state) => {
      state.name = "";
      state.dob = "";
      state.isNewUpload = false;
    },
    resetIdProof: (state) => {
      state.name = "";
      state.dob = "";
      state.isNewUpload = false;
    }
  },
});

export const { setExtractedData, clearExtractedData, resetIdProof } = idProofSlice.actions;
export default idProofSlice.reducer;
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../components/auth/store/userSlice';
import preferenceReducer from "../components/jobs/store/preferenceSlice";
import documentTypesReducer from '../components/profile/store/documentTypesSlice';
import idProofReducer from '../components/profile/store/idProofSlice';
import resumeReducer from '../components/profile/store/resumeSlice';
import experienceReducer from '../components/profile/store/experienceSlice';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { clearUser } from '../components/auth/store/userSlice';
import { clearPreference } from '../components/jobs/store/preferenceSlice';
import { clearDocumentTypes } from '../components/profile/store/documentTypesSlice';
import { resetIdProof } from '../components/profile/store/idProofSlice';
import { resetResume } from '../components/profile/store/resumeSlice';
import { resetExperience } from '../components/profile/store/experienceSlice';

// Persist ONLY the user slice
const userPersistConfig = {
  key: 'user',
  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,  
    preference: preferenceReducer,
    documentTypes: documentTypesReducer,
    idProof: idProofReducer,
    resume: resumeReducer,
    experience: experienceReducer,
  },
});

export const persistor = persistStore(store);

// Root reset action to clear all Redux states on logout
export const resetAllStates = () => (dispatch) => {
  dispatch(clearUser());
  dispatch(clearPreference());
  dispatch(clearDocumentTypes());
  dispatch(resetIdProof());
  dispatch(resetResume());
  dispatch(resetExperience());
};

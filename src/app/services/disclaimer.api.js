import { candidateApi } from "../../services/apiService";

// GET disclaimer status
export const getDisclaimerStatus = () => {
  // if (!candidateId) throw new Error("candidateId is required");

  return candidateApi.get(
    `/profile/get-personal-disclaimer`
  );
};

// POST disclaimer acceptance
export const saveDisclaimerStatus = (value) => {
  // if (!candidateId) throw new Error("candidateId is required");

  return candidateApi.post(
    `/profile/save-personal-disclaimer`,
    null,
    {
      params: { personalDisclaimer: value },
    }
  );
};

const disclaimerApi = {
  getDisclaimerStatus,
  saveDisclaimerStatus,
};
export default disclaimerApi;
import { mastersapi } from "./apiService";

export const getMasterData = () => {
  return mastersapi.get(`/v1/master/display/all`);
}

export const getChatFAQReply = (question) => {
  return mastersapi.get("/v1/master/chatbot/getChatFAQReply", {
    params: { question },
  });
};
export const getChatQueryReply = (question, candidateId) => {
  return mastersapi.get(`/v1/master/chatbot/getChatQueryReply`, {
    params: { question, candidateId }
  });
};


export const getDocumentTypes = () => {
  return mastersapi.get(`/v1/master/document-types/all`);
};

export const getGenericDocuments = () => {
  return mastersapi.get(
    "/v1/master/rec-generic-documents/unique-document-types"
  );
};

export const getCertifications = () => {
  return mastersapi.get(`/v1/master/certificates-master/all`);
};

// Download file API (Azure Blob proxy)
// export const downloadFile = (filePath) => {
//   if (!filePath) {
//     throw new Error("filePath is required");
//   }

//   return api.get(
//     `/v1/master/azureblob/download-file`, // ✅ FIXED
//     {
//       params: { path: filePath },
//       responseType: "blob",               // ✅ REQUIRED
//       headers: {
//         "X-Client": "candidate",
//         Accept: "*/*",              // ✅ IMPORTANT
//         "Content-Type": undefined,  // ✅ REMOVE JSON ASSUMPTION
//       }
//     }
//   );
// };
export const downloadFile = (filePath) => {
  if (!filePath) throw new Error("filePath is required");

  return mastersapi.get("/v1/master/azureblob/download-file", {
    params: { path: filePath },
    responseType: "blob",
   
  });
};


export const getSasUrl = (filePath) => {
  return mastersapi.get(`/v1/master/azureblob/file/sas-url`, {
    params: { dir: filePath },
  });
};

export const getStatesData = () => {
  return mastersapi.get(`/v1/master/zonal-states/all`);
}

export const getInterviewCentresByState = (organizationTypes, zonalStateId) => {
  return mastersapi.post(
    "/v1/master/interview-centres/search",
    {
      organizationTypes: organizationTypes,
      zonalStateId,
    },
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

export const getStateLanguages = () => {
  return mastersapi.get(`/v1/master/master-dd-data/get/state-languages`);
};

const masterApi = {
  getMasterData,
  getDocumentTypes,
  getChatFAQReply,
  getChatQueryReply,
  getGenericDocuments,
  getCertifications,
  downloadFile,
  getSasUrl,
  getStatesData,
  getInterviewCentresByState,
  getStateLanguages
};
export default masterApi;
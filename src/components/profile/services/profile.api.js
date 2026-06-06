
import { candidateApi, candidateApiMultipart, candidateApiWOContentType } from "../../../services/apiService";

// Basic Details APIs
export const getBasicDetails = () => {
  return candidateApi.get(`/profile/get-details`);
};

export const postBasicDetails = (payload) => {
  return candidateApi.post(`/profile/save-profile-details`, payload);
};

// Address Details APIs
export const getAddressDetails = () => {
  return candidateApi.get(`/address/get-address`);
};

export const postAddressDetails = (payload) => {
  return candidateApi.post(`/address/save-address`, payload);
};

// Education Details APIs
export const getEducationDetails = () => {
  return candidateApi.get(`/education/get-edu-details`);
};

export const postEducationDetails = (
  educationPayload,
  file,
  docCode
) => {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  formData.append(
    "education",
    new Blob([JSON.stringify(educationPayload)], {
      type: "application/json",
    })
  );

  return candidateApi.post(
    `/education/save-edu-details/${docCode}`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Delete Education API
export const deleteEducationDetails = (educationId) => {
  if (!educationId) {
    throw new Error("educationId is required");
  }

  return candidateApi.delete(
    `/education/delete-edu-details`,
    {
      params: { educationId },
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Experience Details APIs
export const getExperienceDetails = () => {
  return candidateApi.get(`/experience/get-exp-details`);
};

export const postExperienceDetails = (
  // candidateId,
  workExperiencePayload,
  file
) => {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  formData.append(
    "workExperience",
    new Blob([JSON.stringify(workExperiencePayload)], {
      type: "application/json",
    })
  );

  return candidateApi.post(
    `/experience/save-exp-details`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteExperienceDetails = (workExperienceId) => {
  return candidateApi.delete(
    `/experience/delete-exp/${workExperienceId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Document Details APIs
export const getDocumentDetails = () => {
  return candidateApi.get(`/documents/get-doc`);
};

export const getDocumentDetailsByCode = (docCode) => {
  return candidateApi.get(`/documents/get-doc-by-doccode/${docCode}`);
};

// Document Upload API
export const postDocumentDetails = (
  documentId,
  file,
  isOther,
  documentName,
  isValidationPending = null,
  pendingChecks = []
) => {
  if (!file) {
    throw new Error("Document file is required");
  }

  if (isOther && !documentName) {
    throw new Error("Document Name is required");
  }

  const formData = new FormData();

  // ✅ MUST match backend key
  formData.append("file", file);

  // ✅ build clean payload (NO null garbage)
  const requestPayload = {};

  if (isValidationPending !== null) {
    requestPayload.isValidationPending = isValidationPending;
  }

  if (pendingChecks && pendingChecks.length > 0) {
    requestPayload.pendingChecks = pendingChecks;
  }

  // ✅ append JSON as blob
  formData.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], {
      type: "application/json",
    })
  );

  let url = isOther
    ? `/documents/upload-other/${documentName}`
    : `/documents/upload-document/${documentId}`;

  return candidateApiWOContentType.post(url, formData, {
    headers: {
      "X-Client": "candidate",
      // ❗ DO NOT SET Content-Type
    },
  });
};

// Validate Document API
export const ValidateDocument = (
  docCode,
  file
) => {
  if (!file) {
    throw new Error("Document file is required");
  }
  if (!docCode) {
    throw new Error("Document Name is required");
  }

  const formData = new FormData();
  formData.append("file", file); // key name MUST match backend
  const Url = `/validate-document/validate-document/${docCode}`;
  return candidateApi.post(
    Url,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Document Delete API
export const deleteDocument = (documentId) => {
  if (!documentId) {
    throw new Error("documentId is required");
  }

  return candidateApi.delete(
    `/documents/delete-doc/${documentId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Resume Upload API
export const parseResumeDetails = (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  return candidateApi.post(
    `/resume/upload`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data"
        // DO NOT set Content-Type
      },
    }
  );
};

export const getResumeDetails = () => {
  return candidateApi.get(`/resume/get-resume-details`);
};

// Save All Experience Details from Resume
export const saveAllExperienceDetails = (experiencePayload) => {
  return candidateApi.post(
    `/experience/save-all-exp-details`,
    experiencePayload,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// GET work status (isFresher)
export const getWorkStatus = () => {
  return candidateApi.get(`/profile/get-work-status`, {
    headers: {
      "X-Client": "candidate",
    },
  });
};

// POST work status (isFresher)
export const postWorkStatus = (isFresher) => {
  return candidateApi.post(
    `/profile/save-work-status`,
    null,
    {
      params: { isFresher: isFresher }, // ⚠️ backend expects QUERY param
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Profile Complete API
export const saveProfileComplete = (isProfileCompleted = true) => {
  return candidateApi.post(
    `/candidate/save-profile-complete`,
    null,
    {
      params: { isProfileCompleted },
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Certification APIs
export const getHasCertification = () => {
  return candidateApi.get(
    `/certifications/get-has-cert`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Save hasCertification flag
export const saveHasCertification = (hasCertification) => {
  return candidateApi.post(
    `/certifications/save-has-cert`,
    null,
    {
      params: { hasCertification },
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

export const saveCertification = (
  // candidateId,
  certificationPayload,
  file
) => {
  const formData = new FormData();

  // file part (same as experience)
  if (file) {
    formData.append("file", file);
  }

  // DTO part (same pattern as workExperience)
  formData.append(
    "certificationsDTO",
    new Blob([JSON.stringify(certificationPayload)], {
      type: "application/json",
    })
  );

  return candidateApi.post(
    `/certifications/save-cert-details`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Get certification details
export const getCertifications = () => {
  return candidateApi.get(
    `/certifications/get-cert-details`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

// Delete certification
export const deleteCertification = (certificationId) => {
  if (!certificationId) {
    throw new Error("certificationId is required");
  }

  return candidateApi.delete(
    `/certifications/delete-cert-details/${certificationId}`,
    {
      headers: {
        "X-Client": "candidate",
      },
    }
  );
};

export const validateCertification = (certificationId, file) => {
  if (!file) {
    throw new Error("Document file is required");
  }
  if (!certificationId) {
    throw new Error("certificationId is required");
  }

  const formData = new FormData();
  formData.append("file", file);

  return candidateApiMultipart.post(
    `/validate-certification/validate/${certificationId}`,
    formData,
    {
      headers: {
        "X-Client": "candidate",
        // DO NOT SET Content-Type
      },
    }
  );
};

export const uploadIdProof = (
  documentId,
  documentNumber,
  file,
  isValidationPending = false,
  pendingChecks = []
) => {
  const formData = new FormData();

  formData.append("file", file);
  
  const requestPayload = {
    documentId,
    documentNumber
  };
  console.log(requestPayload)

  // ✅ add validation fields only when needed
  if (isValidationPending) {
    requestPayload.isValidationPending = true;
    requestPayload.pendingChecks = pendingChecks;
  } else {
    requestPayload.isValidationPending = false;
  }

  formData.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], {
      type: "application/json"
    })
  );

  return candidateApiWOContentType.post(
    `/documents/upload-idproof`,
    formData,
    {
      headers: {
        "X-Client": "candidate"
        // ❗ DO NOT SET Content-Type
      }
    }
  );
};

export const validateIdProof = (documentId, documentNumber, file) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "request",
    new Blob([JSON.stringify({
          documentId,
          documentNumber
        })], {
      type: "application/json"
    })
  );

  return candidateApi.post(
    "/validate-document/validate-id-proof-document",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Client": "candidate"
      }
    }
  );
};

const validateBirthDateProof = (file, requestPayload) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "request",
    new Blob([JSON.stringify(requestPayload)], {
      type: "application/json"
    })
  );

  return candidateApi.post(
    "/validate-document/validate-birthdate-proof-document",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Client": "candidate"
      }
    }
  );
};

export const validateWorkExperienceDocument = (payload, file) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], {
      type: "application/json",
    })
  );

  return candidateApiMultipart.post(
    "/validate-document/validate-work-exp-document",
    formData
  );
};

export const initializeDigiLocker = () => {
  return candidateApi.get("/digilocker/init", {
    headers: {
      "X-Client": "candidate"
    }
  });
};

export const initializeDigiLockerConsent = async (
  flowType = "issued",
  // scope = "PAN"
) => {
  try {
    const response = await candidateApi.get(
      "/digilocker/init",
      {
        params: {
          flowType,
          // scope
        },
        headers: {
          "X-Client": "candidate"
        }
      }
    );

    console.log("DigiLocker init response:", response.data);

    return {
      success: true,
      data: response.data,
      redirectUrl:
        response.data?.redirectUrl ||
        response.data?.data?.redirectUrl ||
        response.data?.url
    };

  } catch (err) {
    console.error("Failed to initialize DigiLocker consent", err);

    return {
      success: false,
      error: err
    };
  }
};

const profileApi = {
  getBasicDetails,
  postBasicDetails,
  getAddressDetails,
  postAddressDetails,
  getEducationDetails,
  postEducationDetails,
  deleteEducationDetails,
  getExperienceDetails,
  postExperienceDetails,
  deleteExperienceDetails,
  getDocumentDetails,
  getDocumentDetailsByCode,
  postDocumentDetails,
  deleteDocument,
  parseResumeDetails,
  getResumeDetails,
  saveAllExperienceDetails,
  getWorkStatus,
  postWorkStatus,
  ValidateDocument,
  saveProfileComplete,
  getHasCertification,
  saveHasCertification,
  saveCertification,
  getCertifications,
  deleteCertification,
  validateCertification,
  uploadIdProof,
  validateIdProof,
  validateBirthDateProof,
  validateWorkExperienceDocument,
  initializeDigiLocker,
  initializeDigiLockerConsent
};
export default profileApi;
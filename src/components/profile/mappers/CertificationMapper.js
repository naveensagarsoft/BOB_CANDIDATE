export const mapCertificationFormToApi = (
  formData,
  candidateId,
  certificateId,
  file,
  existingDocument,
  isValidationPending
) => ({
  certificateId: certificateId ?? null, // ✅ THIS decides insert vs update
  candidateId,
  issuedBy: formData.issuedBy,
  certificationName: formData.certificationName,
  certificationDate: formData.certificationDate,
  expiryDate: formData.expiryDate || null,
  certificateFileName:
    file?.name ||
    existingDocument?.fileName ||
    existingDocument?.displayName ||
    null,
  certificationId: formData.certificationMasterId,
  isValidationPending: isValidationPending,
  pendingChecks: isValidationPending ? ["document"] : null
});



export const mapCertificationApiToUi = (apiItem) => {
  const cert = apiItem?.certifications || {};
  const doc = apiItem?.documentStore || null;

  return {
    // identifiers
    certificateId: cert.certificateId,
    certificationMasterId: cert.certificationId || "",

    // certification fields
    issuedBy: cert.issuedBy || "",
    certificationName: cert.certificationName || "",
    certificationDate: cert.certificationDate || "",
    expiryDate: cert.expiryDate || "",

    // document (used for edit + preview)
    certificate: doc
      ? {
          id: doc.id,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          displayName: doc.displayName,
          uploadedDate: doc.uploadedDate,
        }
      : null,
  };
};

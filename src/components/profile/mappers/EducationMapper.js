export const mapEducationFormToApi = ({
  formData,
  candidateId,
  educationLevelId,
  educationId = null,
  isOthersSelected,
  isOtherSpecializationSelected,
  isValidationPending,
  pendingChecks
}) => {

  const isSchoolLevel = ["BOARD", "INTER"].includes(formData.educationDocCode);

  const payload = {
    isActive: true,
    candidateId,
    educationQualificationsId: formData.university,
    institutionName: formData.college,
    universityName: formData.universityName,
    specializationId: formData.specialization || null,
    educationTypeId: formData.educationType,
    startDate: formData.from,
    endDate: formData.to,
    percentage: Number(formData.percentage),
    educationId,
    isValidationPending,
    pendingChecks
  };

  if (!isSchoolLevel) {
    payload.startDate = formData.from;
  }

  if (isOthersSelected) {
    payload.otherQualification = formData.otherQualification?.trim();
  }

  if (isOtherSpecializationSelected) {
    payload.otherSpecialization = formData.otherSpecialization?.trim();
  }

  return payload;
};

export const getEducationLevelIdFromQualification = (
  educationQualificationsId,
  mandatoryQualifications = []
) => {
  if (!educationQualificationsId || !mandatoryQualifications.length) {
    return null;
  }

  const match = mandatoryQualifications.find(
    q => q.educationQualificationsId === educationQualificationsId
  );

  return match?.levelId || null;
};

export const getDocCodeFromEducationLevelId = (
  educationLevelId,
  educationLevels
) => {
  return (
    educationLevels.find(
      lvl => lvl.documentTypeId === educationLevelId
    )?.docCode || ""
  );
};

export const mapEducationApiToUi = (item, mandatoryQualifications = []) => {
  const edu = item.education;
  const doc = item.documentStore;

  const educationLevelId = getEducationLevelIdFromQualification(
    edu.educationQualificationsId,
    mandatoryQualifications
  );

  const docCode = doc ? doc.fileName.split("_")[0] : "";
  const isSchoolLevel = ["BOARD", "INTER"].includes(docCode);

  return {
    educationId: edu.educationId,
    educationLevel: educationLevelId,
    educationDocCode: doc ? doc.fileName.split("_")[0] : "",
    university: edu.educationQualificationsId,
    college: edu.institutionName,
    universityName: edu.universityName || "",
    otherQualification: edu.otherQualification || "",
    specialization: edu.specializationId || "",
    otherSpecialization: edu.otherSpecialization || "",
    educationType: edu.educationTypeId,
    // from: edu.startDate,
    from: isSchoolLevel ? "" : edu.startDate,
    to: edu.endDate,
    percentage: String(edu.percentage),
    document: doc
      ? {
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          displayName: doc.displayName
        }
      : null
  };
};

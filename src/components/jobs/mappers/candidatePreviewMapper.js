import {
  getGender,
  getReligion,
  getNationality,
  getMaritalStatus,
  getState,
  getDistrict,
  getReservation,
  getEducationLevel,
  getSpecialization,
  getMandatoryQualification
} from "../../../shared/utils/masterHelpers";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
export const mapCandidateToPreview = (
  apiData = {},
  masters = {},
  masterStates = []  // ✅ NEW: separate masterStates for address lookups
) => {
  const profile = apiData?.basicDetails?.candidateProfile || {};
  const languages = apiData?.basicDetails?.languagesKnown || [];
  const address = apiData?.addressDetails || {};
  const experiences = apiData?.experienceDetails || [];
  const educations = apiData?.educationDetails || [];
  const documents = apiData?.documentDetails || [];

  // const yesNo = (value) => (value === true ? "YES" : "NO");
  const yesNo = (value) => (value === true ? "Yes" : "No");

  /* =========================
     MASTER LOOKUPS (SAFE)
  ========================= */

  const gender = getGender?.(masters, profile.genderId);
  const religion = getReligion?.(masters, profile.religionId);
  const nationality = getNationality?.(masters, profile.nationality);
  const maritalStatus = getMaritalStatus?.(
    masters,
    profile.maritalStatusId
  );
  const twinGender = getGender?.(masters, profile.twinGenderId);
  const reservation = getReservation?.(masters, profile.reservationCategoryId);

  /* =========================
     STATE & DISTRICT LOOKUPS
  ========================= */
  // ✅ Create a temporary masters object with masterStates for address lookups
  const addressMasters = {
    ...masters,
    states: masterStates
  };
  const corrState = getState?.(addressMasters, address.stateId);
  const corrDistrict = getDistrict?.(addressMasters, address.districtId);
  const permState = getState?.(addressMasters, address.permanentStateId);
  const permDistrict = getDistrict?.(addressMasters, address.permanentDistrictId);



  /* =========================
     DOCUMENT GROUPING
  ========================= */
  const groupDocs = (predicate) =>
    documents.filter(predicate).map(d => ({
      id: d.id,
      name: d.fileName,
      url: d.fileUrl,
      displayname: d.displayName
    }));

  const formatINR = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const mapLanguageNames = (languages, masters) => {
    if (!languages || !languages.length) return "-";

    return languages
      .map(lang => {
        const found = masters.languages?.find(
          l => l.language_id === lang.languageId // ⚠️ adjust key if needed
        );
        if (!found) return null;

        const proficiency = [];

        if (lang.canRead) proficiency.push("Read");
        if (lang.canWrite) proficiency.push("Write");
        if (lang.canSpeak) proficiency.push("Speak");

        return `${found.language_name} (${proficiency.join(", ")})`;
      })
      .filter(Boolean)
      .join(", ");
  };
  return {
    /* =========================
       PERSONAL DETAILS (UNCHANGED KEYS)
    ========================= */
    personalDetails: {
      age: apiData.age || "-",
      fullName: profile.firstName + " " + profile.middleName + " " + profile.lastName || "-",
      mobile: profile.contactNo || "-",
      email: profile.email || "-",
      motherName: profile.motherName || "-",
      fatherName: profile.fatherName || "-",
      spouseName: profile.spouseName || "-",
      dob: formatDateDDMMYYYY(profile.dateOfBirth) || "-",
      socialMediaProfileLink: profile.socialMediaProfileLink || "-",
      languages: mapLanguageNames(languages, masters),      /* ================= TWIN DETAILS ================= */
      isTwin: yesNo(profile.isTwin),

      twinName:
        profile.isTwin === true
          ? profile.twinName || "-"
          : "-",

      twinGender_name:
        profile.isTwin === true
          ? twinGender?.gender_name || "-"
          : "-",

      /* 🔁 IDs (existing behaviour) */
      gender: profile.genderId || "-",
      religion: profile.religionId || "-",
      nationality: profile.nationality || "-",
      maritalStatus: profile.maritalStatusId || "-",
      caste: profile.community || "-",

      /* 🆕 DISPLAY NAMES (NEW – NON-BREAKING) */
      gender_name: gender?.gender_name || "-",
      religion_name: religion?.religion_name || "-",
      nationality_name: nationality?.country_name || "-",
      maritalStatus_name: maritalStatus?.marital_status || "-",
      state_name: corrState?.state_name || "-",
      district_name: corrDistrict?.district_name || "-",
      permanentState_name: permState?.state_name || "-",
      permanentDistrict_name: permDistrict?.district_name || "-",

      /* ================= ADDRESS ================= */
      address: `${address.addressLine1 || ""}, ${address.addressLine2 || ""}, ${address.city || ""}, ${address.districtId ? (corrDistrict?.district_name || address.districtId) : ""}, ${address.stateId ? (corrState?.state_name || address.stateId) : ""} - ${address.pincode || ""}`
        .replace(/,\s*,/g, ",")
        .replace(/,\s*-/g, " -")
        .trim(),
      permanentAddress: `${address.permanentAddressLine1 || ""}, ${address.permanentAddressLine2 || ""}, ${address.permanentCity || ""}, ${address.permanentDistrictId ? (permDistrict?.district_name || address.permanentDistrictId) : ""}, ${address.permanentStateId ? (permState?.state_name || address.permanentStateId) : ""} - ${address.permanentPincode || ""}`
        .replace(/,\s*,/g, ",")
        .replace(/,\s*-/g, " -")
        .trim(),

      /* ================= GOVT / SERVICE ================= */
      centralGovtEmployment: yesNo(profile.centralGovtEmployed),
      servingLowerPost: yesNo(profile.employedInLowerPost),
      familyMember1984: yesNo(profile.riotVictimFamily),
      religiousMinority: yesNo(profile.minority),
      servingInGovt: yesNo(profile.isPublicSectorUndertaking),
      disciplinaryAction: yesNo(profile.anyDisciplinaryAction),

      disciplinaryDetails:
        profile.anyDisciplinaryAction === true
          ? profile.disciplinaryDetails || "-"
          : "-",

      exService: yesNo(profile.exServiceman),
      physicalDisability: yesNo(profile.disability),
      cibilScore: profile.cibilScore || "-",
      reservationCategory: profile.reservationCategoryId || "-",
      reservationCategory_name: reservation?.category_name || "-"
    },

    /* =========================
       EXPERIENCE (UNCHANGED KEYS)
    ========================= */
    experience: experiences.map((e) => ({
      org: e.workExperience.organizationName || "-",
      designation: e.workExperience.postHeld || "-",
      department: e.workExperience.role || "-",
      from: formatDateDDMMYYYY(e.workExperience.fromDate) || "-",
      to: e.workExperience.isPresentlyWorking
        ? "Present"
        : formatDateDDMMYYYY(e.workExperience.toDate) || "-",
      duration: `${e.workExperience.monthsOfExp || 0} Months`,
      nature: e.workExperience.workDescription || "-"
    })),

    experienceSummary: {
      total: `${experiences.reduce(
        (sum, e) => sum + (e.workExperience.monthsOfExp || 0),
        0
      )} Months`,
      relevant: "-",
      designation: experiences[0]?.workExperience?.postHeld || "-",

      currentCtc: formatINR(
        experiences[0]?.workExperience?.currentCtc
      ),

      expectedCtc: formatINR(
        experiences[0]?.workExperience?.expectedCtc
      ),
    },

    /* =========================
       EDUCATION (🆕 SAFE ADDITION)
    ========================= */
    // education: educations.map((e) => ({
    //   qualification_id: e.education.educationTypeId,
    //   educationQualificationsId: e.education.educationQualificationsId || "-",
    //   institution: e.education.institutionName || "-",
    //   specialization:e.education.specializationId || "-",
    //   percentage: e.education.percentage ?? "-",
    //   startDate: e.education.startDate || "-",
    //   endDate: e.education.endDate || "-",
    // })),

    education: educations.map((e) => {


      const specialization = getSpecialization(
        masters,
        e.education.specializationId
      );

      const mandatoryQualification = getMandatoryQualification(
        masters,
        e.education.educationQualificationsId
      );

      const educationLevel = getEducationLevel(
        masters,
        mandatoryQualification.level_id
      );
      return {
        qualification_id: e.education.educationTypeId || "-",
        institution: e.education.institutionName || "-",
        universityName: e.education.universityName || "-",
        percentage: e.education.percentage ?? "-",
        //       percentage:
        // e.education.percentage != null
        //   ? (() => {
        //       const value = Number(e.education.percentage).toFixed(2);
        //       return Number(e.education.percentage) < 10
        //         ? `${value} CGPA`
        //         : `${value}%`;
        //     })()
        //   : "-",
        startDate: formatDateDDMMYYYY(e.education.startDate) || "-",
        endDate: formatDateDDMMYYYY(e.education.endDate) || "-",

        /* 🆕 Display values */
        educationLevel_name:
          educationLevel?.education_level_name || "-",

        specialization_name:
          specialization?.specialization_name || "-",

        mandatoryQualification_name:
          mandatoryQualification?.qualification_name || "-"
      };
    }),


    /* =========================
       LANGUAGES (🆕 SAFE ADDITION)
       (Not used yet, but future-ready)
    ========================= */
    // languages: languagesKnown.map((l) => {
    //   const lang = getLanguage?.(masters, l.languageId);
    //   return {
    //     language_id: l.languageId,
    //     language_name: lang?.language_name || "-",
    //     canRead: yesNo(l.canRead),
    //     canWrite: yesNo(l.canWrite),
    //     canSpeak: yesNo(l.canSpeak),
    //   };
    // }),

    /* =========================
       DOCUMENT DETAILS (NEW)
    ========================= */
    // documents: {
    //   photo: groupDocs(d => d.fileName?.includes("Photo")),
    //   signature: groupDocs(d => d.fileName?.includes("Signature")),
    //   resume: groupDocs(d => d.fileName?.includes("Resume")),
    //   payslips: groupDocs(d => d.fileName?.includes("Payslip")),
    //   educationCertificates: groupDocs(d =>
    //     d.fileName?.includes("Board") ||
    //     d.fileName?.includes("Intermediate")
    //   ),
    //   identityProofs: groupDocs(d =>
    //     d.fileName?.includes("Aadhar") ||
    //     d.fileName?.includes("Proof")
    //   ),
    //   communityCertificates: groupDocs(d =>
    //     d.fileName?.includes("Community")
    //   ),
    //   disabilityCertificates: groupDocs(d =>
    //     d.fileName?.includes("DISABILITY")
    //   ),
    // }
    documents: {
      allDocs: groupDocs(() => true),
    },

    /* =========================
       LANGUAGES KNOWN (✅ NEW)
    ========================= */
    languagesKnown: languages.map((lang) => ({
      languageId: lang.languageId || "-",
      canRead: lang.canRead || false,
      canWrite: lang.canWrite || false,
      canSpeak: lang.canSpeak || false,
    })),
  };
};

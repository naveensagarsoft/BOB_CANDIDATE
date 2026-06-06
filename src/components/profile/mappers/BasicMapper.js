export const mapBasicDetailsFormToApi = ({
  formData,
  candidateId,
  createdBy,
  candidateProfileId,
  email
}) => {
  const hasDisability = formData.disabilities.length > 0;

  return {
    candidateProfile: {
      isActive: true,
      candidateId,
      candidateProfileId: candidateProfileId || null,

      firstName: formData.firstName || "",
      middleName: formData.middleName || "",
      lastName: formData.lastName || "",

      fullNameAadhar: formData.fullNameAadhar || "",
      fullNameSSC: formData.fullNameSSC || "",

      genderId: formData.gender || null,
      dateOfBirth: formData.dob || null,
		  dobProofType: formData.dobProofType || "",

      maritalStatusId: formData.maritalStatus || null,
      nationality: formData.nationality || null,
      religionId: formData.religion || null,
      reservationCategoryId: formData.category || null,

      community: formData.caste || "",
      stateId: formData.casteState || null,

      motherName: formData.motherName || "",
      fatherName: formData.fatherName || "",
      spouseName: formData.spouseName || "",

      contactNo: formData.contactNumber || "",
      altContactNo: formData.altNumber || "",
      cibilScore: formData.cibilScore || "",
      socialMediaProfileLink: formData.socialMediaLink || "",

      isTwin: Boolean(formData.twinSibling),
      twinName: formData.twinSibling ? formData.siblingName || "" : "",
      twinGenderId: formData.twinSibling ? formData.twinGender || null : null,

      disability: hasDisability,
      isScribeRequirement: formData.scribeRequirement === "Yes",

      exServiceman: Boolean(formData.isExService),
      serviceStartDate: formData.serviceEnrollment || null,
      serviceEndDate: formData.dischargeDate || null,
      serviceMonths: Number(formData.servicePeriod) || 0,

      centralGovtEmployed: formData.employmentSecured === "Yes",
      employedInLowerPost: formData.lowerPostStatus === "Yes",
      riotVictimFamily: formData.riotVictimFamily === "Yes",
      minority: formData.minorityCommunity === "Yes",
      isPublicSectorUndertaking: formData.servingInGovt === "Yes",
      anyDisciplinaryAction: formData.disciplinaryAction === "Yes",
      isFresher: formData.isFresher ,
      hasCertification: formData.hasCertification,

      email,
      registrationNo: formData.registrationNo || "",
      createdBy
    },

    languagesKnown: [
      {
        isActive: true,
        candidateId,
        languageId: formData.language1,
        canRead: !!formData.language1Read,
        canWrite: !!formData.language1Write,
        canSpeak: !!formData.language1Speak,
        createdBy
      },
      {
        isActive: true,
        candidateId,
        languageId: formData.language2,
        canRead: !!formData.language2Read,
        canWrite: !!formData.language2Write,
        canSpeak: !!formData.language2Speak,
        createdBy
      },
      {
        isActive: true,
        candidateId,
        languageId: formData.language3,
        canRead: !!formData.language3Read,
        canWrite: !!formData.language3Write,
        canSpeak: !!formData.language3Speak,
        createdBy
      }
    ].filter(l => l.languageId),

    disabilityDetails: formData.disabilities.map(dis => ({
      isActive: true,
      candidateId,
      disabilityCategoryId: dis.disabilityCategoryId,
      disabilityPercentage: Number(dis.disabilityPercentage) || 0,
      createdBy
    }))
  };
};

//  Map API → Form Fill (when editing)
export const mapBasicDetailsApiToForm = (apiData) => {
  const profile = apiData?.candidateProfile || {};
  const languages = apiData?.languagesKnown || [];
  const disabilities = apiData?.disabilityDetails || [];

  return {
    // Personal
    firstName: profile.firstName || "",
    middleName: profile.middleName || "",
    lastName: profile.lastName || "",

    fullNameAadhar: profile.fullNameAadhar || "",
    fullNameSSC: profile.fullNameSSC || "",

    gender: profile.genderId || "",
    dob: profile.dateOfBirth || "",
    dobProofType: profile.dobProofType || "",

    maritalStatus: profile.maritalStatusId || "",
    nationality: profile.nationality || "",
    religion: profile.religionId || "",
    category: profile.reservationCategoryId || "",

    caste: profile.community || "",
    casteState: profile.stateId || "",

    motherName: profile.motherName || "",
    fatherName: profile.fatherName || "",
    spouseName: profile.spouseName || "",

    contactNumber: profile.contactNo || "",
    altNumber: profile.altContactNo || "",
    cibilScore: profile.cibilScore || "",
    socialMediaLink: profile.socialMediaProfileLink || "",

    // Twin
    twinSibling: Boolean(profile.isTwin),
    siblingName: profile.twinName || "",
    twinGender: profile.twinGenderId || "",

    // ✅ Disability
    isDisabledPerson: disabilities.length > 0,
    disabilities: disabilities.map(d => ({
      disabilityCategoryId: d.disabilityCategoryId || "",
      disabilityPercentage: d.disabilityPercentage ?? ""
    })),
    scribeRequirement: profile.isScribeRequirement ? "Yes" : "No",

    // Ex-Service
    isExService: Boolean(profile.exServiceman),
    serviceEnrollment: profile.serviceStartDate || "",
    dischargeDate: profile.serviceEndDate || "",
    servicePeriod: profile.serviceMonths || "",

    employmentSecured: profile.centralGovtEmployed ? "Yes" : "No",
    lowerPostStatus: profile.employedInLowerPost ? "Yes" : "No",
    riotVictimFamily: profile.riotVictimFamily ? "Yes" : "No",
    servingInGovt: profile.isPublicSectorUndertaking ? "Yes" : "No",
    minorityCommunity: profile.minority ? "Yes" : "No",
    disciplinaryAction: profile.anyDisciplinaryAction ? "Yes" : "No",
    isFresher: profile.isFresher ,
    hasCertification: profile.hasCertification,

    // Languages
    language1: languages[0]?.languageId || "",
    language1Read: !!languages[0]?.canRead,
    language1Write: !!languages[0]?.canWrite,
    language1Speak: !!languages[0]?.canSpeak,

    language2: languages[1]?.languageId || "",
    language2Read: !!languages[1]?.canRead,
    language2Write: !!languages[1]?.canWrite,
    language2Speak: !!languages[1]?.canSpeak,

    language3: languages[2]?.languageId || "",
    language3Read: !!languages[2]?.canRead,
    language3Write: !!languages[2]?.canWrite,
    language3Speak: !!languages[2]?.canSpeak,

    registrationNo: profile.registrationNo || ""
  };
};


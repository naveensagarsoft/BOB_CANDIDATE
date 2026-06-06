import { getMasterById } from "./masterLookup";

/* =========================
   DEPARTMENT
========================= */
export const getDepartment = (masters, deptId) =>
  getMasterById(
    masters,
    "departments",
    deptId,
    "department_id"   // ✅ FIXED
  );

/* =========================
   CITY
========================= */
export const getCity = (masters, cityId) =>
  getMasterById(
    masters,
    "cities",
    cityId,
    "city_id"         // ✅ FIXED
  );

/* =========================
   STATE
========================= */
export const getState = (masters, stateId) =>
  getMasterById(
    masters,
    "states",
    stateId,
    "state_id"        // ✅ FIXED
  );

/* =========================
   DISTRICT
========================= */
export const getDistrict = (masters, districtId) =>
  getMasterById(
    masters,
    "districts",
    districtId,
    "district_id"
  );

/* =========================
   LOCATION
========================= */
export const getLocation = (masters, locationId) =>
  getMasterById(
    masters,
    "locations",
    locationId,
    "location_id"     // ✅ FIXED
  );

/* =========================
   JOB GRADE
========================= */
export const getJobGrade = (masters, gradeId) =>
  getMasterById(
    masters,
    "job_grades",     // ✅ FIXED (NOT jobGrade)
    gradeId,
    "job_grade_id"    // ✅ FIXED
  );

/* =========================
   SKILL
========================= */
export const getSkill = (masters, skillId) =>
  getMasterById(
    masters,
    "skills",
    skillId,
    "skill_id"        // ✅ FIXED
  );
/* =========================
   EMPLOYMENT TYPE
========================= */
export const getEmploymentType = (masters, employmentTypeId) =>
  getMasterById(
    masters,
    "employment_types",     // ✅ matches API key
    employmentTypeId,
    "employment_type_id"     // ✅ matches ID field
  );

  /* =========================
   COUNTRY (NATIONALITY)
========================= */
export const getNationality = (masters, countryId) =>
  getMasterById(
    masters,
    "countries",
    countryId,
    "country_id"
  );

/* =========================
   GENDER
========================= */
export const getGender = (masters, genderId) =>

   getMasterById(
    masters,
    "genders",
    genderId,
    "gender_id"
  );

/* =========================
   MARITAL STATUS
========================= */
export const getMaritalStatus = (masters, maritalStatusId) =>
  getMasterById(
    masters,
    "marital_statuses",
    maritalStatusId,
    "marital_status_id"
  );

/* =========================
   RELIGION
========================= */
export const getReligion = (masters, religionId) =>
  getMasterById(
    masters,
    "religions",
    religionId,
    "religion_id"
  );

/* =========================
   RESERVATION
========================= */
export const getReservation = (masters, reservationId) =>
  getMasterById(
    masters,
    "reservation_categories",
    reservationId,
    "category_id"
  );
/* =========================
   EDUCATION LEVEL
========================= */
export const getEducationLevel = (masters, educationLevelId) =>
  getMasterById(
    masters,
    "education_levels",        // ✅ master key
    educationLevelId,
    "education_level_id"       // ✅ id field
  );

/* =========================
   SPECIALIZATION
========================= */
export const getSpecialization = (masters, specializationId) =>
  getMasterById(
    masters,
    "specializations",         // ✅ master key
    specializationId,
    "specialization_id"        // ✅ id field
  );

/* =========================
   MANDATORY QUALIFICATION
========================= */
export const getMandatoryQualification = (masters, qualificationId) =>
  getMasterById(
    masters,
    "mandatory_qualifications", // ✅ master key
    qualificationId,
    "qualification_id"          // ✅ id field
  );
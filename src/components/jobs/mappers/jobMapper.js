import {
   getDepartment,
   getJobGrade,
   getEmploymentType,
} from "../../../shared/utils/masterHelpers";
import { formatExperience,mapEduExperience,formatEduExperienceText } from "../../../shared/utils/formatExperience";
export const mapJobApiToModel = (apiJob, masters = {}, states = {}) => {
   if (!apiJob) return null;

   const {
      positionsDTO,
      masterPositionsDTO,
      requisitionsDTO,
      positionStateDistributions
      
   } = apiJob;


   const stateDistributions = positionStateDistributions || [];
   const stateIds = stateDistributions
      .map(s => s.stateId)
      .filter(Boolean);


   const stateNames = stateIds
  .map(id => {
    const stateObj = states.find(s => s.state_id === id);
    return stateObj?.state_name;
  })
  .filter(Boolean);


  /****locations or cities***/
   const cities=masters?.cities || [];
  const cityDistributions = positionStateDistributions || [];

   const cityIds = cityDistributions
      .map(s => s.cityId)
      .filter(Boolean);


   const cityNames = cityIds
  .map(id => {
    const cityObj = cities.find(s => s.city_id === id);
    return cityObj?.city_name;
  })
  .filter(Boolean);


   /* =========================
      MASTER LOOKUPS
   ========================= */

   const dept = getDepartment(masters, positionsDTO?.deptId);
   const grade = getJobGrade(masters, positionsDTO?.gradeId);
   const employmentType = getEmploymentType(
      masters,
      positionsDTO?.employmentType
   );



   // =========================
// EDUCATION-WISE EXPERIENCE (NEW LOGIC)
// =========================

// get education master (support both keys)
const educationLevels =
  masters?.educationLevels ||
  masters?.education_levels ||
  [];

// map data
const mandatoryExpEduWiseList = mapEduExperience(
  positionsDTO?.mandatoryExpMonthsEduWise,
  educationLevels
);

const preferredExpEduWiseList = mapEduExperience(
  positionsDTO?.preferredExpMonthsEduWise,
  educationLevels
);

// convert to text
const mandatoryExpEduWiseText =
  formatEduExperienceText(mandatoryExpEduWiseList);

const preferredExpEduWiseText =
  formatEduExperienceText(preferredExpEduWiseList);



   return {
      /* =========================
         IDS & TITLES
      ========================= */
      position_id: positionsDTO?.positionId || "",
      requisition_id: requisitionsDTO?.id || "",
      position_title: masterPositionsDTO?.positionName || "",
      position_code: masterPositionsDTO?.positionCode || "",
      requisition_code: requisitionsDTO?.requisitionCode || "",
      requisition_title: requisitionsDTO?.requisitionTitle || "",

      /* =========================
         DESCRIPTIONS
      ========================= */
      description: masterPositionsDTO?.positionDescription || "",
      roles_responsibilities: positionsDTO?.rolesResponsibilities || "",
     contract_period: positionsDTO?.contractYears
     ? `${positionsDTO.contractYears} Years`
     : "",


      /* =========================
         JOB DETAILS
      ========================= */
      employment_type: employmentType
         ? employmentType.employment_type_name
         : "",
      position_status: positionsDTO?.positionStatus || "Inactive",

      grade_id: positionsDTO?.gradeId || "",
      grade_name: grade ? grade.job_grade_code : "—",
      // vacancy_distribution: vacancyDistribution,
      positionStateDistributions: positionStateDistributions || [],
      positionCategoryNationalDistributions:
         positionsDTO?.positionCategoryNationalDistributions || [],
      /* =========================
         ELIGIBILITY
      ========================= */
      eligibility_age_min: positionsDTO?.eligibilityAgeMin ?? null,
      eligibility_age_max: positionsDTO?.eligibilityAgeMax ?? null,
      mandatory_qualification: positionsDTO?.mandatoryEducation || "",
      preferred_qualification: positionsDTO?.preferredEducation || "",
      mandatory_experience: formatExperience(positionsDTO?.mandatoryExperienceMonths),
      preferred_experience: formatExperience(positionsDTO?.preferredExperienceMonths),

      mandatory_experience_details: positionsDTO?.mandatoryExperience,
      preferred_experience_details: positionsDTO?.preferredExperience,

      /* =========================
         VACANCIES
      ========================= */
      no_of_vacancies: positionsDTO?.totalVacancies ?? 0,

      /* =========================
         LOCATION & DEPARTMENT
         (KEYS UNCHANGED)
      ========================= */
      dept_id: positionsDTO?.deptId || "",
      dept_name: dept ? dept.department_name : "—",

      location_id: "",           // ❗ not available in API anymore
      location_name: "—",

      // city_id: "",               // ❗ not available in API anymore
      // city_name: "—",

      /* =========================
         STATE (NEW DATA ADDED)
      ========================= */
      state_id: stateIds.join(",") || "",
      state_name: stateNames.join(", ") || "Any",

      state_id_array: stateIds || [],
      state_name_array: stateNames || [],

      city_id: cityIds.join(",") || "",
      city_name: cityNames.join(", ") || "Any",

      city_id_array: cityIds || [],
      city_name_array: cityNames || [],

      /* =========================
         SALARY
      ========================= */
      min_salary: grade ? grade.min_salary : null,
      max_salary: grade ? grade.max_salary : null,

      /* =========================
         REQUISITION DETAILS
      ========================= */
      registration_start_date: requisitionsDTO?.startDate || "",
      registration_end_date: requisitionsDTO?.endDate || "",
      requisition_status: requisitionsDTO?.requisitionStatus || "",
      requisition_comments: requisitionsDTO?.requisitionComments || null,

      /* =========================
         FLAGS
      ========================= */
      is_location_preference_enabled:
         positionsDTO?.isLocationPreferenceEnabled ?? false,
      is_location_wise:
         positionsDTO?.isLocationWise ?? false,
      isLocationWise: positionsDTO?.isLocationWise ?? false,
      isProficientInLocalLanguage: positionsDTO?.isProficientInLocalLanguage ?? false,

      //nely added
      //nely added
     // existing flags (keep as it is)
   isMandatoryExpMonthsEduWise: positionsDTO?.isMandatoryExpMonthsEduWise ?? false,
   isPreferredExpMonthsEduWise: positionsDTO?.isPreferredExpMonthsEduWise ?? false,
   mandatoryExpMonthsEduWise: positionsDTO?.mandatoryExpMonthsEduWise ?? null,
   preferredExpMonthsEduWise: positionsDTO?.preferredExpMonthsEduWise ?? null,

   // ✅ NEW FIELDS (ADD THESE)
   mandatory_exp_edu_wise_list: mandatoryExpEduWiseList,
   preferred_exp_edu_wise_list: preferredExpEduWiseList,

   mandatory_exp_edu_wise_text: mandatoryExpEduWiseText,
   preferred_exp_edu_wise_text: preferredExpEduWiseText,

   cutoffDate: positionsDTO?.cutoffDate || null,
   };
};


/* =========================
   LIST MAPPER
========================= */
export const mapJobsApiToList = (apiJobs, masters = {}, states = {}) => {
   if (!Array.isArray(apiJobs)) return [];
   return apiJobs.map(job => mapJobApiToModel(job, masters, states));
};


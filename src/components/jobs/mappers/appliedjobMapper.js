import {
   getDepartment,
   getJobGrade,
   getEmploymentType,
   getState
} from "../../../shared/utils/masterHelpers";
import { formatExperience } from "../../../shared/utils/formatExperience";
export const mapAppliedJobApiToModel = (apiJob, masters = {}) => {
   if (!apiJob) return null;

   const {
      positions: positionsDTO,
      masterPositions: masterPositionsDTO,
      requisitions: requisitionsDTO,
      candidateApplication: candidateApplicationDTO, // 🆕 NEW
   } = apiJob;

   const positionStateDistributions =
      positionsDTO?.positionStateDistributions || [];

   /* =========================
      STATE DISTRIBUTIONS
   ========================= */
   const stateIds = positionStateDistributions
      .map(s => s.stateId)
      .filter(Boolean);

   const stateNames = stateIds
      .map(id => getState(masters, id)?.state_name)
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

      /* =========================
         JOB DETAILS
      ========================= */
      employment_type: employmentType
         ? employmentType.employment_type_name
         : "",
      position_status: positionsDTO?.positionStatus || "-",

      grade_id: positionsDTO?.gradeId || "-",
      grade_name: grade ? grade.job_grade_code : "-",

      /* =========================
         ELIGIBILITY
      ========================= */
      eligibility_age_min: positionsDTO?.eligibilityAgeMin ?? null,
      eligibility_age_max: positionsDTO?.eligibilityAgeMax ?? null,
      mandatory_qualification: positionsDTO?.mandatoryEducation || "",
      preferred_qualification: positionsDTO?.preferredEducation || "",
      mandatory_experience: formatExperience(positionsDTO?.mandatoryExperienceMonths),
      preferred_experience: formatExperience(positionsDTO?.preferredExperienceMonths),

      /* =========================
         VACANCIES
      ========================= */
      no_of_vacancies: positionsDTO?.totalVacancies ?? 0,

      /* =========================
         LOCATION & DEPARTMENT
      ========================= */
      dept_id: positionsDTO?.deptId || "-",
      dept_name: dept ? dept.department_name : "-",

      location_id: "-",
      location_name: "-",

      city_id: "-",
      city_name: "-",

      /* =========================
         STATE
      ========================= */
      state_id: stateIds.join(",") || "-",
      state_name: stateNames.join(", ") || "-",

      state_id_array: stateIds,
      state_name_array: stateNames,

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
      isProficientInLocalLanguage: positionsDTO?.isProficientInLocalLanguage ?? false,

      /* =========================
         🆕 APPLICATION DETAILS
      ========================= */
      application_id: candidateApplicationDTO?.id || "",
      application_status: candidateApplicationDTO?.applicationStatus || "",
      application_date: candidateApplicationDTO?.applicationDate || "",
      application_updated_date: candidateApplicationDTO?.updatedDate || null,
      reference_number: candidateApplicationDTO?.applicationNo || "",
      payment_status: candidateApplicationDTO?.paymentStatus || "",
      /* =========================
         🆕 STATE DISTRIBUTION META
      ========================= */
      state_distribution_details: positionStateDistributions.map(s => ({
         state_id: s.stateId,
         vacancies: s.totalVacancies,
         local_language: s.localLanguage,
         distribution_id: s.positionStateDistributionId,
      })),

      /* =========================
         🆕 EXTRA POSITION INFO
      ========================= */
      cibil_score: positionsDTO?.cibilScore ?? null,
      required_documents: positionsDTO?.positionRequiredDocuments || [],
      candidate_location_preference:
         apiJob?.candidateLocationPreference || null,
   };
};

/* =========================
   LIST MAPPER
========================= */
export const mapAppliedJobsApiToList = (apiJobs, masters = {}) => {
   if (!Array.isArray(apiJobs)) return [];
   return apiJobs.map(job => mapAppliedJobApiToModel(job, masters));
};

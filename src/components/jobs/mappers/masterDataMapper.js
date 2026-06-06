// src/jobs/mappers/masterDataMapper.js

export const mapMasterDataApi = (apiResponse) => {
  const data = apiResponse?.data || {};
const safeStr = (v) => (typeof v === "string" ? v.trim() : "");
const safeNum = (v) => (Number.isFinite(v) ? v : 0);
const safeBool = (v) => v ?? true;
  return {
    departments: (data.departments || [])
      .filter(d => d.departmentId)
      .map(d => ({
        department_id: d.departmentId,
        department_name: safeStr(d.departmentName),
        department_desc: safeStr(d.departmentDesc),
        is_active: safeBool(d.isActive),
      })).sort((a, b) => a.department_name.localeCompare(b.department_name)),

    /* =====================
       COUNTRIES
    ====================== */
   countries: (data.countries || [])
  .filter(c => c.countryId)
  .map(c => ({
    country_id: c.countryId,
    country_name: safeStr(c.countryName),
    is_active: safeBool(c.isActive),
  })),

    /* =====================
       STATES
    ====================== */
    states: (data.states || [])
  .filter(s => s.stateId)
  .map(s => ({
    state_id: s.stateId,
    state_name: safeStr(s.stateName),
    country_id: s.countryId,
    is_active: safeBool(s.isActive),
  })),

    /* =====================
       CITIES
    ====================== */
   cities: (data.cities || [])
  .filter(c => c.cityId)
  .map(c => ({
    city_id: c.cityId,
    city_name: safeStr(c.cityName),
    state_id: c.stateId,
    is_active: safeBool(c.isActive),
  })),

    /* =====================
       LOCATIONS
    ====================== */
    locations: (data.locations || [])
  .filter(l => l.locationId)
  .map(l => ({
    location_id: l.locationId,
    location_name: safeStr(l.locationName),
    city_id: l.cityId,
    is_active: safeBool(l.isActive),
  })),

    /* =====================
       SKILLS
    ====================== */
    skills: (data.skills || [])
  .filter(s => s.skillId)
  .map(s => ({
    skill_id: s.skillId,
    skill_name: safeStr(s.skillName),
    skill_desc: safeStr(s.skillDesc),
    is_active: safeBool(s.isActive),
  })),


    /* =====================
       JOB GRADES
    ====================== */
    job_grades: (data.jobGrade || [])
  .filter(j => j.jobGradeId)
  .map(j => ({
    job_grade_id: j.jobGradeId,
    job_grade_code: safeStr(j.jobGradeCode),
    job_grade_desc: safeStr(j.jobGradeDesc),
    job_scale: safeStr(j.jobScale),
    min_salary: safeNum(j.minSalary),
    max_salary: safeNum(j.maxSalary),
    is_active: safeBool(j.isActive),
  })),

    /* =====================
       MANDATORY QUALIFICATIONS
    ====================== */
    mandatory_qualifications: (data.mandatoryQualification || []).map(q => ({
      qualification_id: q.educationQualificationsId,
      qualification_code: q.qualificationCode,
      qualification_name: q.qualificationName,
      level_id: q.levelId,
      is_active: q.isActive,
    })),

    /* =====================
       PREFERRED QUALIFICATIONS
    ====================== */
    preferred_qualifications: (data.preferredQualification || []).map(q => ({
      qualification_id: q.educationQualificationsId,
      qualification_code: q.qualificationCode,
      qualification_name: q.qualificationName,
      level_id: q.levelId,
      is_active: q.isActive,
    })),

    /* =====================
       MASTER POSITIONS
    ====================== */
 master_positions: (data.masterPositions || [])
  .filter(p => p.masterPositionsId)
  .map(p => ({
    position_id: p.masterPositionsId, // ✅ FIXED
    position_code: safeStr(p.positionCode),
    position_name: safeStr(p.positionName),
    position_desc: safeStr(p.positionDescription),
    job_grade_id: p.gradeId,
    department_id: p.deptId,
    employment_type_id: p.employmentType,
    min_age: safeNum(p.eligibilityAgeMin),
    max_age: safeNum(p.eligibilityAgeMax),
    is_active: true,
  })),


    /* =====================
       RESERVATION CATEGORIES
    ====================== */
  reservation_categories: (data.reservationCategories || [])
  .filter(r => r.reservationCategoriesId)
  .map(r => ({
    category_id: r.reservationCategoriesId,
    category_code: safeStr(r.categoryCode),
    category_name: safeStr(r.categoryName),
    category_desc: safeStr(r.categoryDesc),
    is_active: safeBool(r.isActive),
  })),


    /* =====================
       GENDER
    ====================== */
    genders: (data.genderMasters || []).map(g => ({
      gender_id: g.genderId,
      gender_name: safeStr(g.gender),
      is_active: g.isActive,
    })),

    /* =====================
       MARITAL STATUS
    ====================== */
    marital_statuses: (data.maritalStatusMaster || []).map(m => ({
      marital_status_id: m.maritalStatusId,
      marital_status: safeStr(m.maritalStatus),
      is_active: m.isActive,
    })),

    /* =====================
       RELIGION
    ====================== */
    religions: (data.religionMaster || []).map(r => ({
      religion_id: r.religionId,
      religion_name: safeStr(r.religion),
      is_active: r.isActive,
    })),

    /* =====================
       DISABILITY
    ====================== */
    disabilities: (data.disabilityCategories || []).map(d => ({
      disability_id: d.disabilityCategoryId,
      disability_code: safeStr(d.disabilityCode),
      disability_name: safeStr(d.disabilityName),
      is_active: d.isActive,
    })),

    /* =====================
       LANGUAGES
    ====================== */
    languages: (data.languageMasters || []).map(l => ({
      language_id: l.languageId,
      language_name: safeStr(l.languageName),
    })),

    /* =====================
       PINCODES
    ====================== */
    pincodes: (data.pincodes || []).map(p => ({
      pincode_id: p.pincodeId,
      pin: p.pin,
      city_id: p.cityId,
      is_active: p.isActive,
    })),

    /* =====================
       DISTRICTS
    ====================== */
    districts: (data.districts || []).map(d => ({
      district_id: d.districtId,
      district_name: safeStr(d.districtName),
      state_id: d.stateId,
      is_active: d.isActive,
    })),

    /* =====================
   EMPLOYMENT TYPES ✅
    ====================== */
    employment_types: (data.employementTypes || [])
      .filter(e => e.employementTypeId)
      .map(e => ({
        employment_type_id: e.employementTypeId,
        employment_type_code: safeStr(e.typeCode),
        employment_type_name: safeStr(e.typeName),
        is_active: true,
      })),

      /* =====================
      EDUCATION LEVELS ✅
    ====================== */
    education_levels: (data.educationLevels || [])
      .filter(e => e.documentTypeId)
      .map(e => ({
        education_level_id: e.documentTypeId,
        education_level_code: safeStr(e.docCode),
        education_level_name: safeStr(e.documentName),
        is_required: e.isRequired ?? false,
        is_editable: e.isEditable ?? true,
        is_active: true,
      })),

      /* =====================
      SPECIALIZATIONS ✅
    ====================== */
    specializations: (data.specializationMaster || [])
      .filter(s => s.specializationId)
      .map(s => ({
        specialization_id: s.specializationId,
        specialization_name: safeStr(s.specializationName),
        is_active: true,
      })),

  };
};

/**
 * Maps zonal states API response to internal format
 * @param {Array} apiResponse - Array of zonal states from getStatesData API
 * @returns {Array} Mapped states array
 */
export const mapZonalStatesApi = (apiResponse) => {
  const safeStr = (v) => (typeof v === "string" ? v.trim() : "");
  
  return (apiResponse || [])
    .filter(state => state.zonalStateID || state.stateName)
    .map(state => ({
      state_id: state.zonalStateID,
      state_name: safeStr(state.stateName),
      zonal_state_id: state.zonalStateID,
      is_active: true,
    }));
};

// export const mapZonalStatesApi = (apiResponse = []) => {
//   return apiResponse
//     .filter(state => state?.zonalStateID)
//     .map(state => ({
//       state_id: state.zonalStateID,
//       state_name: (state.stateName || "").trim(),
//       is_active: true,
//     }));
// };

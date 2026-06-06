// requisitionMapper.js

/**
 * Map a single requisition from API to model (same field names)
 */
export const mapRequisitionApiToModel = (apiReq) => {
  if (!apiReq) return null;

  return {
    isActive: apiReq.isActive ?? false,

    created_by: apiReq.createdBy || "",
    updated_by: apiReq.modifiedBy || "",
    created_date: apiReq.createdDate || "",
    updated_date: apiReq.modifiedDate || "",

    requisition_id: apiReq.id || "",
    requisition_code: apiReq.requisitionCode || "",
    requisition_title: apiReq.requisitionTitle || "",
    requisition_description: apiReq.requisitionDescription || "",

    registration_start_date: apiReq.startDate || "",
    registration_end_date: apiReq.endDate || "",

    requisition_status: apiReq.requisitionStatus || "",
    requisition_comments: apiReq.requisitionComments || "",
    //requisition_approval: apiReq.requisitionApproval || "",
    //requisition_approval_notes: apiReq.requisitionApprovalNotes || "",

    //no_of_positions: apiReq.noOfPositions ?? 0,
   // no_of_approvals: apiReq.noOfApprovals ?? 0,

    //job_postings: apiReq.jobPostings || "",
    //others: apiReq.others || null,

    /* =====================
       NEW KEYS (SAFE ADDITIONS)
    ====================== */
    indent_path: apiReq.indentPath || "",

    department_count: apiReq.departmentCount ?? 0,
    position_count: apiReq.positionCount ?? 0,
    vacancy_count: apiReq.vacancyCount ?? 0,
  };
};

/**
 * Map list of requisitions
 */
export const mapRequisitionsApiToList = (apiList = []) => {
  if (!Array.isArray(apiList)) return [];
  return apiList.map(mapRequisitionApiToModel);
};

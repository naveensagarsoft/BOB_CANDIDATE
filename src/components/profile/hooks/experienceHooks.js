import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import profileApi from "../services/profile.api";
import masterApi from "../../../services/master.api";
import { toast } from "react-toastify";
import {
  mapExperienceApiToUi,
  mapExperienceDetailsFormToApi
} from "../mappers/ExperienceMapper";
import { validateEndDateAfterStart, hasDateCollisionAcrossProfiles } from "../../../shared/utils/validation";
import { setExperienceList } from "../store/experienceSlice";
import { setEducationList } from "../store/resumeSlice";
import { intervalToDuration, parseISO, addDays, differenceInCalendarDays } from "date-fns";
/* -------------------- CONSTANTS -------------------- */
const EMPTY_FORM = {
  organization: "",
  role: "",
  postHeld: "",
  from: "",
  to: "",
  working: false,
  description: "",
  experience: 0,
  currentCTC: ""
};

/* -------------------- HELPERS -------------------- */
// const calculateExperienceDays = (fromDate, toDate) => {
//   if (!fromDate || !toDate) return 0;

//   const start = new Date(fromDate);
//   const end = new Date(toDate);

//   start.setHours(0, 0, 0, 0);
//   end.setHours(0, 0, 0, 0);

//   const diffDays = (end - start) / (1000 * 60 * 60 * 24);

//   return diffDays > 0 ? Math.floor(diffDays) : 0;
// };

const calculateExperienceDays = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 0;

  const start = new Date(fromDate);
  const end = addDays(new Date(toDate), 1); // include the last day

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return differenceInCalendarDays(end, start);
};

const trimStrings = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v
    ])
  );

/* -------------------- HOOK -------------------- */
export const useExperienceDetails = ({ goNext }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user?.user?.data);
  const candidateId = user?.user?.id;
  const workDoc = useSelector(state => state.documentTypes?.list?.find(doc => doc.docCode === "WORKEX"));
  const workDocId = workDoc.documentTypeId;
  // ✅ Get education list for cross-profile date collision check (from Redux, API-fetched)
  const educationList = useSelector((state) => state.resume?.list || []);

  const fileInputRef = useRef(null);

  const [experienceList, setExperienceList] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [ctcDisplay, setCtcDisplay] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [isFresher, setIsFresher] = useState(false);
  const [showFresherOption, setShowFresherOption] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [docError, setDocError] = useState("");

  /* -------------------- DERIVED -------------------- */
  const checkDateOverlap = (from, to, currentId = null) => {
    const start = new Date(from);
    const end = new Date(to || new Date());

    for (let item of experienceList) {
      // ignore the row being edited
      if (currentId && item.workExperienceId === currentId) continue;

      const itemStart = new Date(item.from);
      const itemEnd = item.to ? new Date(item.to) : new Date();

      const overlap =
        start <= itemEnd && itemStart <= end;

      if (overlap) return true;
    }

    return false;
  };

  const totalExperienceMonths = useMemo(() => {
    return experienceList.reduce(
      (sum, item) => sum + (item.monthsOfExp || 0),
      0
    );
  }, [experienceList]);

  const totalExperienceDays = useMemo(() => {
    return experienceList.reduce(
      (sum, item) => sum + (item.experience || 0),
      0
    );
  }, [experienceList]);

  const formatDateToDDMMYYYY = (date) => {
    if (!date) return null;
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  /* -------------------- FETCH -------------------- */
  const fetchExperienceDetails = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      const res = await profileApi.getExperienceDetails();
      const apiList = Array.isArray(res?.data) ? res.data : [];
      const mapped = apiList.map(mapExperienceApiToUi);

      setExperienceList(mapped);
      // ✅ Also store in Redux for cross-component access
      dispatch(setExperienceList(mapped));
      setIsDirty(false);
    } catch {
      setShowFresherOption(true);
    } finally {
      setLoading(false);
    }
  }, [candidateId, dispatch]);

  // ✅ Fetch education data to ensure cross-profile collision check has data
  const ensureEducationDataLoaded = useCallback(async () => {
    if (!candidateId) return;

    try {
      // Fetch education data and master data from API (always fresh)
      const [eduRes, masterRes] = await Promise.all([
        profileApi.getEducationDetails(),
        masterApi.getMasterData()
      ]);

      const list = eduRes?.data || [];
      const raw = masterRes?.data || {};
      const educationTypeMaster = raw.educationTypeMaster || [];

      // Map API response to structure matching hasDateCollisionAcrossProfiles expectations
      const apiMapped = list.map(item => {
        const edu = item.education || {};

        // ✅ Get educationType name for cross-profile validation
        const educationTypeId = edu.educationTypeId;
        const educationTypeObj = educationTypeMaster.find(et => et.educationTypeId === educationTypeId);
        const educationTypeName = educationTypeObj?.educationType || "";

        return {
          uiId: edu.educationId || item.id,
          educationId: edu.educationId,
          educationLevelId: edu.educationQualificationsId,
          label: edu.qualificationName || "Education",
          data: {
            educationLevel: edu.educationQualificationsId,
            university: "",
            college: edu.institutionName || "",
            specialization: "",
            educationType: educationTypeId,
            educationTypeName, // ✅ Add educationType name for validation
            from: edu.startDate || "",
            to: edu.endDate || "",
            percentage: edu.percentage || "",
            document: null
          },
          parsedId: null
        };
      });

      // ✅ Always update Redux, even if empty (to ensure deleted items are cleared)
      dispatch(setEducationList(apiMapped));
    } catch (error) {
      // Silently fail - this is a background data load for validation
      console.log("Could not load education data for validation");
    }
  }, [candidateId, dispatch]);

  useEffect(() => {
    if (formData.working) {
      setFormData(prev => ({ ...prev, to: "" }));
    }
  }, [formData.working]);

  // ✅ Load education data on mount to ensure validation data is available
  useEffect(() => {
    ensureEducationDataLoaded();
  }, [ensureEducationDataLoaded]);


  const isWorkingStatus = (row, today) =>
    row.working == "Yes" ||
    row.working == true ||
    (row.to && new Date(row.to).toISOString().split("T")[0] === today);

  const validateRow = (row) => {
    const errors = {};
    const today = new Date().toISOString().split("T")[0];

    const isWorking = isWorkingStatus(row, today);

    if (!row.organization?.trim()) errors.organization = "This field is required";
    if (!row.role?.trim()) errors.role = "This field is required";
    if (!row.postHeld?.trim()) errors.postHeld = "This field is required";
    if (!row.from) errors.from = "This field is required";

    if (!isWorking && !row.to) {
      errors.to = "This field is required";
    }

    if (row.from && row.to) {
      const { isValid, error } = validateEndDateAfterStart(row.from, row.to);
      if (!isValid) errors.to = error;
    }

    if (!row.description?.trim()) errors.description = "This field is required";

    if (isWorking && (!row.currentCTC || Number(row.currentCTC) <= 0)) {
      errors.currentCTC = "This field is required";
    }

    if (!isWorking && !row.certificate) {
      errors.certificate = "This field is required";
    }

    return errors;
  };

  const formatIndianCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN").format(Number(value));
  };
  const clearDateOverlapErrors = () => {
    setFormErrors(prev => {
      const { from, to, ...rest } = prev;
      return rest;
    });
  };
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === "from" || id === "to" || id === "working") {
      clearDateOverlapErrors();
    } else {
      setFormErrors(prev => ({ ...prev, [id]: "" }));
    }

    setIsDirty(true);
  };

  const handleCTCChange = (e) => {
    let rawValue = e.target.value.replace(/,/g, "");

    // allow only digits
    if (!/^\d*$/.test(rawValue)) return;

    // restrict to max 8 digits
    if (rawValue.length > 8) return;

    setFormData(prev => ({ ...prev, currentCTC: rawValue }));
    setCtcDisplay(rawValue);
    setFormErrors(p => ({ ...p, currentCTC: "" }));
  };

  const handleCTCFocus = () => {
    setCtcDisplay(formData.currentCTC || "");
  };

  const handleCTCBlur = () => {
    if (formData.currentCTC) {
      setCtcDisplay(formatIndianCurrency(formData.currentCTC));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCertificateFile(file);
    setExistingDocument(null);
    setDocError("");
    setFormErrors(p => ({ ...p, certificate: "" }));
    setIsDirty(true);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setCertificateFile(null);
    setExistingDocument(null);
    setDocError("");
    setFormErrors({});
    setIsEditMode(false);
    setEditingRow(null);
    setCtcDisplay("");
  };

  const isEmpty = (val) => !val || !val.trim();

  const validateBasicFields = (data, errors) => {
    if (isEmpty(data.organization)) errors.organization = "This field is required";
    if (isEmpty(data.role)) errors.role = "This field is required";
    if (isEmpty(data.postHeld)) errors.postHeld = "This field is required";
    if (!data.from) errors.from = "This field is required";
  };

  const validateToDate = (data, errors) => {
    if (!data.working && !data.to) {
      errors.to = "This field is required";
    }

    if (!data.working && data.from && data.to) {
      const { isValid, error } = validateEndDateAfterStart(data.from, data.to);
      if (!isValid) errors.to = error;
    }
  };

  const validateOverlap = (data, errors) => {
    const effectiveTo = data.working
      ? new Date().toISOString().split("T")[0]
      : data.to;

    if (data.from && effectiveTo) {
      const hasOverlap = checkDateOverlap(
        data.from,
        effectiveTo,
        editingRow?.workExperienceId
      );

      if (hasOverlap) {
        errors.from = "Experience dates overlap with another entry";
        if (!data.working) {
          errors.to = "Experience dates overlap with another entry";
        }
      }
    }
  };

  const validateCrossProfile = (data, errors) => {
    const isWorking = data.working === true || data.working === "Yes";
    const effectiveTo = isWorking ? new Date().toISOString().split("T")[0] : data.to;

    if (data.from && effectiveTo && !errors.from && !errors.to) {
      const collision = hasDateCollisionAcrossProfiles({
        from: data.from,
        to: effectiveTo,
        excludeId: editingRow?.workExperienceId,
        educationList,
        experienceList,
        presentlyWorking: isWorking
      });

      if (collision) {
        errors.from = "Experience dates overlap with an education entry";
        if (!isWorking) {
          errors.to = "Experience dates overlap with an education entry";
        }
      }
    }
  };

  const validateExtras = (data, errors) => {
    if (isEmpty(data.description)) {
      errors.description = "This field is required";
    }

    if (data.working === true) {
      if (!data.currentCTC || Number(data.currentCTC) <= 0) {
        errors.currentCTC = "This field is required";
      }
    }

    if (!certificateFile && !existingDocument) {
      errors.certificate = "This field is required";
    }

    if (data.working === true) {
      const alreadyWorking = experienceList.some(
        e =>
          (e.working === "Yes" || e.working === true) &&
          e.workExperienceId !== editingRow?.workExperienceId
      );

      if (alreadyWorking) {
        errors.working = "Only one current job is allowed";
      }
    }
  };
  /* -------------------- VALIDATION -------------------- */
  const validateForm = () => {
    const errors = {};

    validateBasicFields(formData, errors);
    validateToDate(formData, errors);
    validateOverlap(formData, errors);
    validateCrossProfile(formData, errors);
    validateExtras(formData, errors);

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchWorkStatus = useCallback(async () => {
    try {
      const res = await profileApi.getWorkStatus();
      const isFresherFromApi = res?.data === true;

      setIsFresher(isFresherFromApi);
      setShowFresherOption(true);
    } catch {
      // If API fails, default to unchecked
      setIsFresher(false);
      setShowFresherOption(true);
    }
  }, []);

  const getValidationStatus = async (formData) => {
    if (!certificateFile) {
      return { isValidationPending: false, pendingChecks: null };
    }

    const payload = {
      documentId: workDocId,
      organization: formData.organization,
      role: formData.role,
      postHeld: formData.postHeld,
      fromDate: formatDateToDDMMYYYY(formData.from),
      isPresentlyWorking: formData.working
    };

    if (!formData.working) {
      payload.toDate = formData.to
        ? formatDateToDDMMYYYY(formData.to)
        : null;
    }

    const res = await profileApi.validateWorkExperienceDocument(
      payload,
      certificateFile
    );

    if (res.data.status === "validated") {
      return { isValidationPending: false, pendingChecks: null };
    }

    setDocError(res.data.detailedMessage);

    return {
      isValidationPending: true,
      pendingChecks: res.data.pendingChecks || []
    };
  };

  /* -------------------- SAVE -------------------- */
  const saveExperience = async () => {
    //if (!validateForm()) return;

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const effectiveTo = formData.working
      ? new Date().toISOString().split("T")[0]
      : formData.to;

    const experienceDays = calculateExperienceDays(
      formData.from,
      effectiveTo
    );

    const sanitized = trimStrings(formData);

    const finalFormData = {
      ...sanitized,
      to: sanitized.working ? null : sanitized.to,
      experience: experienceDays,
      currentCTC: sanitized.working ? sanitized.currentCTC : null
    };

    try {
      setLoading(true);

      const { isValidationPending, pendingChecks } =
        await getValidationStatus(finalFormData);

      const payloadBase = {
        ...mapExperienceDetailsFormToApi(finalFormData, candidateId),
        isValidationPending,
        pendingChecks
      };

      const payload = isEditMode
        ? { ...payloadBase, workExperienceId: editingRow.workExperienceId }
        : payloadBase;

      await profileApi.postExperienceDetails(payload, certificateFile);

      toast.success(isEditMode ? "Updated successfully" : "Saved successfully");

      setShowModal(false);
      setIsDirty(false);
      resetForm();
      setDocError("");
      // ✅ Refresh both experience and education data to ensure cross-profile validation is fresh
      fetchExperienceDetails();
      ensureEducationDataLoaded();

    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Validation or save failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormErrors({});

    const today = new Date().toISOString().split("T")[0];

    const isCurrentJob =
      item.to &&
      new Date(item.to).toISOString().split("T")[0] === today;

    const workingStatus =
      item.working === "Yes" || item.working === true || isCurrentJob;

    setIsEditMode(true);
    setEditingRow(item);

    const updatedForm = {
      organization: item.organization,
      role: item.role,
      postHeld: item.postHeld,
      from: item.from,
      to: workingStatus ? "" : item.to,
      working: workingStatus,
      description: item.description,
      experience: item.experience,
      currentCTC: String(item.currentCTC || "")
    };

    setFormData(updatedForm);

    setExistingDocument(item.certificate || null);
    setCertificateFile(null);

    setCtcDisplay(
      item.currentCTC ? formatIndianCurrency(item.currentCTC) : ""
    );

    // 🚨 enforce CTC validation immediately
    if (workingStatus && (!item.currentCTC || Number(item.currentCTC) <= 0)) {
      setFormErrors(prev => ({
        ...prev,
        currentCTC: "This field is required"
      }));
    }
  };

  const handleDelete = async (item) => {
    try {
      setLoading(true);
      await profileApi.deleteExperienceDetails(item.workExperienceId);
      toast.success("Deleted successfully");
      // ✅ Refetch both experience and education data to ensure cross-profile validation is fresh
      fetchExperienceDetails();
      ensureEducationDataLoaded();
      if (editingRow?.workExperienceId === item.workExperienceId) {
        resetForm();
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };
  const getInvalidRow = () => {
    for (let row of experienceList) {
      const errors = validateRow(row);
      if (Object.keys(errors).length > 0) {
        return { row, errors };
      }
    }
    return null;
  };
  const saveAndNext = async () => {
    if (isFresher) {
      await profileApi.postWorkStatus(true);
      goNext();
      return;
    }

    if (!experienceList.length) {
      toast.error("Please add at least one experience or mark fresher");
      return;
    }

    const invalid = getInvalidRow();

    if (invalid) {
      setShowModal(true);
      toast.error("Please fix the highlighted experience entry");

      handleEdit(invalid.row);
      setFormErrors(invalid.errors);

      return;
    }

    await profileApi.postWorkStatus(false);
    goNext();
  };

  const handleWorkingChange = (value) => {
    const isWorking = value === "true";

    setFormData(prev => ({
      ...prev,
      working: isWorking,
      to: isWorking ? "" : prev.to
    }));

    setFormErrors(prev => {
      const { certificate, to, from, ...rest } = prev;
      return isWorking ? rest : { ...rest };
    });

    setIsDirty(true);
  };

  useEffect(() => {
    if (!candidateId) return;

    fetchExperienceDetails();
    fetchWorkStatus();
  }, [candidateId, fetchExperienceDetails, fetchWorkStatus]);

  const blockCTCKeys = (e) => {
    const blocked = ["e", "E", "+", "-", ","];
    if (blocked.includes(e.key)) {
      e.preventDefault();
    }
  };

  const clearExistingDocument = () => {
    setExistingDocument(null);
    setCertificateFile(null);
    setIsDirty(true);
  };

  const formatFileSize = (size) => {
    if (!size) return "";
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // const formatTotalExperience = (totalDays) => {
  //   const years = Math.floor(totalDays / 365);
  //   const remainingDays = totalDays % 365;
  //   const months = Math.floor(remainingDays / 30);
  //   const days = remainingDays % 30;

  //   return `${years}y ${months}m ${days}d`;
  // };
  const formatTotalExperience = (totalDays) => {
    if (!totalDays || totalDays <= 0) {
      return "0 years 0 months 0 days";
    }

    const baseDate = new Date(2001, 0, 1);

    const endDate = addDays(baseDate, totalDays);

    const duration = intervalToDuration({
      start: baseDate,
      end: endDate
    });

    const years = duration.years || 0;
    const months = duration.months || 0;
    const days = duration.days || 0;

    return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""} ${days} day${days !== 1 ? "s" : ""}`;
  };
  return {
    experienceList,
    formData,
    formErrors,
    setFormErrors,
    certificateFile,
    existingDocument,
    isEditMode,
    isFresher,
    showFresherOption,
    totalExperienceMonths,
    totalExperienceDays,
    isDirty,
    loading,
    fileInputRef,
    ctcDisplay,

    setIsFresher,

    handleChange,
    handleCTCFocus,
    handleCTCBlur,
    handleCTCChange,
    handleFileChange,
    handleBrowse,
    saveExperience,
    handleEdit,
    handleDelete,
    handleCancelEdit,
    saveAndNext,
    blockCTCKeys,
    handleWorkingChange,
    clearExistingDocument,
    formatFileSize,
    showModal,
    setShowModal,
    docError,
    formatTotalExperience
  };
};

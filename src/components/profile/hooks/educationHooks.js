import { useState, useEffect, useRef, createRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import profileApi from "../services/profile.api";
import masterApi from "../../../services/master.api";
import { toast } from "react-toastify";
import {
  getEducationLevelIdFromQualification,
  mapEducationApiToUi
} from "../mappers/EducationMapper";
import { mapExperienceApiToUi } from "../mappers/ExperienceMapper";
import { validateEndDateAfterStart } from "../../../shared/utils/validation";
import { removeParsedEducationById, setEducationList } from "../store/resumeSlice";
import { setExperienceList } from "../store/experienceSlice";

const EMPTY_MASTER_DATA = {
  educationLevels: [],
  boards: [],
  specializations: [],
  educationTypes: []
};

export const useEducationDetails = ({ goNext }) => {
  const user = useSelector(state => state?.user?.user?.data);
  const parsedResume = useSelector(state => state.resume?.parsed || null);
  // ✅ Get experience list from Redux to ensure we always have fresh data
  const experienceListFromRedux = useSelector((state) => state.experience?.list || []);
  const candidateId = user?.user?.id;

  const dispatch = useDispatch();

  const [educations, setEducations] = useState([]);
  const [masterData, setMasterData] = useState(EMPTY_MASTER_DATA);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [activeEducationUiId, setActiveEducationUiId] = useState(null);  // ✅ Track by uiId
  const [hasSavedEducation, setHasSavedEducation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isNewRow, setIsNewRow] = useState(false);

  const formRefs = useRef({});
  const educationIdToUiIdMap = useRef({});  // ✅ NEW: Track educationId -> uiId mapping to avoid loop

  // const sortedEducations = [...educations].sort((a, b) => {
  //   const dateA = a?.data?.from ? new Date(a.data.from) : new Date(0);
  //   const dateB = b?.data?.from ? new Date(b.data.from) : new Date(0);
  //   return dateB - dateA; // DESC
  // });
  const MIN_SORT_DATE = new Date(0);

  const sortedEducations = [...educations].sort((a, b) => {
    const getSortDate = (edu) => {
      if (edu?.data?.from) return new Date(edu.data.from);

      if (edu?.data?.to) return new Date(edu.data.to);

      return MIN_SORT_DATE;
    };

    return getSortDate(b) - getSortDate(a);
  });
  /* -------------------- SYNC ACCORDION STATE -------------------- */
  useEffect(() => {
    if (activeEducationUiId && sortedEducations.length > 0) {
      // Keep activeAccordionKey in sync with activeEducationUiId for backward compatibility
      const index = sortedEducations.findIndex(e => e.uiId === activeEducationUiId);
      if (index !== -1) {
        setActiveAccordionKey(String(index));
      }
    }
  }, [activeEducationUiId, sortedEducations]);

  /* -------------------- REFS -------------------- */
  const getRef = (key) => {
    if (!formRefs.current[key]) {
      formRefs.current[key] = createRef();
    }
    return formRefs.current[key];
  };

  /* -------------------- HELPERS -------------------- */
  const mapParsedLevelToId = (levelStr, educationLevels) => {
    if (!educationLevels?.length || !levelStr) return null;

    const s = levelStr.toLowerCase();

    const findByCode = (code) =>
      educationLevels.find(e => e.docCode === code)?.documentTypeId;

    if (/ph\.?d|doctorate|doctoral|doctor of philosophy/.test(s))
      return findByCode("PHD");

    if (/post|master|m\.tech|mtech|mba|msc/.test(s))
      return findByCode("POST_GRAD");

    if (/bachelor|graduate|b\.tech|btech|b\.e|bsc/.test(s))
      return findByCode("GRAD");

    if (/diploma/.test(s))
      return findByCode("DIPLOMA");

    if (/intermediate|12th|hsc|higher secondary/.test(s))
      return findByCode("INTER");

    if (/10th|ssc|secondary|school/.test(s))
      return findByCode("BOARD");

    // ❌ REMOVE FAKE FALLBACK
    return null;
  };

  const getEducationLabel = (qualificationId, mandatoryQualifications, educationLevels) => {
    const levelId = getEducationLevelIdFromQualification(
      qualificationId,
      mandatoryQualifications
    );

    return (
      educationLevels.find(l => l.documentTypeId === levelId)?.documentName ||
      "Education"
    );
  };

  const cleanPercentage = (value) => {
    if (!value) return "";

    // remove % and anything non-numeric except dot
    const cleaned = String(value).replace(/[^\d.]/g, "");

    return cleaned;
  };

  /* -------------------- FETCH DATA -------------------- */
  const fetchEducationDetails = useCallback(async () => {
    if (!candidateId) return;

    setLoading(true);
    try {
      const [eduRes, masterRes] = await Promise.all([
        profileApi.getEducationDetails(),
        masterApi.getMasterData()
      ]);

      const list = eduRes?.data || [];
      setHasSavedEducation(list.length > 0);
      const raw = masterRes?.data || {};
      const mandatoryQualifications = raw.mandatoryQualification || [];

      setMasterData({
        educationLevels: raw.educationLevels || [],
        boards: raw.mandatoryQualification || [],
        specializations: raw.specializationMaster || [],
        educationTypes: raw.educationTypeMaster || []
      });

      const apiMapped = list.map(item => {
        const qualificationId = item.education.educationQualificationsId;
        const levelId = getEducationLevelIdFromQualification(
          qualificationId,
          mandatoryQualifications
        );

        // ✅ Use existing uiId if this educationId already exists, otherwise create new
        const educationId = item.education.educationId;
        const uiId = educationIdToUiIdMap.current[educationId] || crypto.randomUUID();
        educationIdToUiIdMap.current[educationId] = uiId;  // Store for next refresh

        // ✅ Get educationType name for cross-profile validation
        const educationTypeId = item.education.educationTypeId;
        const educationTypeObj = raw.educationTypeMaster?.find(et => et.educationTypeId === educationTypeId);
        const educationTypeName = educationTypeObj?.educationType || "";

        const mappedData = mapEducationApiToUi(item, mandatoryQualifications);

        return {
          uiId,
          educationId,
          educationLevelId: levelId,
          // educationLevelId: levelId || getEducationLevelIdsByCode(["GRAD"])[0],
          label: getEducationLabel(
            qualificationId,
            mandatoryQualifications,
            raw.educationLevels
          ),
          data: {
            ...mappedData,
            educationTypeName // ✅ Add educationType name for validation
          },
          parsedId: null
        };
      });

      const parsedMapped = (parsedResume?.education || []).map(ed => {
        console.log("Parsed education level:", ed.level); // DEBUG

        const levelId = mapParsedLevelToId(ed.level, raw.educationLevels);

        const label =
          raw.educationLevels?.find(l => l.documentTypeId === levelId)?.documentName ||
          ed.level ||
          "Education";

        const boardLevelId = raw.educationLevels.find(e => e.docCode === "BOARD")?.documentTypeId;
        const interLevelId = raw.educationLevels.find(e => e.docCode === "INTER")?.documentTypeId;

        const isSchoolLevel = [boardLevelId, interLevelId].includes(levelId);
        const hasValidLevel = !!levelId;

        const year = ed.passingYear || "";
        const date = year ? `${year}-01-01` : "";

        const parsedId = ed.__tempId;

        const uiId =
          educationIdToUiIdMap.current[`parsed_${parsedId}`] ||
          crypto.randomUUID();

        educationIdToUiIdMap.current[`parsed_${parsedId}`] = uiId;

        return {
          uiId,
          educationId: null,
          educationLevelId: levelId, // ✅ KEEP AS IS (no fake fallback)
          label,
          parsedId,
          data: {
            educationLevel: levelId, // ✅ THIS IS WHAT DROPDOWN USES
            university: "",
            college: ed.school || ed.institution || "",
            specialization: "",
            educationType: "",
            // from: date,
            from: hasValidLevel && !isSchoolLevel ? date : "",
            to: date,
            percentage: cleanPercentage(ed.percentage) || "",
            document: null
          }
        };
      });

      // Collect all levelIds already present in API educations
      const apiLevelIds = new Set(apiMapped.map(e => e.educationLevelId));

      // Filter parsed items if same level already exists in API
      const filteredParsed = parsedMapped.filter(
        p => !apiLevelIds.has(p.educationLevelId)
      );

      const allEducations = [...apiMapped, ...filteredParsed];
      setEducations(allEducations);
      // ✅ Also store API-fetched education list in Redux for cross-component access
      dispatch(setEducationList(apiMapped));
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load education details");
    } finally {
      setLoading(false);
    }
  }, [candidateId, parsedResume, dispatch]);

  // ✅ Fetch experience data to ensure cross-profile collision check has data
  const ensureExperienceDataLoaded = useCallback(async () => {
    if (!candidateId) return;

    try {
      // Fetch experience data from API (always fresh)
      const expRes = await profileApi.getExperienceDetails();
      const expList = Array.isArray(expRes?.data) ? expRes.data : [];

      // Map API response to UI format using proper mapper
      const expMapped = expList.map(mapExperienceApiToUi);

      // ✅ Always update Redux, even if empty (to ensure deleted items are cleared)
      dispatch(setExperienceList(expMapped));
    } catch (error) {
      // Silently fail - this is a background data load for validation
      console.log("Could not load experience data for validation");
    }
  }, [candidateId, dispatch]);

  useEffect(() => {
    fetchEducationDetails();
    // ✅ Also load experience data on mount
    ensureExperienceDataLoaded();
  }, [fetchEducationDetails, ensureExperienceDataLoaded]);

  /* -------------------- ACTIONS -------------------- */
  const addEducation = () => {
    setEducations(prev => {
      const nextIndex = prev.length;
      setActiveAccordionKey(String(nextIndex));

      return [
        ...prev,
        {
          uiId: crypto.randomUUID(),
          educationId: null,
          label: "Select Education Level",
          data: null,
          parsedId: crypto.randomUUID()
        }
      ];
    });
    setIsDirty(true);
  };

  const deleteEducation = (parsedId) => {
    setEducations(prev => prev.filter(e => e.parsedId !== parsedId));
    if (parsedId) dispatch(removeParsedEducationById(parsedId));
    setIsDirty(true);
  };

  const getExistingRanges = (excludeUiId = null) =>
    sortedEducations
      .filter(e => e.data?.from && e.data?.to && e.uiId !== excludeUiId)
      .map(e => ({
        educationId: e.educationId,
        from: e.data.from,
        to: e.data.to,
        label: e.label
      }));

  const getEducationLevelIdsByCode = (codes = []) => {
    return masterData.educationLevels
      .filter(e => codes.includes(e.docCode))
      .map(e => e.documentTypeId);
  };

  const validateEducationPresence = () => {
    if (!sortedEducations.length) {
      toast.error("Please add at least 1 education");
      return false;
    }

    const levelIds = educations
      .map(e => e.data?.educationLevel)
      .filter(Boolean);

    const tenthIds = getEducationLevelIdsByCode(["BOARD"]);
    const higherIds = getEducationLevelIdsByCode([
      "INTER",
      "DIPLOMA",
      "PROFESSIONAL"
    ]);

    const hasTenth = levelIds.some(id => tenthIds.includes(id));
    const hasHigher = levelIds.some(id => higherIds.includes(id));

    if (!hasTenth) {
      toast.error("Please add 10th education");
      return false;
    }

    if (!hasHigher) {
      toast.error("Please add 12th or Diploma or Professional Course");
      return false;
    }

    return true;
  };

  const validateSingleEducation = (edu, index, schoolLevelIds) => {
    const isSchoolLevel = schoolLevelIds.includes(edu.data?.educationLevel);

    // required fields
    if (
      !edu?.data ||
      !edu.data.educationLevel ||
      !edu.data.college ||
      !edu.data.to ||
      !edu.data.percentage ||
      !edu.data.educationType
    ) {
      return { error: "Please fill required fields", index };
    }

    // from date
    if (!isSchoolLevel && !edu.data.from) {
      return { error: "Please fill required fields", index };
    }

    // date validation
    if (edu.data.from && edu.data.to) {
      const { isValid, error } = validateEndDateAfterStart(
        edu.data.from,
        edu.data.to
      );

      if (!isValid) {
        return { error: error || "Invalid date range", index };
      }
    }

    // percentage
    const pct = Number(edu.data.percentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return { error: "Please enter a valid percentage between 0 and 100", index };
    }

    // certificate validation
    if (!edu.educationId && !edu.parsedId) {
      const ref = getRef(String(index));
      if (ref?.current) {
        const result = ref.current.validate();
        if (!result || !result.isValid) {
          return { error: "Please fill required fields", index };
        }
      }
    }

    return null;
  };

  const validateAllEducations = () => {
    const boardLevelIds = getEducationLevelIdsByCode(["BOARD"]);
    const interLevelIds = getEducationLevelIdsByCode(["INTER"]);
    const schoolLevelIds = [...boardLevelIds, ...interLevelIds];

    for (let i = 0; i < educations.length; i++) {
      const errorObj = validateSingleEducation(
        educations[i],
        i,
        schoolLevelIds
      );

      if (errorObj) return errorObj;
    }

    return null;
  };

  /* -------------------- VALIDATION -------------------- */
  const saveAndNext = () => {
    if (!validateEducationPresence()) return;

    const errorObj = validateAllEducations();

    if (errorObj) {
      setActiveEducationUiId(errorObj.index);
      setShowModal(true);
      toast.error(errorObj.error);

      // validate the modal form after it opens
      setTimeout(() => {
        const ref = formRefs.current[String(errorObj.index)];
        ref?.current?.validate?.();
      }, 0);

      return;
    }

    goNext();
  };

  const handleDeleteClick = async (edu) => {
    try {
      // ✅ CASE 1 — API EDUCATION
      if (edu.educationId) {
        await profileApi.deleteEducationDetails(edu.educationId);
        toast.success("Deleted successfully");

        // ✅ Refresh both education and experience data
        await fetchEducationDetails(); // refresh from API
        await ensureExperienceDataLoaded(); // refresh experience data too
        return;
      }

      // ✅ CASE 2 — PARSED EDUCATION
      if (edu.parsedId) {
        const isReduxEntry = parsedResume?.education?.some(
          e => e.__tempId === edu.parsedId
        );

        if (isReduxEntry) {
          dispatch(removeParsedEducationById(edu.parsedId));

          setEducations(prev =>
            prev.filter(e => e.parsedId !== edu.parsedId)
          );

          // ✅ Refresh experience data after deletion
          await ensureExperienceDataLoaded();
          return;
        } else {
          // fallback (rare case)
          deleteEducation(edu.parsedId);
        }
      }

    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return {
    educations,
    sortedEducations,
    masterData,
    loading,
    isDirty,
    activeAccordionKey,
    setActiveAccordionKey,
    activeEducationUiId,
    setActiveEducationUiId,
    getRef,
    addEducation,
    deleteEducation,
    refreshEducation: fetchEducationDetails,
    getExistingRanges,
    saveAndNext,
    setIsDirty,
    hasSavedEducation,
    handleDeleteClick,
    setShowModal,
    showModal,
    setIsNewRow,
    isNewRow
  };
};

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import jobsApiService from "../services/jobsApiService";
import masterApi from "../../../services/master.api";

import { mapJobsApiToList } from "../../jobs/mappers/jobMapper";
import { mapRequisitionsApiToList } from "../../jobs/mappers/requisitionMapper";
import { mapMasterDataApi, mapZonalStatesApi } from "../../jobs/mappers/masterDataMapper";
import { mapCandidateToPreview } from "../../jobs/mappers/candidatePreviewMapper";
import { mapInterviewCentresApi } from "../../jobs/mappers/interviewCentreMapper";
import { extractValidationErrors } from "../../../shared/utils/validationError";
import useDebounce from "../../jobs/hooks/useDebounce";
import { savePreference } from "../store/preferenceSlice";
import { useDispatch } from "react-redux";

export const useRelevantJobs = ({ requisitionId, positionId, setActiveTab }) => {

  const user = useSelector((state) => state.user.user);
  const candidateId = user?.data?.user?.id;
  const dispatch = useDispatch();

  /* ---------------- STATE ---------------- */
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [states, setStates] = useState([]);
  const [masterStates, setMasterStates] = useState([]); // ✅ NEW: For candidate preview state/district lookup
  const [locations, setLocations] = useState([]);
  const [masterData, setMasterData] = useState({});
  const [isMasterReady, setIsMasterReady] = useState(false);

  const [requisitions, setRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showHeading, setShowHeading] = useState(false);
  /* ---------------- MODALS ---------------- */
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreCheckModal, setShowPreCheckModal] = useState(false);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [validationErrors, setValidationErrors] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [turnstileToken, setTurnstileToken] = useState("");

  const [previewData, setPreviewData] = useState(null);
  const [interviewCentres, setInterviewCentres] = useState([]);
  const [infoDocs, setInfoDocs] = useState([]);
  const [activeInfoType, setActiveInfoType] = useState("");
  const [preferenceCount, setPreferenceCount] = useState(3); // ✅ NEW: Track number of state preferences (1 or 3)

  const [applyForm, setApplyForm] = useState({
    state1: "",
    location1: "",
    state2: "",
    location2: "",
    state3: "",
    location3: "",
    ctc: "",
    examCenter: "",
  });

  const [selectedPositionId, setSelectedPositionId] = useState(positionId || "");
  const [sasDocs, setSasDocs] = useState([]);

  /* ---------------- CONSTANTS ---------------- */
  const experienceOptions = [
    { label: "0-1 years", min: 0, max: 1 },
    { label: "1-2 years", min: 1, max: 2 },
    { label: "3-4 years", min: 3, max: 4 },
    { label: "5-6 years", min: 5, max: 6 },
    { label: "7-8 years", min: 7, max: 8 },
    { label: "9-10 years", min: 9, max: 10 },
    { label: "11+ years", min: 11, max: Infinity },
  ];

  /* ---------------- HELPERS ---------------- */
  const isApplicationOpen = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return today <= end;
  };

  const getExperienceRangeInMonths = () => {
    if (!selectedExperience.length) return { monthMinExp: null, monthMaxExp: null };
    const min = Math.min(...selectedExperience.map(e => e.min));
    const hasInfinity = selectedExperience.some(e => e.max === Infinity);
    const max = hasInfinity ? null : Math.max(...selectedExperience.map(e => e.max));
    return { monthMinExp: min * 12, monthMaxExp: max === null ? 0 : max * 12 };
  };

  // ✅ NEW: Helper to validate local language proficiency
  const validateLocalLanguageProficiency = () => {
    // Check if local language proficiency is required
    if (!selectedJob?.isProficientInLocalLanguage) {
      return { isValid: true, error: null };
    }

    // Get position state distributions
    const positionStateDistributions = selectedJob?.positionStateDistributions || [];
    if (positionStateDistributions.length === 0) {
      return { isValid: true, error: null };
    }

    // Get the selected state ID from statePreference1
    const selectedStateId = applyForm.state1;
    if (!selectedStateId) {
      return { isValid: false, error: "Please select a state preference first" };
    }

    // Find the matching position state distribution for the selected state
    const matchingStateDistribution = positionStateDistributions.find(
      dist => dist.stateId === selectedStateId
    );

    if (!matchingStateDistribution) {
      return { isValid: false, error: "Selected state is not available for this position" };
    }

    // Get the required local language ID for this state
    const requiredLanguageId = matchingStateDistribution.localLanguage;
    if (!requiredLanguageId) {
      return { isValid: true, error: null };
    }

    // Get candidate's languages from preview data
   // const candidateLanguages = previewData?.languagesKnown || [];

    // Find if candidate has the required language with proficiency
    // const hasRequiredLanguage = candidateLanguages.some(lang =>
    //   lang.languageId === requiredLanguageId &&
    //   lang.canRead &&
    //   lang.canWrite &&
    //   lang.canSpeak
    // );

    // if (!hasRequiredLanguage) {
    //   return {
    //     isValid: false,
    //     error: `You must be proficient in the local language (Read, Write, Speak) for the selected state`
    //   };
    // }

    return { isValid: true, error: null };
  };


  const handleDepartmentChange = (id) => {
    setSelectedDepartments(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleStateChange = (id) => {
    setSelectedStates(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleExperienceChange = (exp) => {
    setSelectedExperience(prev =>
      prev.some(e => e.label === exp.label)
        ? prev.filter(e => e.label !== exp.label)
        : [...prev, exp]
    );
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedStates([]);
    setSelectedExperience([]);
    setSelectedRequisition("");
  };
  /* ---------------- FETCHERS ---------------- */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const res = await jobsApiService.getMasterData();
        const mapped = mapMasterDataApi(res);

        // 🔥 SORT STATES (ascending by name)
        const sortedStates = (mapped.states || []).sort((a, b) =>
          a.state_name.localeCompare(b.state_name)
        );

        //const statesRes = await masterApi.getStatesData();
        // const zonalStates = Array.isArray(statesRes.data)
        //   ? mapZonalStatesApi(statesRes.data)
        //   : [];

        setMasterData(mapped); // ✅ Keep with regular master states for address lookups
        setStates(sortedStates);
        // setStates(zonalStates); // ✅ Zonal states for location preferences in jobs
        setMasterStates(sortedStates); // ✅ Master states for address state/district lookup
        setDepartments(mapped.departments || []);
        setLocations(mapped.cities || []);
        setIsMasterReady(true);
      } catch (err) {
        console.error("Failed to load masters", err);
      }
    };

    loadMasters();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize]);
  // Initialize with requisitionId when provided
  useEffect(() => {
    if (requisitionId) {
      // Set the selected requisition from URL
      setSelectedRequisition(requisitionId);
      // Clear other filters to show only this requisition
      setSelectedDepartments([]);
      setSelectedStates([]);
      setSelectedExperience([]);
      setSearchTerm("");
      setCurrentPage(0);
    }
  }, [requisitionId]);

  // Initialize with positionId when provided
  useEffect(() => {
    if (positionId) {
      setSelectedPositionId(positionId);
      setCurrentPage(0);
    } else {
      // Clear position when URL param is removed
      setSelectedPositionId("");
    }
  }, [positionId]);


  useEffect(() => {
    if (!infoDocs?.length) return;

    const fetchSasUrls = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          infoDocs.map(async (doc) => {
            const res = await masterApi.getSasUrl(doc.fileUrl);
            const cleanedFileUrl = res.replace(/\s+/g, "");
            return {
              ...doc,
              sasUrl: cleanedFileUrl, // SAS URL from backend
            };
          })
        );

        setSasDocs(results);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchSasUrls();
  }, [infoDocs]);


  // Auto-trigger apply modal when both requisitionId and positionId are provided
  useEffect(() => {
    if (requisitionId && positionId && jobs.length > 0) {
      // Find the job that matches the positionId
      const jobToApply = jobs.find(job => job.position_id === positionId);

      if (jobToApply) {
        setSelectedJob(jobToApply);
        setShowPreCheckModal(true);
      }
    }
  }, [jobs, requisitionId, positionId]);
  // ✅ Fetch requisitions
  const fetchRequisitions = async () => {
    try {

      const response = await jobsApiService.getActiveRequisitions();
      const apiData = response?.data || [];
      const mappedRequisitions = mapRequisitionsApiToList(apiData);
      setRequisitions(mappedRequisitions);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      toast.error("No active requisitions found");
    }
  };



  const fetchInterviewCentres = async () => {
    try {
      const res = await jobsApiService.getInterviewCentres(); // 🔁 adjust method name if needed

      const mappedCentres = mapInterviewCentresApi(res);
      setInterviewCentres(mappedCentres);
    } catch (err) {
      console.error("Failed to load interview centres", err);
      toast.error("Failed to load interview centres");
      setInterviewCentres([]);
    }
  };


  useEffect(() => {
    fetchRequisitions();
    fetchInterviewCentres();
  }, []);


  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize]);

  const fetchJobs = async () => {
    if (!candidateId || !isMasterReady) return;

    try {
      setLoading(true);
      const { monthMinExp, monthMaxExp } = getExperienceRangeInMonths();
      const payload = {
        searchText: requisitionId ? "" : (debouncedSearchTerm || ""),
        candidateId,
        deptIds: selectedDepartments,
        stateIds: selectedStates,
        requisitionId: selectedRequisition || null, // Use selectedRequisition or null (not the URL param)
        page: currentPage,
        size: pageSize,
        monthMinExp,
        monthMaxExp
      };

      const res = await jobsApiService.getJobPositions(payload); // POST

      const pageData = res?.data;
      let jobsData = pageData?.content || [];

      // Filter by selectedPositionId if it's set
      if (selectedPositionId) {
        jobsData = jobsData.filter(job => job.positionsDTO?.positionId === selectedPositionId);
      }
      const mappedJobs = mapJobsApiToList(jobsData, masterData, states);
      setJobs(mappedJobs);
      setTotalPages(selectedPositionId ? 1 : (pageData?.totalPages ?? 0)); // Show only 1 page if filtering by position

    } catch (err) {
      //toast.error("Failed to load jobs");
      setJobs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [currentPage]);
  /* ---------------- ACTIONS ---------------- */
  const handleConfirmApply = async () => {
    if (!selectedJob || !candidateId) return;

    try {
      const payload = {
        candidateId,
        positionId: selectedJob.position_id,

        statePreference1: applyForm.state1 || null,
        cityPreference1: applyForm.location1 || null,
        locationPreference1: applyForm.location1 || null,

        statePreference2: applyForm.state2 || null,
        cityPreference2: applyForm.location2 || null,
        locationPreference2: applyForm.location2 || null,

        statePreference3: applyForm.state3 || null,
        cityPreference3: applyForm.location3 || null,
        locationPreference3: applyForm.location3 || null,

        expectedCtc: Number(applyForm.ctc) || 0,
        interviewCenter: applyForm.examCenter || "",
      };

      const response = await jobsApiService.applyToJob(payload);
      if (response?.success) {
        toast.success("Job applied Successfully");
        //setShowPreferenceModal(false);
        setShowPaymentModal(false);
        setActiveTab("applied-jobs"); // ✅ correct

      } else {
        toast.error(response?.message || "Failed to apply for the job");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    }
  };


  const handleKnowMore = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handlePreCheckConfirm = async () => {
    setShowPreCheckModal(false);

    try {
      const response = await jobsApiService.validateCandidateEligibility({
        candidateId,
        positionId: selectedJob.position_id,
      });

      if (!response?.success) {
        setShowHeading(false); // hide heading
        setValidationErrors([response?.message]);
        setShowValidationErrorModal(true);
        return;
      }

console.log("response.data", response.data)
console.log("response.data.eligibilityValidationReferenceDate", response.data.eligibilityValidationReferenceDate)
      const errors = extractValidationErrors(response.data, response.data.eligibilityValidationReferenceDate);
      // ❌ SHOW ERROR MODAL ONLY IF ERRORS EXIST
      if (errors.length > 0) {
        setShowHeading(true); // show heading
        setValidationErrors(errors);
        setShowValidationErrorModal(true);
        return;
      }

      // ✅ NO ERRORS → OPEN PREVIEW MODAL
      setApplyForm({
        state1: "",
        location1: "",
        state2: "",
        location2: "",
        state3: "",
        location3: "",
        ctc: "",
        examCenter: "",
      });

      setShowPreviewModal(true);

    } catch (err) {
      setShowHeading(false);
      setValidationErrors(["Unable to validate profile. Please try again."]);
      setShowValidationErrorModal(true);
    }
  };

  // const handleProceedToPayment = () => {
  //   const errors = {};

  //   const isCtcRequired =
  //     selectedJob?.employment_type?.toLowerCase() === "contract";

  //   if (isCtcRequired && !applyForm.ctc) {
  //     errors.ctc = "Expected CTC is required";
  //   }

  //   if (!applyForm.examCenter) {
  //     errors.examCenter = "Interview Center is required";
  //   }

  //   if (!previewData) {
  //     toast.error("Candidate data not loaded yet");
  //     return;
  //   }
  //   if (Object.keys(errors).length > 0) {
  //     setFormErrors(errors);
  //     return;
  //   }

  //   // ✅ Clear errors
  //   setFormErrors({});

  //   dispatch(
  //     savePreference({
  //       jobId: selectedJob.position_id,
  //       requisitionId: selectedJob.requisition_id,
  //       preferences: applyForm,
  //     })
  //   );

  //   setShowPreviewModal(false);   // close preview
  //   setShowPaymentModal(true);    // open payment modal
  // };

  const handleProceedToPayment = async () => {
    const errors = {};

    const isCtcRequired =
      selectedJob?.employment_type?.toLowerCase() === "contract";

    if (isCtcRequired && !applyForm.ctc) {
      errors.ctc = "Expected CTC is required";
    }

    if (!applyForm.examCenter) {
      errors.examCenter = "Interview Center is required";
    }
    const shouldShowLanguage =
      selectedJob?.isProficientInLocalLanguage &&
      preferenceCount === 1;

    if (shouldShowLanguage && !applyForm.language) {
      errors.language = "Language preference is required";
    }

    // ✅ NEW: Validate state and location preferences ONLY if they are visible
    const arePreferencesVisible = selectedJob?.isLocationWise || selectedJob?.is_location_preference_enabled;

    if (arePreferencesVisible) {
      if (preferenceCount === 1) {
        const distribution = selectedJob?.positionStateDistributions?.find(
          d => d.stateId === applyForm.state1
        );

        const isLocationRequired = !!distribution?.cityId;
        // When showing only 1 preference, both state1 and location1 are mandatory
        if (!applyForm.state1) {
          errors.state1 = "State preference is required";
        }
        if (isLocationRequired && !applyForm.location1) {
          errors.location1 = "Location preference is required";
        }
        // if (!applyForm.location1) {
        //   errors.location1 = "Location preference is required";
        // }
      }
      // else {
      //   // When showing 3 preferences, at least one state preference is mandatory
      //   const hasAnyState = applyForm.state1 || applyForm.state2 || applyForm.state3;
      //   if (!hasAnyState) {
      //     errors.state1 = "At least one state preference is required";
      //   }
      // }
    }

    // ✅ NEW: Validate local language proficiency
    if (selectedJob?.isProficientInLocalLanguage && applyForm.state1) {
      const languageValidation = validateLocalLanguageProficiency();
      if (!languageValidation.isValid) {
        toast.error(languageValidation.error);
        return;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 🔹 STEP 1: Apply Job FIRST
      // const applyPayload = {
      //   candidateId,
      //   positionId: selectedJob.position_id,
      //   statePreference1: applyForm.state1 || null,
      //   locationPreference1: applyForm.location1 || null,
      //   statePreference2: applyForm.state2 || null,
      //   locationPreference2: applyForm.location2 || null,
      //   statePreference3: applyForm.state3 || null,
      //   locationPreference3: applyForm.location3 || null,
      //   expectedCtc: Number(applyForm.ctc) || 0,
      //   interviewCenter: applyForm.examCenter || "",
      // };

      // const applyResponse = await jobsApiService.applyToJob(applyPayload);

      // if (!applyResponse?.success) {
      //   toast.error("Failed to apply for job");
      //   return;
      // }

      // const applicationId = applyResponse.data.id;

      // 🔹 STEP 2: Get Application Fee
      const feeResponse = await jobsApiService.getApplicationFee();
      if (!feeResponse?.success) {
        toast.error("Failed to fetch application fee");
        return;
      }

      const amount = feeResponse?.data;

      if (!amount) {
        toast.error("Failed to fetch application fee");
        return;
      }

      // 🔹 Save amount and applicationId
      setSelectedJob(prev => ({
        ...prev,
        application_fee: amount
      }));

      dispatch(
        savePreference({
          jobId: selectedJob.position_id,
          requisitionId: selectedJob.requisition_id,
          preferences: applyForm,
        })
      );

      setShowPreviewModal(false);
      setShowPaymentModal(true);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };


  useEffect(() => {
    if (
      !candidateId ||
      !isMasterReady ||
      !selectedJob?.position_id
    ) {
      return;
    }

    // ✅ NEW: Determine preference count based on positionStateDistributions
    const positionStateDistributions = selectedJob?.positionStateDistributions || [];
    if (positionStateDistributions.length > 0) {
      setPreferenceCount(1); // Show only 1 state preference
    } else {
      setPreferenceCount(3); // Show 3 state preferences
    }

    const fetchCandidatePreview = async () => {
      try {
        const response = await jobsApiService.getAllDetails(
          // candidateId,
          selectedJob.position_id
        );

        const mappedPreviewData = mapCandidateToPreview(
          response.data,
          masterData,
          masterStates  // ✅ Pass masterStates for address lookups
        );

        setPreviewData(mappedPreviewData);
      } catch (error) {
        console.error("Failed to fetch candidate preview", error);
        toast.error("Unable to load candidate profile");
      }
    };

    fetchCandidatePreview();
  }, [candidateId, isMasterReady, selectedJob, masterStates]);

  const fetchInfoDocuments = async (type) => {
    try {
      const res = await masterApi.getGenericDocuments();

      const filtered = (res.data || []).filter(
        (doc) => doc.type?.toLowerCase() === type
      );

      if (filtered.length === 0) {
        toast.info("No documents available");
        return;
      }

      setInfoDocs(filtered);
      setActiveInfoType(type);
      setShowInfoModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    }
  };


  useEffect(() => {
    setCurrentPage(0); // backend index
  }, [
    debouncedSearchTerm,
    selectedDepartments,
    selectedStates,
    selectedExperience,
    selectedRequisition,
  ]);


  useEffect(() => {
    if (!isMasterReady) return;

    // 🔹 no search → fetch all
    if (!debouncedSearchTerm) {
      fetchJobs();
      return;
    }

    // 🔹 min 3 characters rule
    if (debouncedSearchTerm.length < 3) return;

    fetchJobs();
  }, [
    isMasterReady,
    currentPage,
    debouncedSearchTerm,   // ✅ debounced value
    selectedDepartments,
    selectedStates,
    selectedExperience,
    selectedRequisition,
    pageSize
  ]);

  return {
    jobs,
    loading,
    departments,
    states,
    masterStates,
    locations,
    requisitions,
    interviewCentres,
    masterData,
    experienceOptions,

    selectedDepartments,
    selectedStates,
    selectedLocations,
    selectedExperience,
    selectedRequisition,
    searchTerm,

    currentPage,
    pageSize,
    totalPages,

    selectedJob,
    showModal,
    showPreviewModal,
    showPaymentModal,
    showPreCheckModal,
    showValidationErrorModal,
    showInfoModal,

    applyForm,
    formErrors,
    validationErrors,
    previewData,
    infoDocs,
    activeInfoType,
    turnstileToken,

    setSelectedJob,
    setShowModal,
    setShowPreviewModal,
    setShowPaymentModal,
    setShowPreCheckModal,
    setShowValidationErrorModal,
    setShowInfoModal,
    setSearchTerm,
    setSelectedRequisition,
    setSelectedDepartments,
    setSelectedStates,
    setSelectedLocations,
    setSelectedExperience,
    setCurrentPage,
    setPageSize,
    setApplyForm,
    setFormErrors,
    setTurnstileToken,
    setSelectedPositionId,

    isApplicationOpen,
    handleConfirmApply,

    handleDepartmentChange,
    handleStateChange,
    handleExperienceChange,
    clearFilters,

    handleKnowMore,
    handlePreCheckConfirm,
    handleProceedToPayment,
    fetchInfoDocuments,

    sasDocs,
    showHeading,
    preferenceCount,  // ✅ NEW: Pass preference count (1 or 3)
  };
};

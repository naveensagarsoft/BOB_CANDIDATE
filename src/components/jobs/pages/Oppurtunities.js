import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";
import { toast } from "react-toastify";
import PreviewModal from "../components/PreviewModal";
import { useSelector } from "react-redux";
import KnowMoreModal from "../components/KnowMoreModal";
import { mapJobsApiToList } from "../../jobs/mappers/jobMapper";
import { mapMasterDataApi } from "../../jobs/mappers/masterDataMapper";
import { useDispatch } from "react-redux";
import { savePreference } from "../store/preferenceSlice";
import { mapCandidateToPreview } from "../../jobs/mappers/candidatePreviewMapper";
import filtericon from "../../../assets/filter-icon.png";
import PaymentModal from "../components/PaymentModal";
import jobsApiService from "../services/jobsApiService";
import ConfirmationModal from "../components/ConfirmationModal";
import ValidationErrorModal from "../components/ValidationErrorModal";
import useDebounce from "../../jobs/hooks/useDebounce";
import start from "../../../assets/start.png";
import end from "../../../assets/end.png";
import Loader from "../../../shared/components/Loader";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
import { extractValidationErrors } from "../../../shared/utils/validationError";
import { useNavigate } from "react-router-dom";
import Banner from '../../../assets/home-banner-2.png'
import masterApi from "../../../services/master.api";

const Oppurtunities = ({ setActiveTab, requisitionId, positionId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [masterStates, setMasterStates] = useState([]); // ✅ NEW: For address state/district lookup
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [masterData, setMasterData] = useState([{}]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [isMasterReady, setIsMasterReady] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [applyForm, setApplyForm] = useState({
    state1: "",
    location1: "",
    state2: "",
    location2: "",
    state3: "",
    location3: "",
    ctc: "",
    examCenter: "",
    language: "",
    languageStudiedIn10or12: false
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [showPreCheckModal, setShowPreCheckModal] = useState(false);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState("");
  const experienceOptions = [
    { label: "1-2 years", min: 1, max: 2 },
    { label: "3-4 years", min: 3, max: 4 },
    { label: "5-6 years", min: 5, max: 6 },
    { label: "7-8 years", min: 7, max: 8 },
    { label: "9-10 years", min: 9, max: 10 },
    { label: "11+ years", min: 11, max: Infinity },
  ];
  const [interviewCentres, setInterviewCentres] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // backend index
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoDocs, setInfoDocs] = useState([]);
  const [activeInfoType, setActiveInfoType] = useState(""); // annexure | general
  const [turnstileToken, setTurnstileToken] = useState("");
  const dispatch = useDispatch();
  const [previewData, setPreviewData] = useState();
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const candidateId = "00000000-0000-0000-0000-000000000000";



  useEffect(() => {
    const initMasters = async () => {
      try {
        const masterRes = await jobsApiService.getMasterData();
        const mapped = mapMasterDataApi(masterRes);

        setDepartments(mapped.departments || []);
        setStates(mapped.states || []);
        setMasterStates(mapped.states || []); // ✅ NEW: Store mapped states for address lookups
        setLocations(mapped.cities || []);
        setMasterData(mapped);
        setIsMasterReady(true);
      } catch (e) {
        toast.error("Failed to load master data");
      }
    };

    initMasters();
  }, []);

  const getExperienceRangeInMonths = () => {
    if (!selectedExperience || selectedExperience.length === 0) {
      return { monthMinExp: null, monthMaxExp: null };
    }

    const minYears = Math.min(...selectedExperience.map(e => e.min));

    const hasInfinity = selectedExperience.some(e => e.max === Infinity);

    const maxYears = hasInfinity
      ? null
      : Math.max(...selectedExperience.map(e => e.max));

    return {
      monthMinExp: minYears * 12,
      monthMaxExp: maxYears === null ? 0 : maxYears * 12
    };
  };

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
        requisitionId: selectedRequisition || (requisitionId ? requisitionId : null),
        page: currentPage,
        size: pageSize,
        monthMinExp,
        monthMaxExp
      };

      const res = await jobsApiService.getOpportunitiesJobPositions(payload); // POST

      const pageData = res?.data;
      let jobsData = pageData?.content || [];

      // Filter by positionId if provided in URL
      if (positionId) {
        jobsData = jobsData.filter(job => job.positionsDTO?.positionId === positionId);
      }

      const mappedJobs = mapJobsApiToList(jobsData, masterData);

      setJobs(mappedJobs);
      setTotalPages(positionId ? 1 : (pageData?.totalPages ?? 0)); // Show only 1 page if filtering by position

    } catch (err) {
      //toast.error("Failed to load jobs");
      setJobs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
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
    // fetchRequisitions();
    // fetchInterviewCentres();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!isMasterReady) return;
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

  useEffect(() => {
    if (
      !candidateId ||
      !isMasterReady ||
      !selectedJob?.position_id
    ) {
      return;
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
  }, [candidateId, isMasterReady, selectedJob]);

  const handlePreCheckConfirm = async () => {
    setShowPreCheckModal(false);

    try {
      const response = await jobsApiService.validateCandidateEligibility({
        candidateId,
        positionId: selectedJob.position_id,
      });

      if (!response?.success) {
        setValidationErrors([response?.message]);
        setShowValidationErrorModal(true);
        return;
      }

      const errors = extractValidationErrors(response.data);
      // SHOW ERROR MODAL ONLY IF ERRORS EXIST
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidationErrorModal(true);
        return;
      }

      // NO ERRORS → OPEN PREVIEW MODAL
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
      setValidationErrorMsg("Unable to validate profile. Please try again.");
      setShowValidationErrorModal(true);
    }
  };

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
        localLanguageId: applyForm.language || null,
        isLocalLanguageStudied: applyForm.languageStudiedIn10or12 || false,
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


  const handleDepartmentChange = (deptId) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };
  const isApplicationOpen = (endDate) => {
    if (!endDate) return false;

    const today = new Date();
    const end = new Date(endDate);

    // Normalize time (important)
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return today <= end;
  };
  const handleStateChange = (stateId) => {
    setSelectedStates((prev) =>
      prev.includes(stateId)
        ? prev.filter((id) => id !== stateId)
        : [...prev, stateId]
    );
  };

  const handleExperienceChange = (range) => {
    setSelectedExperience((prev) =>
      prev.some((r) => r.label === range.label)
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range]
    );
  };
  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedExperience([]);
    setSearchTerm("");
  };

  const handleProceedToPayment = () => {
    const errors = {};

    const isCtcRequired =
      selectedJob?.employment_type?.toLowerCase() === "contract";

    if (isCtcRequired && !applyForm.ctc) {
      errors.ctc = "Expected CTC is required";
    }

    if (!applyForm.examCenter) {
      errors.examCenter = "Interview Center is required";
    }

    if (!previewData) {
      toast.error("Candidate data not loaded yet");
      return;
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // ✅ Clear errors
    setFormErrors({});

    dispatch(
      savePreference({
        jobId: selectedJob.position_id,
        requisitionId: selectedJob.requisition_id,
        preferences: applyForm,
      })
    );

    setShowPreviewModal(false);   // close preview
    setShowPaymentModal(true);    // open payment modal
  };

  return (
    <div className="relevant">
      {loading && <Loader />}
      <div className="w-100">
        <img src={Banner} style={{ width: '100%' }} alt="Banner" />
      </div>
      <div className="p-3">
        <h3 className="py-2 mt-3 text-center" style={{ color: '#162B75', fontWeight: 400 }}>Current Oppurtunities</h3>

        {/* Filters + Job Cards */}
        <div className="row mt-3" id="matched-jobs-container">
          {/* Left Filters (unchanged) */}
          <div
            className="col-md-3 bob-left-fixed-filter bob-mob-side-filter"
            style={{ paddingBottom: "30px" }}
          >
            <div className="bob-left-filter-div">
              <img
                className="filter-icon"
                src={filtericon}
                alt="filter"

              />
              <span className="filter">Filters</span>
            </div>

            <div
              className="bob-left-custom-filter-div"
              style={{
                background: "#fff",
                boxShadow: "0 3px 6px #1a2c7129",
                borderRadius: "10px",
                padding: "20px 10px",
                marginTop: "25px",
                border: "1px solid #eaeaea",
              }}
            >
              <div className="bob-filter-c-div bob-inner-categories-c-div px-3">
                <span className="header_filter">Departments</span>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {departments.map((dept) => (
                    <div key={dept.department_id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedDepartments.includes(dept.department_id)}
                        onChange={() => handleDepartmentChange(dept.department_id)}
                      />
                      <label className="form-check-label label_filter">
                        {dept.department_name}
                      </label>
                    </div>
                  ))}
                </div>

                <h6 className="mt-3 header_filter">States</h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {states
                    .map((state) => (
                      <div key={state.state_id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedStates.includes(state.state_id)}
                          onChange={() => handleStateChange(state.state_id)}
                          id={`state-${state.state_id}`}
                        />
                        <label
                          className="form-check-label label_filter"
                          htmlFor={`state-${state.state_id}`}
                        >
                          {state.state_name}
                        </label>
                      </div>
                    ))}
                </div>
                <h6 className="mt-3 header_filter">Experience</h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {experienceOptions.map((exp) => (
                    <div key={exp.label} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedExperience.some(
                          (r) => r.label === exp.label
                        )}
                        onChange={() => handleExperienceChange(exp)}
                      />
                      <label className="form-check-label label_filter">
                        {exp.label}
                      </label>
                    </div>
                  ))}
                </div>

                {(selectedDepartments.length > 0 || selectedLocations.length > 0 || selectedExperience.length > 0) && (
                  <button
                    className="btn btn-sm btn-outline-secondary mt-3"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Job Cards (original style restored) */}
          <div className="col-md-9">
            {/* 🔹 Search and Requisition Dropdown */}
            <div className="d-flex justify-content-between mb-3">
              <div className="d-flex" style={{ flex: 1 }}>
                <div style={{ minWidth: "325px" }}>
                  {/* <select
                    className="form-select"
                    value={selectedRequisition}
                    onChange={(e) => setSelectedRequisition(e.target.value)}
                  >
                    <option value="">All Requisitions</option>
                    {requisitions
                      .filter((req) => req.requisition_status === "Approved")
                      .map((req) => (
                        <option key={req.requisition_id} value={req.requisition_id}>
                          {req.requisition_title || `Requisition ${req.requisition_id}`}
                        </option>
                      ))}
                  </select> */}
                </div>
              </div>

              {/* <select
                className="form-select form-select-sm"
                style={{ width: "90px" }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select> */}


              <div className="d-flex align-items-center gap-2">


                <div className="applied-search">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Job title or Req code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                </div>
              </div>
            </div>
            {/* ================= EMPTY STATE (ADDED) ================= */}
            {!loading && jobs.length === 0 && (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
                <div className="text-center">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size="3x"
                    className="text-muted mb-3"
                  />
                  <h5 className="text-muted">No current opportunities</h5>
                  <p className="text-muted small">
                    Please check back later or adjust your filters.
                  </p>
                </div>
              </div>
            )}
            {jobs.map((job) => (
              <div className="col-md-12 mb-4" key={job.position_id}>
                <div
                  className="card h-100"
                  style={{
                    background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
                    boxShadow: "0px 8px 20px rgba(0, 123, 255, 0.15)",
                    borderRadius: "12px",
                    border: "1px solid #eaeaea",
                  }}
                >
                  <div className="card-body job-main-header-sec">
                    <div className="left_content">
                      {/* ===== Requisition code + dates row ===== */}
                      <div className="req-date-row">
                        <span className="req-code">
                          {job.requisition_title} ({job.requisition_code})
                        </span>

                        <span className="date-item">
                          {/* <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" /> */}
                          <img src={start} className="date-icon" alt="start"></img>
                          Start: {formatDateDDMMYYYY(job.registration_start_date)}
                        </span>

                        <span className="date-divider">|</span>

                        <span className="date-item">
                          <img src={end} className="date-icon" alt="end"></img>
                          End: {formatDateDDMMYYYY(job.registration_end_date)}
                        </span>
                      </div>
                      <h6 className="job-title titlecolor">
                        {job.position_title}
                      </h6>
                      <p className="mb-1 text-mutedd small size35">
                        <span className="subtitle">Employment Type:</span>{" "}
                        {job.employment_type}
                      </p>
                      <p className="mb-1 text-mutedd small size35">
                        <span className="subtitle">Eligibility Age:</span>{" "}
                        {job.eligibility_age_min} - {job.eligibility_age_max} years
                      </p>
                      <p className="mb-1 text-mutedd small size30">
                        <span className="subtitle">Experience:</span>{" "}
                        {job.mandatory_experience}
                      </p>
                      <p className="mb-1 text-mutedd small size35">
                        <span className="subtitle">Department:</span>{" "}
                        {job.dept_name}
                      </p>
                      {/* <p className="mb-1 text-mutedd small size35">
                        <span className="subtitle">Location:</span>{" "}
                        {job.state_name}
                      </p> */}
                      {job.employment_type === "contract" && (
                        <p className="mb-1 text-mutedd small size35">
                          <span className="subtitle">Contract Period:</span>{" "}
                          {job.contract_period} Years
                        </p>
                      )}
                      <p className="mb-1 text-mutedd small size30">
                        <span className="subtitle">Vacancies:</span>{" "}
                        {job.no_of_vacancies}
                      </p>
                      <p className="mb-1 text-mutedd small qualification">
                        <span className="subtitle">Qualification:</span>{" "}
                        {job.mandatory_qualification}
                      </p>
                      <p className="mb-1 text-mutedd small qualification">
                        <span className="subtitle">States:</span>{" "}
                        {job.state_name}
                      </p>
                    </div>
                    <div className="justify-content-between align-items-center apply_btn">
                      {isApplicationOpen(job.registration_end_date) ? (
                        <button
                          className="btn btn-sm btn-outline-primary hovbtn"
                          onClick={() => {
                            navigate(`/candidate-portal/${job.requisition_id}/${job.position_id}`);

                          }}
                        >
                          Apply Now
                        </button>) : (
                        <span className="text-danger fw-semibold small">
                          Application Closed
                        </span>
                      )}
                      <button
                        className="btn btn-sm knowntb"
                        onClick={() => handleKnowMore(job)}
                      >
                        Know More
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            ))}

            {jobs.length > 0 && (
              <div className="d-flex justify-content-start mb-3">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "90px" }}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}

            {totalPages > 1 && (
              <ul className="pagination pagination-sm justify-content-center">
                <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                  >
                    ‹
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                  >
                    ›
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Original Know More Modal (unchanged) */}
      <KnowMoreModal
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedJob={selectedJob}
        masterData={masterData}
      />
      <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        previewData={previewData}
        selectedJob={selectedJob}
        masterData={masterData}

        preferenceCount={1}
        applyForm={applyForm}
        onApplyFormChange={(name, value) =>
          setApplyForm(prev => ({ ...prev, [name]: value }))
        }
        onProceedToPayment={handleProceedToPayment}
        onEditProfile={() => {
          localStorage.setItem("activeStep", "2");
          setActiveTab("info");
          setShowPreviewModal(false);
        }}
        onBack={() => {
          setShowPreviewModal(false);
          setShowApplyModal(true);
        }}
        formErrors={formErrors}                 // ✅ PASS ERRORS
        setFormErrors={setFormErrors}           // ✅ PASS SETTER
        interviewCentres={interviewCentres}
        setTurnstileToken={setTurnstileToken}
      />

      <PaymentModal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          setActiveTab('applied-jobs');
        }}
        selectedJob={selectedJob}
        candidateId={candidateId}
        user={user}
        onPaymentSuccess={handleConfirmApply}
        token={turnstileToken}
      />

      <ConfirmationModal
        show={showPreCheckModal}
        onCancel={() => setShowPreCheckModal(false)}
        onConfirm={handlePreCheckConfirm}
      />

      <ValidationErrorModal
        show={showValidationErrorModal}
        onClose={() => setShowValidationErrorModal(false)}
        errors={validationErrors}
      />


      <Modal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        size="xl"
        centered
        dialogClassName="info-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {activeInfoType === "annexures"
              ? "Annexure Form"
              : "Generic Information"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="info-modal-body">
          {infoDocs.map((doc) => (
            <div key={doc.id} className="pdf-wrapper">
              <div className="pdf-title">{doc.fileName}</div>

              <iframe
                src={doc.fileUrl}
                title={doc.fileName}
                className="pdf-iframe"
              />
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Oppurtunities;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import "../../../css/Relevantjobs.css";
import PreviewModal from "../components/PreviewModal";
import KnowMoreModal from "../components/KnowMoreModal";
import filtericon from "../../../assets/filter-icon.png";
import PaymentModal from "../components/PaymentModal";
import ConfirmationModal from "../components/ConfirmationModal";
import ValidationErrorModal from "../components/ValidationErrorModal";
import Vector from "../../../assets/Vector.png";
import Group from "../../../assets/Group.png";
import start from "../../../assets/start.png";
import end from "../../../assets/end.png";
import Loader from "../../../shared/components/Loader";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
import { useRelevantJobs } from "../hooks/useRelevantJobs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";
const RelevantJobs = ({ setActiveTab, requisitionId, positionId }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.data?.user?.id;

  const {
    /* ================= DATA ================= */
    jobs,
    loading,
    departments,
    states,
    requisitions,
    masterData,
    interviewCentres,
    previewData,
    activeInfoType,
    /* ================= FILTER STATE ================= */
    selectedDepartments,
    selectedStates,
    selectedExperience,
    selectedRequisition,
    searchTerm,

    /* ================= PAGINATION ================= */
    currentPage,
    pageSize,
    totalPages,

    /* ================= UI STATE ================= */
    selectedJob,
    showModal,
    showPreviewModal,
    showPaymentModal,
    showPreCheckModal,
    showValidationErrorModal,
    showInfoModal,

    /* ================= FORMS ================= */
    applyForm,
    formErrors,
    validationErrors,
    turnstileToken,

    /* ================= CONSTANTS ================= */
    experienceOptions,

    /* ================= SETTERS ================= */
    setSelectedJob,
    setShowModal,
    setShowPreviewModal,
    setShowPaymentModal,
    setShowPreCheckModal,
    setShowValidationErrorModal,
    setShowInfoModal,
    setSearchTerm,

    setSelectedRequisition,
    setCurrentPage,
    setPageSize,
    setApplyForm,
    setFormErrors,
    setTurnstileToken,
    setSelectedPositionId,

    /* ================= ACTIONS ================= */
    handleDepartmentChange,
    handleStateChange,
    handleExperienceChange,
    clearFilters,
    handleConfirmApply,
    isApplicationOpen,

    handleKnowMore,
    handlePreCheckConfirm,
    handleProceedToPayment,
    fetchInfoDocuments,
    sasDocs,
    showHeading,
    preferenceCount,  // ✅ NEW: Track number of state preferences
  } = useRelevantJobs({ requisitionId, positionId, setActiveTab });
  const requisitionOptions = [
    {
      value: "",
      label: "All Requisitions"
    },
    ...requisitions
      .filter(req => req.requisition_status === "APPROVED")
      .map(req => ({
        value: req.requisition_id,
        label: req.requisition_code + " - " + req.requisition_title || `Requisition ${req.requisition_id}`
      }))
  ];

  const customSelectStyles = {
    // Wrap text inside dropdown menu options
    option: (provided) => ({
      ...provided,
      whiteSpace: "normal",
      wordBreak: "break-word",
      lineHeight: "1.4",
    }),

    // Keep ellipsis inside selected control box
    singleValue: (provided) => ({
      ...provided,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),

    valueContainer: (provided) => ({
      ...provided,
      overflow: "hidden",
    }),

    // Optional: increase control height slightly if needed
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
    }),
  };

  return (
    <div className="mx-4 my-3 relevant">
      {loading && <Loader />}

      {/* Filters + Job Cards */}
      <div className="row" id="matched-jobs-container">
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
            {(selectedDepartments.length > 0 ||
              selectedStates.length > 0 ||
              selectedExperience.length > 0) && (
                <button
                  className="btn btn-sm btn-outline-secondary mb-3"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
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
                {experienceOptions?.map((exp) => (
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


            </div>
          </div>
        </div>

        {/* Right Job Cards (original style restored) */}
        <div className="col-md-9 mb-3">
          {/* 🔹 Search and Requisition Dropdown */}
          <div className="d-flex justify-content-between mb-3">
            {/* <div className="d-flex" style={{ flex: 1 }}>
              <div style={{ minWidth: "325px" }}>
                <select
                  className="form-select"
                  value={selectedRequisition}
                  onChange={(e) => {
                    const newRequisitionId = e.target.value;
                    if (newRequisitionId !== requisitionId) {
                      navigate('/candidate-portal', { replace: true });
                      setActiveTab('jobs');
                      setSelectedPositionId(""); // Clear selected position
                      setSelectedRequisition(newRequisitionId);
                      setCurrentPage(0);
                    } else {
                      setSelectedRequisition(newRequisitionId);
                    }
                  }}
                >
                  <option value="">All Requisitions</option>
                  {requisitions
                    .filter((req) => req.requisition_status === "APPROVED")
                    .map((req) => (
                      <option key={req.requisition_id} value={req.requisition_id}>
                        {req.requisition_title || `Requisition ${req.requisition_id}`}
                      </option>
                    ))}
                </select>
              </div>
            </div> */}


            <div className="requisition-select-wrapper">
              <Select
                options={requisitionOptions}
                value={
                  requisitionOptions.find(opt => opt.value === selectedRequisition) || null
                }
                onChange={(selectedOption) => {
                  const newRequisitionId = selectedOption?.value || "";

                  if (newRequisitionId !== requisitionId) {
                    navigate('/candidate-portal', { replace: true });
                    setActiveTab('jobs');
                    setSelectedPositionId("");
                    setSelectedRequisition(newRequisitionId);
                    setCurrentPage(0);
                  } else {
                    setSelectedRequisition(newRequisitionId);
                  }
                }}
                styles={customSelectStyles}
                classNamePrefix="requisition-select"
              />
            </div>


            <div className="d-flex align-items-center gap-2">
              <button
                className="info_btn"
                onClick={() => fetchInfoDocuments("annexures")}
              >
                <img src={Group} alt="Group" className="annexure_group me-2" />
                Annexure Forms
              </button>
              <button
                className="info_btn"
                onClick={() => fetchInfoDocuments("generic")}
              >
                <img src={Vector} alt="Vector" className="generic_group me-2" />
                Generic Information
              </button>
              <div className="applied-search">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by Title or Req code..."
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
                    <div className="d-flex gap-2">
                      <span className="req-code" title={`${job.requisition_title} - ${job.requisition_code}`}>
                        {job.requisition_title} ({job.requisition_code})
                      </span>

                      <div className="dates_relevantjobs">
                        <span className="date-item">
                          <img src={start} className="date-icon" alt="start"></img>
                          Start: {formatDateDDMMYYYY(job.registration_start_date)}
                        </span>

                        &nbsp;&nbsp;|&nbsp;&nbsp;

                        <span className="date-item">
                          <img src={end} className="date-icon" alt="end"></img>
                          End: {formatDateDDMMYYYY(job.registration_end_date)}
                        </span>
                      </div>
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
                    {/* <p className="mb-1 text-muted small size30">
                      <span className="subtitle">Experience:</span>{" "}
                      {job.isMandatoryExpMonthsEduWise
                        ? (job.mandatory_exp_edu_wise_text || "—")
                        : (job.mandatory_experience || "—")}
                    </p> */}
                    <p className="mb-1 text-mutedd small size35 pe-2">
                      <span className="subtitle">Department:</span>{" "}
                      {job.dept_name}
                    </p>
                    {job?.employment_type?.toLowerCase() === "contract" && (
                      <p className="mb-1 text-mutedd small size35">
                        <span className="subtitle">Contract Period:</span>{" "}
                        {job.contract_period || "N/A"}
                      </p>
                    )}
                    <p className="mb-1 text-mutedd small size30">
                      <span className="subtitle">Vacancies:</span>{" "}
                      {job.no_of_vacancies}
                    </p>
                    <p className="mb-1 text-muted small qualification">
                      <span className="subtitle">Qualification:</span>{" "}
                      <span style={{ whiteSpace: "pre-line" }}>
                        {job.mandatory_qualification}
                      </span>
                    </p>
                    <p className="mb-1 text-muted small qualification">
                      <span className="subtitle">Experience:</span>{" "}
                      {job.isMandatoryExpMonthsEduWise
                        ? (job.mandatory_exp_edu_wise_text || "—")
                        : (job.mandatory_experience || "—")}
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
                          setSelectedJob(job);
                          setShowPreCheckModal(true);
                        }}
                      >
                        Apply Now
                      </button>) : (
                      <p className="text-danger fw-semibold small mb-2 application-closed">
                        Application Closed
                      </p>
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

      {/* ✅ Original Know More Modal (unchanged) */}
      <KnowMoreModal
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedJob={selectedJob}
        masterData={masterData}
        //zonalStates={states}
      />
      <PreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        previewData={previewData}
        selectedJob={selectedJob}
        masterData={masterData}
        //zonalStates={states}
        states={states}
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
        // onBack={() => {
        //   setShowPreviewModal(false);
        //   setShowApplyModal(true);
        // }}
        formErrors={formErrors}                 // ✅ PASS ERRORS
        setFormErrors={setFormErrors}           // ✅ PASS SETTER
        interviewCentres={interviewCentres}
        setTurnstileToken={setTurnstileToken}
        preferenceCount={preferenceCount}       // ✅ NEW: Pass preference count
      />

      <PaymentModal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          //setActiveTab('applied-jobs');
        }}
        selectedJob={selectedJob}
        candidateId={candidateId}
        user={user}
      //  onPaymentSuccess={handleConfirmApply}
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
        showHeading={showHeading}
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
          {sasDocs.map((doc) => (
            <div key={doc.id} className="pdf-wrapper">
              <div className="pdf-title">{doc.fileName}</div>

              <iframe
                src={doc.sasUrl}
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

export default RelevantJobs;

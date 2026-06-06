import useAppliedJobs from "../hooks/useAppliedJobs";
import Loader from "../../../shared/components/Loader";
import TrackApplicationModal from "../../jobs/components/TrackApplicationModal";
import OfferLetterModal from "../../jobs/components/OfferLetterModal";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import start from "../../../assets/start.png";
import end from "../../../assets/end.png";
import download from "../../../assets/download.png";
import "../../../css/Appliedjobs.css";
import PaymentModal from "../components/PaymentModal";
const AppliedJobs = () => {

  const {
    appliedJobs,
    searchTerm,
    listLoading,
    downloadLoading,
    selectedJob,
    showTrackModal,
    offerData,
    showOfferModal,
    pageSize,
    currentPage,
    totalPages,
    setSearchTerm,
    setSelectedJob,
    setShowTrackModal,
    setShowOfferModal,
    setPageSize,
    setCurrentPage,
    handleViewOffer,
    handleDownloadApplication,
    fetchAppliedJobs,
    masterData,
    shouldHideDownload,
    handleRetryPayment,
    formatStatusLabel,
    showPaymentModal,    
    setShowPaymentModal,
    isRequisitionExpired,
  } = useAppliedJobs();


  return (
    <div className="applied-jobs-page px-4 py-3">
       {(listLoading || downloadLoading) && <Loader />}

      {/* ===== PAGE HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="mb-0 appliedheader">Job Applications</span>
       
        {/* Search Bar */}
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

      {!listLoading && appliedJobs.length === 0 && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
          <div className="text-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="3x"
              className="text-muted mb-3"
            />
            <h5 className="text-muted">No applied jobs found</h5>
            <p className="text-muted small">
              Please apply to jobs in Current Opportunities.
            </p>
          </div>
        </div>
      )}

      {appliedJobs.map((job) => {
        const isPaymentFailed = job.application_status === "APPLIED" && job.payment_status !== "SUCCESS";
        const isExpired = isRequisitionExpired(job.registration_end_date);
        const hideDownload = shouldHideDownload(job.registration_end_date);
        return (
          <div className="applied-job-card mb-3" key={job.position_id}>
            {/* Header */}
            <div className="row  align-items-center">
              <div className="col-md-9 d-grid">
                <div className="d-flex gap-2">
                  <span className="req-code">
                    {job.requisition_title} ({job.requisition_code})
                  </span>
                  <div className="dates">
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
                <h6 className="job-title titlecolor mt-1">
                  {job.position_title}
                </h6>
                <div className="row mt-2">
                  <div className="col-md-4">
                    <span className="label me-1 fw-500 dark_text">Application Number:</span>
                    <span className="value"> {job?.reference_number?.trim() ? job.reference_number : "-"}</span>
                  </div>

                  <div className="col-md-4">
                    <span className="label me-1 fw-500 dark_text">Eligibility Age:</span>
                    <span className="value">
                      {job.eligibility_age_min} – {job.eligibility_age_max} years
                    </span>
                  </div>

                  <div className="col-md-4">
                    <span className="label me-1 fw-500 dark_text">Applied On:</span>
                    <span className="value">{formatDateDDMMYYYY(job.application_date)}</span>
                  </div>

                  <div className="col-md-4 my-2">
                    <span className="label me-1 fw-500 dark_text">Employment Type:</span>
                    <span className="value">{job.employment_type}</span>
                  </div>

                  <div className="col-md-4 my-2">
                    <span className="label me-1 fw-500 dark_text">Experience:</span>
                    <span className="value">{job.mandatory_experience}</span>
                  </div>

                  <div className="col-md-4 my-2">
                    <span className="label me-1 fw-500 dark_text">Vacancies:</span>
                    <span className="value">{job.no_of_vacancies}</span>
                  </div>

                  <div className="col-md-12">
                    <span className="label me-1 fw-500 dark_text">Department:</span>
                    <span className="value">{job.dept_name}</span>
                  </div>

                  <div className="col-md-12 mt-2">
                    <span className="label me-1 fw-500 dark_text">Qualification:</span>
                    <span className="value">{job.mandatory_qualification}</span>
                  </div>
                </div>
              </div>

              

              <div className="col-md-3 align-items-center">


              <div className="col-md-12 d-flex justify-content-end align-items-center gap-2">

                  {/* Status Badge */}
                  {/* <div
                    className={`status-badge ${job.application_status
                      ? job.application_status.toLowerCase().replace(/_/g, "-")
                      : "applied"}`}
                  >
                    {job.application_status === "OFFER_AWAITED"
                      ? "Selected"
                      : formatStatusLabel(job.application_status)}
                  </div> */}


                  <div
                    className={`status-badge 
                      ${job.application_status
                        ? job.application_status.toLowerCase().replace(/_/g, "-")
                        : "applied"}
                      ${isPaymentFailed ? "payment-failed" : ""}
                    `}
                  >
                    {isPaymentFailed
                      ? "Payment Failed"
                      : job.application_status === "OFFER_AWAITED"
                      ? "Selected"
                      : formatStatusLabel(job.application_status)}
                  </div>

                  {/* Retry Payment Button */}
                  {isPaymentFailed && (
                    <button
                      className={`retry-btn ${isExpired ? 'disabled' : ''}`}
                      onClick={() => !isExpired && handleRetryPayment(job)}
                      disabled={isExpired}
                    >
                      {isExpired ? "Application Closed" : "Retry Payment"}
                    </button>
                  )}

                </div>

                
                {!isPaymentFailed && !hideDownload && (
                  <div className="col-md-12 justify-content-end d-flex">
                    <button
                      className="footer-link downloadbtn"
                      onClick={() => handleDownloadApplication(job)}
                    >
                    <img src={download} className="dowload-icon me-1" alt="end"></img>Download Application
                    </button>
                  </div>
                )}
                <div className={`col-md-12 justify-content-end d-flex ${hideDownload ? 'mt-3' : ''}`}>
                  {(
                    job.application_status === "OFFERED" ||
                    job.application_status === "OFFER_ACCEPTED" ||
                    job.application_status === "OFFER_REJECTED"
                  ) && (
                      <>
                        <button
                          className="footer-link me-2"
                          onClick={() => {
                            setSelectedJob(job);
                            handleViewOffer(job);
                          }}
                        >
                          View Offer
                        </button>

                        <span className="footer-separator me-2">|</span>
                      </>
                    )}
                     {!isPaymentFailed && (
                  <button
                    className={`footer-link action_items ${isPaymentFailed ? 'mt-3' : ''}`}
                    onClick={() => {
                      setSelectedJob(job);
                      setShowTrackModal(true);
                    }}
                  >
                    Track Application
                  </button>
      )}
                </div>
              </div>
            </div>
          </div>
        )})}

      {appliedJobs.length > 0 && (
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

      {appliedJobs.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination pagination-sm">
            {/* Prev */}
            <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
              >
                ‹
              </button>
            </li>

            {/* Pages */}
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

            {/* Next */}
            <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
              >
                ›
              </button>
            </li>
          </ul>
        </div>
      )}

      <TrackApplicationModal
        show={showTrackModal}
        onHide={() => setShowTrackModal(false)}
        job={selectedJob}
        onDecisionSuccess={() => fetchAppliedJobs(masterData)}
      />

      <OfferLetterModal
        show={showOfferModal}
        onHide={() => setShowOfferModal(false)}
        offerData={offerData}
        onDecisionSuccess={() => fetchAppliedJobs(masterData)}
        applicationStatus={selectedJob?.application_status}
      />
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        selectedJob={selectedJob}
      />
    </div>
  );
};

export default AppliedJobs;

import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "../../../css/TrackApplicationModal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import jobsApiService from "../../jobs/services/jobsApiService";
import { useSelector } from "react-redux";
import RequestHistory from "../../jobs/components/RequestHistory";
import CompensationSection from "../../jobs/components/CompensationSection";
import { toast } from "react-toastify";
import DiscrepancyUploadSection from "./DiscrepancyUploadSection";
import { formatDateDDMMYYYY } from "../../../shared/utils/dateUtils";
import masterApi from "../../../services/master.api";
const TrackApplicationModal = ({ show, onHide, job, onDecisionSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef();
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [description, setDescription] = useState("");
  const userData = useSelector((state) => state.user.user);
  const candidateId = userData?.data?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMap, setStatusMap] = useState({});
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);

  const [currentSubStatus, setCurrentSubStatus] = useState(null);
  const [isTerminal, setIsTerminal] = useState(false);
  //job?.employment_type 
  const isContract = job?.employment_type === "Contract";
  const [rejectedDocsCount, setRejectedDocsCount] = useState(0);
  //  MAIN STAGES (CLEANED STRUCTURE)
  const steps = [
    { label: "Applied", key: "APPLIED" },
    { label: "Shortlisted", key: "SHORTLISTED" },
    { label: "Interview Scheduled", key: "SCHEDULED" },
    { label: "Selected", key: "SELECTED" },
    { label: "Offer", key: "OFFERED" }
  ];

  const [requestHistory, setRequestHistory] = useState([]);
  const handleHistoryLoad = useCallback((historyList) => {
    setRequestHistory(historyList || []);
  }, []);

  const pendingRequestTypeIds = React.useMemo(() => {
    const latestByType = new Map();

    [...requestHistory]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .forEach((item) => {
        const typeId = String(item.request_type_id);

        if (!latestByType.has(typeId)) {
          latestByType.set(typeId, item.status?.toUpperCase());
        }
      });

    return new Set(
      [...latestByType.entries()]
        .filter(([, status]) => status === "PENDING" || status === "PROGRESS")
        .map(([typeId]) => typeId)
    );
  }, [requestHistory]);



  const filteredRequestTypes =
    currentSubStatus === "DISCREPANCY" || currentSubStatus === "PENDING"
      ? requestTypes.filter((type) =>
        [
          "submit date extension",
          "zone office change request",
        ].includes(type.requestName?.toLowerCase())
      ) : currentSubStatus === "SHORTLISTED" || currentSubStatus === "SCHEDULED" || currentSubStatus === "APPLIED" || currentSubStatus === "SCHEDULE_PENDING" || currentSubStatus === "RESCHEDULED" || currentSubStatus === "RESCHEDULE_PENDING"

        ? requestTypes.filter((type) =>
          ["zone office change request"].includes(
            type.requestName?.toLowerCase()
          )
        ) : currentSubStatus === "OFFERED"
          ? requestTypes.filter((type) =>
            ["joining date extension"].includes(
              type.requestName?.toLowerCase()
            )
          ) : currentSubStatus === "PROVISIONALLY_APPROVED"
            ? requestTypes.filter((type) =>
              [
                "submit date extension",

              ].includes(type.requestName?.toLowerCase())
            )
            : requestTypes;


  const [examCenter, setExamCenter] = useState("");
  const [interviewCentreOptions, setInterviewCentreOptions] = useState([]);
  const [loadingInterviewCentres, setLoadingInterviewCentres] = useState(false);

  const selectedRequestTypeObj = requestTypes.find(
    (t) => String(t.requestTypeId) === String(selectedRequestType)
  );


  const isZonalChange =
    selectedRequestTypeObj?.requestName?.toLowerCase() === "zone office change request";

  useEffect(() => {
    if (!show) return;

    setLoadingInterviewCentres(true);

    const orgTypes = ["Zonal Office"];

    masterApi
      .getInterviewCentresByState(orgTypes, "")
      .then((res) => {
        const centres = Array.isArray(res.data)
          ? res.data
          : [];

        const currentInterviewCenter =
          job?.candidate_location_preference?.interviewCenter;

        console.log(
          "CURRENT INTERVIEW CENTER =>",
          job?.candidate_location_preference?.interviewCenter
        );

        console.log(
          "APPLICATION STATUS =>",
          job?.application_status
        );


        const isScheduled =
          job?.application_status?.toUpperCase() === "SCHEDULED";

        const filteredCentres =
          isScheduled && currentInterviewCenter
            ? centres.filter(
              (item) =>
                item.interviewCentreId !== currentInterviewCenter
            )
            : centres;

        setInterviewCentreOptions(filteredCentres);
      })
      .catch((err) => {
        console.error("Failed to fetch interview centres", err);
        setInterviewCentreOptions([]);
      })
      .finally(() => {
        setLoadingInterviewCentres(false);
      });

  }, [show, job]);

  //  Map backend main status to index
  const mainStatusToIndex = {
    APPLIED: 0,
    SHORTLISTED: 1,
    SCHEDULED: 2,
    SELECTED: 3,
    OFFERED: 4
  };

  // Terminal states (freeze progress)
  const terminalSubStatuses = [
    "REJECTED",
    // "DISQUALIFIED",
    "CANCELLED",
    //  "OFFER_REJECTED" 
  ];

  const [errors, setErrors] = useState({});
  const [deadline, setDeadline] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const hasActiveDiscrepancy =
    currentSubStatus === "DISCREPANCY";

  const compensationStatuses = [
    "COMPENSATION_PENDING",
    "COMPENSATION_RENEGOTIATE",
    "COMPENSATION_RENEGOTITATE",
    "COMPENSATION_APPROVED",
    "COMPENSATION_REJECTED",
  ];

  const [compensationStatus, setCompensationStatus] = useState(null);

  const hasProvisionallyApproved =
    currentSubStatus === "PROVISIONALLY_APPROVED";
  useEffect(() => {
    if (show) {
      setErrors({});
      setSelectedRequestType("");
      setDescription("");
      setSelectedFile(null);
      setDeadline(null);
      setRejectedDocsCount(0);
      setExamCenter("");
      setRequestDate("");
    }
  }, [show]);



  const resetModalState = () => {
    setErrors({});
    setSelectedRequestType("");
    setDescription("");
    setSelectedFile(null);
    setRejectedDocsCount(0);
    setDeadline(null);
    setCurrentSubStatus(null);
    setRequestDate("");
  };

  const handleClose = () => {
    resetModalState();
    onHide();
  };




  const fetchCompensationStatus = async () => {
    try {
      const res = await jobsApiService.getCompensationDetails(job?.application_id);

      if (res?.success && res?.data) {
        setCompensationStatus(res.data.compensationStatus);
      }
    } catch (e) {
      console.error("Failed to fetch compensation status");
    }
  };




  useEffect(() => {
    if (show && job?.application_id) {
      fetchRequestTypes();
      fetchApplicationStatus();
      fetchCompensationStatus(); //  ADD THIS
    }
  }, [show, job?.application_id]);





  const fetchApplicationStatus = async () => {
    try {
      if (!job?.application_id) return;

      const res = await jobsApiService.getApplicationStatus(job.application_id);
      // const list = Array.isArray(res?.data) ? res.data : [];

      // if (!list.length) return;

      // // Sort by latest actionDate
      // const sorted = [...list].sort(
      //   (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
      // );


      const list = Array.isArray(res?.data) ? res.data : [];
      if (!list.length) return;

      const map = {};
      list.forEach(item => {
        map[item.status] = item.actionDate;
      });
      setStatusMap(map);

      const sorted = [...list].sort(
        (a, b) => new Date(b.actionDate) - new Date(a.actionDate)
      );


      const latest = sorted[0];
      // Determine main stage
      let mainStage = latest.status;

      // Normalize Interview stage
      if (["SCHEDULED", "RESCHEDULED",
        "RESCHEDULE_PENDING", "PROVISIONALLY_APPROVED", "QUALIFIED", "DISQUALIFIED", "ZONAL_REJECTED", "ZONAL_ABSENT", "INTERVIEW_ABSENT"]
        .includes(mainStage)) {
        mainStage = "SCHEDULED";

      }
      if (
        [
          "SCHEDULE_PENDING"
        ].includes(mainStage)
      ) {
        mainStage = "SHORTLISTED";
      }

      // Normalize all offer related statuses
      if (
        [
          "OFFER_AWAITED",
          "OFFER_SENT",
          "OFFER_REJECTED",
          "OFFER_ACCEPTED",
          "OFFERED"
        ].includes(mainStage)
      ) {
        mainStage = "OFFERED";
      }



      if (isContract) {
        const selectedSubStatuses = [
          "SELECTED",
          "COMPENSATION_PENDING",
          "COMPENSATION_APPROVED",
          "COMPENSATION_REJECTED",
          "COMPENSATION_RENEGOTITATE",
          "COMPENSATION_RENEGOTIATE"
        ];

        if (selectedSubStatuses.includes(latest.status)) {
          mainStage = "SELECTED";
        }
      }



      const index = mainStatusToIndex[mainStage] ?? 0;

      setCurrentIndex(index);
      setCurrentSubStatus(latest.status);

      // Check terminal
      setIsTerminal(
        terminalSubStatuses.includes(latest.status)
      );

    } catch (err) {
      console.error("Failed to fetch application status", err);
    }
  };


  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + " " +
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
  };


  const handleSubmitRequest = async () => {
    try {
      if (!validateRequestForm()) return;

      const applicationId = job?.application_id;
      if (!candidateId || !applicationId) {
        toast.error("Missing candidate or application details");
        return;
      }

      const formData = new FormData();
      console.log("Final Payload:", {
        requestTypeId: selectedRequestType,
        description,
        applicationId,
        dateExtension: !isZonalChange && requestDate ? new Date(requestDate).toISOString() : null
      });

      formData.append(
        "createThreadRequestModel",
        new Blob(
          [
            JSON.stringify({
              requestTypeId: selectedRequestType,
              description,
              applicationId,
              // dateExtension: deadline ? new Date(deadline).toISOString() : null
              dateExtension: !isZonalChange && requestDate
                ? `${requestDate}T00:00:00.000Z`
                : null,
              zonalId: isZonalChange ? examCenter : null,
            }),
          ],
          { type: "application/json" }
        )
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (pendingRequestTypeIds.has(String(selectedRequestType))) {
        toast.error("This request is already pending.");
        return;
      }

      await jobsApiService.createCandidateThread(formData);

      toast.success("Request submitted successfully");

      // reset
      setSelectedRequestType("");
      setDescription("");
      setSelectedFile(null);
      setErrors({});
      setRequestDate("");
      setExamCenter("");
      // setDeadline();

      //onHide();
      //  Trigger history refresh
      setRefreshHistoryKey(prev => prev + 1);
    } catch (error) {
      console.error("Submit request failed", error);
      toast.error("Failed to submit request");
    }
  };
  const validateRequestForm = () => {
    const newErrors = {};

    if (!selectedRequestType) {
      newErrors.requestType = "Please select a request type";
    }

    if (!description.trim()) {
      newErrors.description = "Please enter query details";
    }

    // Date validation
    if (!isZonalChange) {

      if (!requestDate) {
        newErrors.deadline = "Please select a date";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(requestDate);

        if (selectedDate < today) {
          newErrors.deadline = "Past dates are not allowed";
        }
      }
    }
    if (isZonalChange && !examCenter) {
      newErrors.examCenter = "Please select interview center";
    }
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      newErrors.file = "Invalid file type selected";
    }
    setErrors(newErrors);


    return Object.keys(newErrors).length === 0;
  };


  const fetchRequestTypes = async () => {
    try {
      const response = await jobsApiService.getRequestTypes();

      const list = Array.isArray(response?.data)
        ? response.data
        : [];

      setRequestTypes(list);
    } catch (error) {
      console.error("Failed to fetch request types", error);
      setRequestTypes([]);
    }
  };

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
  ];
  const MAX_SIZE_MB = 5; // optional

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newErrors = {};

    //  File type validation
    if (!allowedTypes.includes(file.type)) {
      newErrors.file = "Only PDF, DOC, DOCX, JPG, PNG files are allowed";
    }

    //  File size validation
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      newErrors.file = `File size must be less than ${MAX_SIZE_MB}MB`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    //  valid file
    setErrors(prev => ({ ...prev, file: "" }));
    setSelectedFile(file);
  };
  const handleDocsLoad = useCallback((count) => {
    setRejectedDocsCount(count);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  if (!job) return null;




  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static" dialogClassName="track-application-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Track Application Status
          <div className="job-subtitle">{job.position_title}</div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* ===== STATUS STEPPER ===== */}
        <div className="status-stepper">
          {steps.map((step, index) => {

            const state =
              index < currentIndex
                ? "completed"
                : index === currentIndex
                  ? "current"
                  : "pending";

            return (
              <div className="step-item" key={step.key}>

                {/* Connector Line */}
                {index !== 0 && (
                  <div className={`step-line ${index <= currentIndex ? "active" : ""}`} />
                )}

                <div className={`step-circle ${state}`}>
                  {state === "completed" ? "✓" : index + 1}
                </div>

                <div className="step-content">
                  <div className="step-title">{step.label}</div>

                  {/* Add This */}
                  {statusMap[step.key] && (
                    <div className="step-date">
                      {formatDateTime(statusMap[step.key])}
                    </div>
                  )}


                  {index === currentIndex && step.key !== "COMPENSATION" && (
                    <div className="step-status-label">
                      {state === "current" ? "Current Stage" : ""}
                    </div>
                  )}

                  {/*  Sub Status Badge */}
                  {index === currentIndex &&
                    currentSubStatus &&
                    step.key !== "COMPENSATION" && (   //  ADD THIS LINE
                      <div className={`sub-status-chip ${terminalSubStatuses.includes(currentSubStatus)
                        ? "chip-danger"
                        : currentSubStatus === "DISCREPANCY"
                          ? "chip-warning"
                          : "chip-primary"
                        }`}>
                        {currentSubStatus.replaceAll("_", " ")}
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {/* {isTerminal && (
          <div className="alert alert-danger mt-3">
            Your application has been {currentSubStatus.replaceAll("_", " ")}.
          </div>
        )} */}


        {rejectedDocsCount > 0 && (
          <div className="alert alert-danger mb-3">
            <strong>Documents Rejected!</strong>{" "}
            Please re-upload the required documents
            {deadline && (
              <> before <strong>{formatDateDDMMYYYY(deadline)}</strong></>
            )}{" "}
            to proceed.
          </div>
        )}

        {(currentSubStatus === "DISCREPANCY" ||
          currentSubStatus === "PROVISIONALLY_APPROVED") && (
            <DiscrepancyUploadSection
              applicationId={job?.application_id}
              status={currentSubStatus}
              onSuccess={fetchApplicationStatus}
              onHide={onHide}
              onDecisionSuccess={onDecisionSuccess}
              onDeadlineLoad={setDeadline}   //  new
              onDocsLoad={handleDocsLoad}
            />
          )}

        {(!hasActiveDiscrepancy && !hasProvisionallyApproved) &&
          isContract &&
          //  &&
          //  ["NEW", "RENEGOTIATE"].includes(compensationStatus) 

          compensationStatuses.includes(currentSubStatus) && (
            <CompensationSection applicationId={job?.application_id} onHide={onHide} compensationStatus={compensationStatus} />
          )}

        {/* ===== SUBMIT REQUEST ===== */}
        {((steps[currentIndex]?.key === "OFFERED" && currentSubStatus === "OFFERED") || currentSubStatus === 'DISCREPANCY' || currentSubStatus === 'APPLIED' || currentSubStatus === 'SCHEDULED' || currentSubStatus === 'SHORTLISTED' || currentSubStatus === 'PROVISIONALLY_APPROVED' || currentSubStatus === 'SCHEDULE_PENDING' || currentSubStatus === 'RESCHEDULED' || currentSubStatus === 'RESCHEDULE_PENDING' || currentSubStatus === 'PENDING') && (
          <div className="query-section bank-style">
            <h6 className="section-title">Submit Your Request</h6>

            <div className="row g-4">
              {/* LEFT SIDE */}
              <div className="col-md-7 ">
                <div className="mb-2">
                  <label htmlFor="RequestType" className="form-label">
                    Request Type <span className="text-danger">*</span>
                  </label>

                  <select
                    id="RequestType"
                    className="form-select"
                    value={selectedRequestType}
                    onChange={(e) => {
                      setSelectedRequestType(e.target.value);
                      // setErrors(prev => ({ ...prev, requestType: "" }));
                      setErrors((prev) => ({
                        ...prev,
                        requestType: "",
                        description: "",
                        deadline: "",
                        examCenter: "",
                        file: "",
                      }));
                    }}
                  >
                    <option value="">Select Request Type</option>
                    {filteredRequestTypes.map(type => {
                      const isPending = pendingRequestTypeIds.has(
                        String(type.requestTypeId)
                      );

                      return (
                        <option
                          key={type.requestTypeId}
                          value={type.requestTypeId}
                          disabled={isPending}
                        >
                          {type.requestName}
                          {isPending}
                        </option>
                      );
                    })}
                  </select>

                  {errors.requestType && (
                    <div className="invalid-feedback d-block">
                      {errors.requestType}
                    </div>
                  )}

                </div>

                {isZonalChange && (
                  <div className="mb-2">
                    <label htmlFor="examCenter" className="form-label">
                      Interview Center <span className="text-danger">*</span>
                    </label>

                    <select
                      className={`form-control ${errors?.examCenter ? "is-invalid" : ""}`}
                      value={examCenter}
                      onChange={(e) => {
                        setExamCenter(e.target.value);
                        setErrors((prev) => ({ ...prev, examCenter: "" }));
                      }}
                    >
                      <option value="">Select Interview Center</option>

                      {loadingInterviewCentres && (
                        <option disabled>Loading interview centres...</option>
                      )}

                      {interviewCentreOptions.map((centre) => (
                        <option key={centre.interviewCentreId} value={centre.interviewCentreId}>
                          {centre.displayName}
                        </option>
                      ))}
                    </select>

                    {errors.examCenter && (
                      <div className="invalid-feedback d-block">{errors.examCenter}</div>
                    )}
                  </div>
                )}

                {/* <div>
                  <label htmlFor="description" className="form-label">
                    Query Details <span className="text-danger">*</span>
                  </label>

                  <textarea
                  id="description"
                    className="form-control"
                    rows="3"
                    placeholder="Describe your query here..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors(prev => ({ ...prev, description: "" }));
                    }}
                  />

                  {errors.description && (
                    <div className="invalid-feedback d-block">
                      {errors.description}
                    </div>
                  )}
                </div> */}
                <div className="row">
                  {/* LEFT → TEXTAREA */}
                  <div className="col-md-8">
                    <label htmlFor="description" className="form-label">
                      Query Details <span className="text-danger">*</span>
                    </label>

                    <textarea
                      id="description"
                      className="form-control"
                      rows="3"
                      placeholder="Describe your query here..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setErrors(prev => ({ ...prev, description: "" }));
                      }}
                    />

                    {errors.description && (
                      <div className="invalid-feedback d-block">
                        {errors.description}
                      </div>
                    )}
                  </div>

                  {/* RIGHT → DATE PICKER */}
                  {!isZonalChange && (
                    <div className="col-md-4">
                      <label htmlFor="deadline" className="form-label">
                        Select Date <span className="text-danger">*</span>
                      </label>

                      <input
                        type="date"
                        id="deadline"
                        className={`form-control ${errors.deadline ? "is-invalid" : ""}`}
                        value={requestDate || ""}
                        onChange={(e) => {
                          setRequestDate(e.target.value);
                          setErrors((prev) => ({ ...prev, deadline: "" }));

                        }}

                        min={new Date().toISOString().split("T")[0]}
                      />

                      {errors.deadline && (
                        <div className="invalid-feedback d-block">
                          {errors.deadline}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="col-md-5">
                <label htmlFor="file" className="form-label">Attachment (Optional)</label>

                {/* Upload Card */}
                <div
                  className="upload-card"
                  onClick={handleUploadClick}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faUpload} className="text-secondary mb-2" size="2x" />
                  <div className="upload-text">
                    {selectedFile ? selectedFile.name : "Upload document"}
                  </div>
                  <div className="upload-subtext">PDF, DOC, DOCX, JPG, PNG</div>
                </div>

                {/* Hidden File Input */}
                <input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept=".pdf,.doc,.jpg,.png"
                  onChange={handleFileSelect}
                />
                {errors.file && (
                  <div className="invalid-feedback d-block">
                    {errors.file}
                  </div>
                )}
                {/* ACTIONS */}
                <div className="query-actions">
                  {/* <button
                    className="btn btn-outline-secondary"
                    onClick={onHide}
                  >
                    Cancel
                  </button> */}
                  <button
                    className="btn btn-primaryy"
                    onClick={handleSubmitRequest}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* ===== REQUEST HISTORY ===== */}

        <div className="query-section bank-style request-history">
          <h6 className="section-title">Request History</h6>

          <RequestHistory applicationId={job?.application_id} requestTypes={requestTypes} refreshKey={refreshHistoryKey} onHistoryLoad={handleHistoryLoad} />


        </div>

      </Modal.Body>
    </Modal>
  );
};

export default TrackApplicationModal;

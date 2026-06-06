import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import jobsApiService from "../../jobs/services/jobsApiService";
import viewIcon from '../../../assets/view-icon.png';
import { handleEyeClick } from "../../../shared/utils/fileDownload";
import Loader from "../../../shared/components/Loader";
import masterApi from "../../../services/master.api";
import profileApi from "../../profile/services/profile.api";
import { Accordion, OverlayTrigger, Tooltip } from "react-bootstrap";

import I_icon from '../../../assets/Vector.png';

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

const DiscrepancyUploadSection = ({ applicationId, status, onSuccess, onHide, onDecisionSuccess, onDeadlineLoad, onDocsLoad }) => {
  const [docs, setDocs] = useState([]);
  const [uploads, setUploads] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deadline, setDeadline] = useState(null);
  const [docTypeMap, setDocTypeMap] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const validateDocCodes = [
    "BIRTH_CERT",
    "PAYSLIP1",
    "PAYSLIP2",
    "PAYSLIP3",
    "COMMUNITY_CERT",
    "SERVICE",
    "DISABILITY",
    "TENTH",
    "BOARD"
  ];

  const fetchDocumentTypes = useCallback(async () => {
    try {
      const res = await masterApi.getDocumentTypes(); // your API

      if (!res?.success) return;

      const map = {};
      res.data.forEach(type => {
        map[type.documentTypeId] = {
          docCode: type.docCode,
          keywords: type.keywords
        };
      });

      setDocTypeMap(map);
    } catch (err) {
      console.error("Failed to fetch document types", err);
    }
  }, []);

  const fetchDocs = useCallback(async () => {
    try {


      let response;

      if (status === "DISCREPANCY") {
        response = await jobsApiService.getRejectDocuments(applicationId);
      }

      if (status === "PROVISIONALLY_APPROVED") {
        response = await jobsApiService.getProvisionallyApprovedDocs(applicationId);
      }

      //const response = await jobsApiService.getRejectDocuments(applicationId);
      if (response.success) {
        const deadlineDate = response.data.submitBeforeDate || null;
        setDeadline(deadlineDate || null);
        if (onDeadlineLoad) {
          onDeadlineLoad(deadlineDate);
        }
        const docsList = response.data.rejectedDocuments || [];
        setDocs(docsList);

        if (onDocsLoad) {
          onDocsLoad(docsList.length);   // 👈 send count to parent
        }
        if (docsList.length >= 1) {
          await fetchDocumentTypes();
        }
      }
      else {
        toast.error(response.message || "Failed to load rejected documents");
      }


    } catch {
      toast.error("Failed to load rejected documents");
    }
  }, [applicationId, status, onDeadlineLoad, onDocsLoad, fetchDocumentTypes]);

  useEffect(() => {
    fetchDocs();
  }, [applicationId, fetchDocs]);
  const handleChange = (e, doc) => {
    const file = e.target.files[0];
    if (!file) return;

    // File type validation
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [doc.candidateDocumentId]:
          "Only PDF, DOC, DOCX, JPG, PNG files are allowed"
      }));

      return;
    }

    // Clear error if valid
    setErrors(prev => ({
      ...prev,
      [doc.candidateDocumentId]: ""
    }));

    // Store file using candidateDocumentId (IMPORTANT)
    setUploads(prev => ({
      ...prev,
      [doc.candidateDocumentId]: file
    }));
  };
  const validateUploads = (docs, uploads) => {
    const errors = {};

    docs.forEach(doc => {
      if (!uploads[doc.candidateDocumentId]) {
        errors[doc.candidateDocumentId] = "Please upload the document";
      }
    });

    return errors;
  };

  const validateSingleDocument = async (docCode, file, displayName) => {
    try {
      const res = await profileApi.ValidateDocument(docCode, file);
      if (!res?.data) {
        toast.error(`Invalid Document: ${displayName}`);
        return false;
      }
      return true;
    } catch {
      toast.error(`Invalid Document: ${displayName}`);
      return false;
    }
  };

  const uploadByStatus = async (status, formData, verificationId) => {
    if (status === "DISCREPANCY") {
      return jobsApiService.reUploadSingleDocument(formData, verificationId);
    }

    if (status === "PROVISIONALLY_APPROVED") {
      return jobsApiService.reUploadzonalSingleDocument(formData, verificationId);
    }

    return null;
  };

  const processDocumentUpload = async (doc, uploads, docTypeMap, validateDocCodes, status, setErrors) => {
    const file = uploads[doc.candidateDocumentId];
    const documentType = docTypeMap[doc.documentId];

    if (!documentType) {
      toast.error("Document type not found");
      return false;
    }

    const { docCode } = documentType;
    const shouldValidate = validateDocCodes.includes(docCode);

    if (shouldValidate) {
      const isValid = await validateSingleDocument(docCode, file, doc.displayName);
      if (!isValid) return false;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await uploadByStatus(status, formData, doc.verificationId);

    if (response?.success === false) {
      setErrors(prev => ({
        ...prev,
        [doc.candidateDocumentId]:
          response?.message || `Upload failed for ${doc.displayName}`
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const newErrors = validateUploads(docs, uploads);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      for (const doc of docs) {
        const success = await processDocumentUpload(
          doc,
          uploads,
          docTypeMap,
          validateDocCodes,
          status,
          setErrors
        );

        if (!success) return;
      }

      toast.success("All documents uploaded successfully");

      await fetchDocs();
      onSuccess();
      setUploads({});
      setErrors({});

      // Close modal and refresh page
      if (onHide) {
        onHide();
      }

      onDecisionSuccess?.();

    } catch (error) {
      console.error("Upload Error:", error);

      // ❌ No toast here for field errors
      // Only unexpected system errors can use toast if needed
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);

      const res =
        await jobsApiService.getScreeningComments(
          applicationId
        );

      setComments(res?.data?.comments || []);
    } catch (err) {
      console.error(
        "Failed to fetch comments",
        err
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [applicationId]);

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      toast.error("Comment is required");
      return;
    }

    if (trimmedComment.length > 2000) {
      toast.error(
        "Comment cannot exceed 2000 characters"
      );
      return;
    }

    try {
      await jobsApiService.postScreeningComment(
        applicationId,
        {
          commentText: trimmedComment,
        }
      );

      setNewComment("");

      await fetchComments();

    } catch (err) {
      console.error(
        "Failed to post comment",
        err
      );

      toast.error("Failed to post comment");
    }
  };

  const formatDateTime = (date) => {
    return new Date(date)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(/\//g, "/");
  };

  if (!loading && docs.length === 0) {
    return null;
  }

  return (

    <div className="mt-4 p-3 border rounded bg-light discrepancy-section">
      {loading && <Loader />}

      <h6 className="section-title mb-3">
        Re-upload Rejected Documents
      </h6>

      {/* {deadline && (
        <div className="alert alert-warning mb-3">
          <strong>Deadline:</strong> {new Date(deadline).toLocaleDateString()} {new Date(deadline).toLocaleTimeString()}
        </div>
      )} */}

      <div className="row">

        {docs.map(doc => {
          console.log("doc", doc)
          let comment = "";
          if (status === "DISCREPANCY") {
            comment = doc.docScreeningComments;
          } else if (status === "PROVISIONALLY_APPROVED") {
            comment = doc.zonalHrDocComments;
          } else {
            comment = ""; // safe fallback
          }

          return (
            <div key={doc.candidateDocumentId} className="col-md-6 mb-3">
              <div className="p-2 border rounded bg-white">
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <label>
                    {doc.displayName} <span className="text-danger">*</span>
                  </label>

                  <div className="d-flex align-items-center gap-2">
                    {/* ℹ️ INFO ICON */}
                    {comment && (

                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-${doc.candidateDocumentId}`}>
                            <div style={{ whiteSpace: "pre-line" }}>
                              Comments: {comment}
                            </div>
                          </Tooltip>
                        }
                      >
                        <span style={{ cursor: "pointer", color: "#F26522" }}>
                          <img src={I_icon} alt="info_icon" className="icon-18" />
                        </span>
                      </OverlayTrigger>
                    )}

                    {/* 👁 VIEW ICON */}
                    {(uploads[doc.candidateDocumentId] || doc.fileUrl) && (
                    <div
                      onClick={() => {
                        const uploadedFile = uploads[doc.candidateDocumentId];

                        if (uploadedFile) {
                          const previewUrl = URL.createObjectURL(uploadedFile);
                          window.open(previewUrl, "_blank");
                        } else if (doc.fileUrl) {
                          handleEyeClick(doc.fileUrl);
                        }
                      }}
                    >
                      <img
                        src={viewIcon}
                        alt="View"
                        style={{ width: "25px", cursor: "pointer" }}
                      />
                    </div>
                    )}



                  </div>
                </div>

                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleChange(e, doc)}
                />


                {errors[doc.candidateDocumentId] && (
                  <div className="invalid-feedback d-block">
                    {errors[doc.candidateDocumentId]}
                  </div>
                )}

                {/* {uploads[doc.candidateDocumentId] && (
                <small className="text-success">
                  {uploads[doc.candidateDocumentId].name}
                </small>
              )} */}
              </div>
            </div>
          )
        })}
      </div>


      <div className="query-actions">
        {docs.length > 0 && (
          <button
            className="btn btn-primaryy"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>


        )}
      </div>

      {/* COMMENTS ACCORDION */}
        {status === "DISCREPANCY" && (
          <div className="comments-discrepancy">
            <Accordion className="mt-4" onSelect={(eventKey) => {
              setActiveAccordion(eventKey);

              // ONLY FETCH WHEN OPENED
              if (
                eventKey === "0" &&
                applicationId
              ) {
                fetchComments();
              }
            }}>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#2f3a8f",
                    }}
                  >
                    Comments
                  </span>
                </Accordion.Header>

                <Accordion.Body
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    background: "#fff",
                  }}
                >
                  {commentsLoading ? (
                    <div className="text-center py-3">
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div
                      className="text-center py-3"
                      style={{
                        color: "#777",
                        fontSize: "0.875rem",
                      }}
                    >
                      No comments found
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mb-3">
                      {comments.map((c) => {
                        const isCandidate =
                          c.userRole?.toUpperCase() ===
                          "CANDIDATE";

                        return (
                          <div
                            key={c.id}
                            className={`d-flex ${
                              isCandidate
                                ? "justify-content-end"
                                : "justify-content-start"
                            }`}
                          >
                            <div
                              style={{
                                maxWidth: "75%",
                                padding: "10px 14px",
                                borderRadius: "16px",
                                background: isCandidate
                                  ? "#dbeafe"
                                  : "#f1f1f1",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              {/* ROLE */}
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                  color: "#2f3a8f",
                                  marginBottom: "4px",
                                }}
                              >
                                {c.userRole
                                  ?.replaceAll("_", " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, char =>
                                    char.toUpperCase()
                                  )}
                              </div>

                              {/* MESSAGE */}
                              <div
                                style={{
                                  fontSize: "0.92rem",
                                  color: "#222",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {c.commentText}
                              </div>

                              {/* TIME */}
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#777",
                                  marginTop: "6px",
                                  textAlign: "right",
                                }}
                              >
                                {formatDateTime(c.createdDate)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* INPUT */}
                  <textarea
                    className="form-control mt-3"
                    rows={3}
                    maxLength={2000}
                    placeholder="Enter your comment..."
                    value={newComment}
                    onChange={(e) =>
                      setNewComment(e.target.value)
                    }
                  />

                  {/* CHARACTER COUNT */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "0.75rem",
                      color: "#777",
                      marginTop: "4px",
                    }}
                  >
                    {newComment.length}/2000
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      className="btn"
                      onClick={handleAddComment}
                      style={{
                        backgroundColor: "#f47c2c",
                        color: "#fff",
                        fontSize: "0.875rem",
                      }}
                    >
                      Send
                    </button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        )}
    </div>
  );
};

export default DiscrepancyUploadSection;

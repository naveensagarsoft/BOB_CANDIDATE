import { Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import jobsApiService from "../services/jobsApiService";
import "../../../css/Offerletter.css";
import masterApi from "../../../services/master.api";

const OfferLetterModal = ({ show, onHide, offerData, onDecisionSuccess, applicationStatus }) => {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [medicalLocations, setMedicalLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    const fetchMedicalLocations = async () => {
      if (!show) return;
      setIsLoadingLocations(true);
      const orgTypes = ["Zonal Office", "Regional Office"];
      try {
        const response = await masterApi.getInterviewCentresByState(orgTypes, "");
        setMedicalLocations(response.data || []);
      } catch (error) {
        console.error("Failed to fetch medical locations:", error);
        toast.error("Failed to load medical locations");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchMedicalLocations();
  }, [show]);

  if (!offerData) return null;

  console.log("Offer Data in Modal:", offerData);

  const handleDecision = async (accepted) => {
    if (!accepted && !comments.trim()) {
      setCommentError("Please enter comments before rejecting the offer");
      return;
    }

    if (accepted && !selectedLocation) {
      toast.error("Please select a medical location");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        applicationId: offerData.applicationId,
        status: accepted ? "OFFER_ACCEPTED" : "OFFER_REJECTED",
        medicalCentreId: selectedLocation,
        comments: comments || ""
      };

      await jobsApiService.updateOfferDecision(payload);

      toast.success(
        accepted ? "Offer accepted successfully" : "Offer rejected successfully"
      );

      setComments("");
      onDecisionSuccess?.();
      onHide();
    } catch (err) {
      toast.error("Failed to submit decision");
    } finally {
      setLoading(false);
    }
  };

  const modalHeight =
    applicationStatus !== "OFFERED"
      ? "75vh"
      : "57vh";

      const isAcceptanceExpired = (() => {
  if (!offerData?.acceptBeforeDate) return false;

  const today = new Date();
  const acceptDate = new Date(offerData.acceptBeforeDate);

  today.setHours(0, 0, 0, 0);
  acceptDate.setHours(23, 59, 59, 999);

  return today > acceptDate;
})();

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="offer-modal">
      <Modal.Header className="py-3 px-3" closeButton>
        <Modal.Title className="lettertitle">Offer Letter</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ height: modalHeight, padding: 0 }}>
        {/* <iframe
          src={offerData.fileUrl}   // FROM API
          title="Offer Letter"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        /> */}
        {offerData?.offerLetterUrl ? (
          <iframe
            src={offerData.offerLetterUrl}
            title="Offer Letter"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <span className="text-muted">Loading offer letter…</span>
          </div>
        )}
      </Modal.Body>

      {applicationStatus === "OFFERED" && (
      <Modal.Footer className="flex-row align-items-stretch">
        <div className="row gx-3">
          {/* MEDICAL LOCATION - Left Column */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="medicalLocation" className="form-label">Medical Location</label> <span className="text-danger">*</span>
              <select 
               id="medicalLocation"
                className="form-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={isLoadingLocations}
              >
                <option value="">Select Medical Location</option>
                {medicalLocations.map((location) => (
                  <option
                    key={location.interviewCentreId}
                    value={location.interviewCentreId}
                  >
                    {location.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* COMMENTS - Right Column */}
          <div className="col-md-6">
            <div className="mb-3 h-100 d-flex flex-column">
              <label htmlFor="comments" className="form-label">Comments</label>
              <textarea
              id="comments"
                className="form-control flex-grow-1"
                placeholder="Enter comments..."
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  if (commentError) setCommentError("");
                }}
              />
              {commentError && (
                <div className="invalid-feedback d-block">
                  {commentError}
                </div>
              )}
            </div>
          </div>
        </div>
{isAcceptanceExpired && (
  <div className="w-100 mb-2">
    <div className="alert alert-danger py-2 mb-0">
  Acceptance/Rejection date expired on{" "}
{new Date(offerData.acceptBeforeDate)
  .toLocaleDateString("en-GB")}
    </div>
  </div>
)}
        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-end gap-2 w-100">
          <button
            className="btn btn-danger"
            disabled={loading || isAcceptanceExpired}
            onClick={() => handleDecision(false)}
          >
            Reject
          </button>

          <button
            className="btn btn-success"
            disabled={loading || isAcceptanceExpired}
            onClick={() => handleDecision(true)}
          >
            Accept
          </button>
        </div>

      </Modal.Footer>
      )}

    </Modal>
  );
};

export default OfferLetterModal;
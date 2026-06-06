import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "../../../css/PaymentModal.css";
import jobsApiService from "../services/jobsApiService";
import { toast } from "react-toastify";
 import { useSelector } from "react-redux";

const PaymentModal = ({
  show,
  onHide,
  selectedJob,
  candidateId,
  user,
  onPaymentSuccess,
  token
}) => {
  const amount =
    (selectedJob?.application_fee);
    const applicationId = selectedJob?.applicationId;


   

const preferenceData = useSelector(state => state.preference);
const [isProcessing, setIsProcessing] = useState(false);
//payload for apply
const buildApplyPayload = () => {
  const data = preferenceData?.preferenceData || {};
  const prefs = data?.preferences || {};

  return {
    candidateId,
    positionId: data?.jobId,   // ✅ correct

    statePreference1: prefs.state1 || null,
    locationPreference1: prefs.location1 || null,

    statePreference2: prefs.state2 || null,
    locationPreference2: prefs.location2 || null,

    statePreference3: prefs.state3 || null,
    locationPreference3: prefs.location3 || null,

    expectedCtc:Number(prefs.ctc) || 0,
    interviewCenter: prefs.examCenter || "",
    localLanguageId: prefs.language || null,
    isLocalLanguageStudied: prefs.languageStudiedIn10or12 || false
    
  };
};


const handleCCAvenuePayment = async () => {

   // ✅ Prevent double click
  if (isProcessing) return;

  setIsProcessing(true);
  try {
    let applicationIdToUse = selectedJob?.applicationId;

    // ✅ CASE: NEW APPLICATION
    if (!applicationIdToUse) {
      const applyPayload = buildApplyPayload();

      if (!applyPayload?.positionId) {
        toast.error("Invalid application data");
        return;
      }

      const applyRes = await jobsApiService.applyToJob(applyPayload);

      if (!applyRes?.success) {
        toast.error("Failed to apply for job");
        return;
      }

      applicationIdToUse = applyRes?.data?.id;

      if (!applicationIdToUse) {
        toast.error("Application ID not found");
        return;
      }

    }

    // 🔹 INITIATE PAYMENT
    const response = await jobsApiService.getccAvenueInitiate(
      applicationIdToUse,
      amount
    );

    const container = document.createElement("div");
    container.innerHTML = response;

    document.body.appendChild(container);

    const form = container.querySelector("form");

    if (form) {
      form.submit();
    } else {
      toast.error("Payment form not found");
    }

  } catch (error) {
    console.error(error);
    toast.error("Failed to initiate payment");
  }
   finally {

    // ✅ Re-enable button
    setIsProcessing(false);
  }
};

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      backdrop="static"
      className="payment-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm & Pay</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="payment-subtitle">
          Please review the details and proceed with payment.
        </p>

        {selectedJob && (
          <div className="payment-summary-card">
            <div className="summary-row">
              <span>Job Position</span>
              <strong>{selectedJob.position_title}</strong>
            </div>

            <div className="summary-row">
              <span>Requisition Code</span>
              <strong>{selectedJob.requisition_code}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>Application Fee</span>
              <strong className="amount">₹{amount}</strong>
            </div>
          </div>
        )}

        <div className="payment-note">
          🔒 Payments are secure and powered by CCAvenue.
        </div>
      </Modal.Body>

      <Modal.Footer className="payment-footer">
        <button
          className="btn btn-outline-secondary"
          onClick={onHide}
        >
          Cancel
        </button>

        {selectedJob && (
          // <Razorpay
          //   onSuccess={onPaymentSuccess}
          //   position_id={selectedJob.position_id}
          //   amountPaise={selectedJob?.application_fee_paise ?? 50000}
          //   candidate={{
          //     id: candidateId,
          //     full_name: user?.data?.user?.full_name,
          //     email: user?.data?.user?.email,
          //     phone: user?.data?.user?.phone,
          //   }}
          //   turnstileToken={token}
          // />
          <button
            className="btn btn-primary paybtn"
            onClick={handleCCAvenuePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        )}

      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;


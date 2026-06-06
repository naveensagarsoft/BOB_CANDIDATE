import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const NextButtonWithConfirmation = ({ onNext, isDirty }) => {
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    if (isDirty) {
      setShowModal(true);
    } else {
      onNext();
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    onNext();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        style={{
          backgroundColor: "#ff7043",
          border: "none",
          padding: "0.6rem 2rem",
          borderRadius: "4px",
          color: "#fff",
          fontSize: '0.875rem'
        }}
        onClick={handleNext}
      >
        Save & Next
        <FontAwesomeIcon icon={faChevronRight} size="sm" className="ms-2" />
      </button>

      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{ maxWidth: "500px", textAlign: "center" }}>
            <h4 style={{ color: "#F26A21", fontWeight: 600, fontSize: '1rem' }}>
              Confirmation
            </h4>
            <p style={{ marginTop: "15px", lineHeight: "1.6", fontSize: "0.95rem", color: "#555" }}>
              You have unsaved changes. Are you sure you want to continue?
            </p>
            <div style={{ textAlign: "center", marginTop: "25px" }}>
              <button
                onClick={handleCancel}
                className="btn btn-outline-secondary mr-2"
                style={{ marginRight: '10px' }}
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className="btn"
                style={{ backgroundColor: "#F26A21", color: "white" }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NextButtonWithConfirmation;
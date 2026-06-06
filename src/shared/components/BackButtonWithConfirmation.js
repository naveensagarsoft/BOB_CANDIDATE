import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const BackButtonWithConfirmation = ({ goBack, isDirty }) => {
  const [showModal, setShowModal] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      setShowModal(true);
    } else {
      goBack();
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    goBack();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <button type="button" className="btn grey_border text-muted" onClick={handleBack} style={{ fontSize: '0.875rem', padding: "0.6rem 1rem" }}>
        <FontAwesomeIcon icon={faChevronLeft} size='sm' style={{ marginRight: '0.25rem' }} />
        Back
      </button>
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{ maxWidth: "500px", textAlign: "center" }}>
            <h4 style={{ color: "#F26A21", fontWeight: 600, fontSize: '1rem' }}>
              Confirmation
            </h4>
            <p style={{ marginTop: "15px", lineHeight: "1.6", fontSize: "0.95rem", color: "#555" }}>
              You will lose unsaved information. Are you sure you want to go back?
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

export default BackButtonWithConfirmation;
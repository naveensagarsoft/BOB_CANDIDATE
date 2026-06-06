import React from "react";
import { Modal } from "react-bootstrap";
import "../../../css/ConfirmationModal.css";
const ConfirmationModal = ({
  show,
  onCancel,
  onConfirm,
  message,
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="confirmation-modal"
    >
      <Modal.Body className="text-center p-4">
        <p className="mb-4 confirmtext">
          {message ||
            "Please ensure that your latest education and experience details have been added before proceeding."}
        </p>

        <div className="d-flex justify-content-center gap-3">
          <button
            className="btn btn-outline-secondary px-4 cancelbutton"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="btn btn-bob-orange px-4"
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;

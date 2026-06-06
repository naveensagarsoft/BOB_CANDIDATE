import React from "react";
import { Modal } from "react-bootstrap";
import "../../../css/ValidationErrorModal.css";
const ValidationErrorModal = ({
  show,
  onClose,
  errors = [],
  showHeading = false,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="validation-modal"
    >
      {/* <Modal.Header closeButton> */}
        {/* <Modal.Title>Eligibility Check Failed</Modal.Title> */}
      {/* </Modal.Header> */}

      <Modal.Body>
         {showHeading && (
          <p className="mb-3">
            Your profile does not meet the requirements for this job due to the following:
          </p>
        )}


        <ul className="text-danger ps-3 mb-0">
          {errors.map((err, index) => (
            <li key={index} className="mb-2">
              {err}
            </li>
          ))}
        </ul>
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        <button
          className="btn btn-bob-orange px-4"
          onClick={onClose}
        >
          OK
        </button>
      </Modal.Footer>

      
    </Modal>
  );
};

export default ValidationErrorModal;

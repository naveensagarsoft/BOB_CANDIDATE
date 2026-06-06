import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";

const EditMobileModal = ({ show, onHide, currentMobileNumber, credentials, onSuccess }) => {
  const [newMobileNumber, setNewMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 10) {
      setNewMobileNumber(value);
      setError("");
    }
  };

  const validateMobileNumber = () => {
    if (!newMobileNumber.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (newMobileNumber.length !== 10) {
      setError("Mobile number must be 10 digits");
      return false;
    }
    if (newMobileNumber === currentMobileNumber) {
      setError("New mobile number must be different from current number");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateMobileNumber()) {
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.editMobileNumber(newMobileNumber, credentials);
      const responseData = response.data?.data || response.data;

      // Check if loginSuccess is true
      if (responseData?.loginSuccess) {
        // Show success message
        toast.success(responseData?.responseMessage || "Mobile number updated successfully!");
        setNewMobileNumber("");
        // Pass the full response data to parent
        onSuccess(responseData);
        onHide();
      } else {
        // Show error message if loginSuccess is false
        const errorMessage = responseData?.responseMessage || "Failed to update mobile number. Please try again.";
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update mobile number. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setNewMobileNumber("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header className="border-bottom pb-3" closeButton>
        <Modal.Title className="cerhead" style={{ fontSize: '16px' }}>Edit Mobile Number</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        <div className="mb-3">
          <label htmlFor="currentMobileNumber" className="form-label text-muted">Current Mobile Number</label>
          <input
            type="text"
            id="currentMobileNumber"
            className="form-control"
            value={currentMobileNumber}
            disabled
            style={{ backgroundColor: "#f5f5f5" }}
          />
        </div>
        <div className="">
          <label htmlFor="newMobileNumber" className="form-label">
            New Mobile Number <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="newMobileNumber"
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={newMobileNumber}
            onChange={handleInputChange}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            disabled={loading}
            autoFocus
          />
          {error && <div className="invalid-feedback d-block mt-2">{error}</div>}
        </div>
      </Modal.Body>
      <Modal.Footer style={{ border: 'none' }}>
        <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          style={{ backgroundColor: '#ff6a00', color: 'white', border: 'none' }}
          onClick={handleSave}
          disabled={loading || !newMobileNumber.trim()}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditMobileModal;

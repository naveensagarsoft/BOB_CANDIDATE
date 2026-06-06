import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from "../../../assets/delete-icon.png";
import viewIcon from "../../../assets/view-icon.png";
import editIcon from "../../../assets/edit-icon.png";
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Loader from "../../../shared/components/Loader";
import greenCheck from '../../../assets/green-check.png'
import { handleEyeClick } from "../../../shared/utils/fileDownload";
import { useCertificationDetails } from "../hooks/certificationHooks";
import { Modal, Button } from "react-bootstrap";
import { useState } from "react";

const formatDateDDMMYYYY = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

const CertificationDetails = ({ goNext, goBack }) => {
  const {
    certList,
    certMasterOptions,
    hasCertification,
    formData,
    formErrors,
    certificateFile,
    existingDocument,
    isEditMode,
    nextError,
    isDirty,
    loading,
    fileInputRef,
    isOtherSelected,
    handleChange,
    handleFileChange,
    handleBrowse,
    handleViewCertificate,
    handleEdit,
    handleDelete,
    handleSave,
    handleHasCertificationToggle,
    saveAndNext,
    clearCertificate,
    formatFileSize,
    handleCancelEdit
  } = useCertificationDetails({ goNext });
  
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
 const closeModal = () => (handleCancelEdit(), setShowModal(false));
 const handleSaveAndClose = async () => {
  if (!(await handleSave())) return;
  closeModal();
};
  /* ================= UI ================= */
  return (
    <div className="px-4 py-3 border rounded bg-white">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <p className="tab_headers" style={{ marginBottom: "0px" }}>
            Certification Details
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">

          {certList.length === 0 && (
            <div
              className="d-flex align-items-center gap-2 p-2 rounded"
              style={{
                backgroundColor: "rgb(255, 247, 237)",
                border: "1px solid rgb(231, 148, 109)",
                width: "fit-content"
              }}
            >
              <Form.Check
                type="checkbox"
                id="hasCertification"
                label="I hold certification(s)"
                checked={hasCertification}
                onChange={(e) =>
                  handleHasCertificationToggle(e.target.checked)
                }
                style={{
                  fontSize: "14px",
                  color: "rgb(110, 110, 110)",
                  fontWeight: "500"
                }}
              />
            </div>
          )}

          <button
            type="button"
            className="btn orange-button f14"
            disabled={!hasCertification}
            onClick={() => {
              handleCancelEdit();   // resets form + errors
              openModal();
            }}
          >
            + Add
          </button>

        </div>
      </div>

      {nextError && (
        <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
          {nextError}
        </div>
      )}
      <form className="row g-4 mt-2" noValidate>
        <Modal show={showModal} onHide={closeModal} size="lg" centered className="cermodal">
          <Modal.Header closeButton>
            <Modal.Title className="cerhead">
              {isEditMode ? "Edit Certification" : "Add Certification"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-4">
              <div className="col-md-4">
                <label className="form-label">
                  Certification {hasCertification && <span className="text-danger">*</span>}
                </label>

                <select
                  id="certificationMasterId"
                  disabled={!hasCertification}
                  value={formData.certificationMasterId}
                  onChange={handleChange}
                  className={`form-select ${formErrors.certificationMasterId ? "is-invalid" : ""}`}
                >
                  <option value="">Select certification</option>
                  {certMasterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="invalid-feedback">
                  {formErrors.certificationMasterId}
                </div>
              </div>

              {/* Name */}
              <div className="col-md-4">
                <label className="form-label">
                  Certification Name {isOtherSelected && <span className="text-danger">*</span>}
                </label>
                <input id="certificationName" maxLength={200} disabled={!hasCertification || !isOtherSelected} className={`form-control ${formErrors.certificationName ? "is-invalid" : ""}`} value={formData.certificationName} onChange={handleChange} />
                <div className="invalid-feedback">{formErrors.certificationName}</div>
              </div>

              {/* Issued By */}
              <div className="col-md-4">
                <label className="form-label">
                  Certification Issued By {hasCertification && <span className="text-danger">*</span>}
                </label>
                <input id="issuedBy" maxLength={200} disabled={!hasCertification} className={`form-control ${formErrors.issuedBy ? "is-invalid" : ""}`} value={formData.issuedBy} onChange={handleChange} />
                <div className="invalid-feedback">{formErrors.issuedBy}</div>
              </div>

              {/* Certification Date */}
              <div className="col-md-4">
                <label htmlFor="certificationDate" className="form-label">
                  Certification Date {hasCertification && <span className="text-danger">*</span>}
                </label>
                <input type="date" id="certificationDate" disabled={!hasCertification} className={`form-control ${formErrors.certificationDate ? "is-invalid" : ""}`} value={formData.certificationDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
                <div className="invalid-feedback">{formErrors.certificationDate}</div>
              </div>

              {/* Expiry Date */}
              <div className="col-md-4">
                <label htmlFor="expiryDate" className="form-label">
                  Expiry Date, if any
                </label>
                <input type="date" id="expiryDate" disabled={!hasCertification} className={`form-control ${formErrors.expiryDate ? "is-invalid" : ""}`} value={formData.expiryDate} onChange={handleChange} min={formData.certificationDate} />
                <div className="invalid-feedback">{formErrors.expiryDate}</div>
              </div>

              {/* Upload */}
              <div className="col-md-4">
                <label className="form-label">
                  Upload Certificate {hasCertification && <span className="text-danger">*</span>}
                </label>

                <div
                  className={`form-control d-flex align-items-center justify-content-center ${!hasCertification ? "uploadcertification" : ""
                    } ${formErrors.certificate ? "is-invalid" : ""}`}
                  style={{
                    minHeight: "100px", cursor: hasCertification ? "pointer" : "not-allowed",
                    pointerEvents: hasCertification ? "auto" : "none"
                  }}
                  onClick={hasCertification ? handleBrowse : undefined}
                >
                  {!certificateFile && !existingDocument && (
                    <div className="text-center">
                      <FontAwesomeIcon icon={faUpload} className="mb-2" />
                      <div>Click to upload</div>

                      {/* helper text */}
                      <small
                        className={`d-block mt-1 ${hasCertification ? "text-muted" : "text-muted opacity-75"
                          }`}
                      >
                        PDF, JPG or PNG (Max 2MB)
                      </small>
                    </div>
                  )}
                  {(certificateFile || existingDocument) && (
                    <div className="d-flex justify-content-between w-100">
                      <div className="d-flex align-items-center gap-2">
                        <img src={greenCheck} className="text-success" style={{ width: '22px', height: '22px' }} alt="Check" />
                        <div>
                          <div style={{ fontWeight: 600 }} className="wraptext">
                            {certificateFile?.name || existingDocument?.displayName}
                          </div>

                          {/* FILE SIZE — only for newly uploaded file */}
                          {certificateFile && (
                            <div className="text-muted" style={{ fontSize: "12px" }}>
                              {formatFileSize(certificateFile.size)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={viewIcon}
                          width={25}
                          height={25}
                          alt="View"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCertificate();
                          }}
                        />

                        {/* <div onClick={() => handleEyeClick(certificateFile)}>
                            <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
                        </div> */}

                        <img src={deleteIcon} width={25} height={25} alt="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!hasCertification) return;
                            clearCertificate();
                          }}
                          style={{ cursor: hasCertification ? "pointer" : "not-allowed", opacity: hasCertification ? 1 : 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={!hasCertification}
                  />
                </div>
                {hasCertification && formErrors.certificate && (
                  <div className="invalid-feedback d-block">
                    {formErrors.certificate}
                  </div>
                )}
              </div>
              {/* ACTIONS */}
              {/* <div className="d-flex justify-content-end gap-3">
                <button
                  type="button" onClick={handleSave} disabled={!hasCertification} className={`btn blue-button px-4 ${!hasCertification ? "disabled bg-light text-muted border" : ""}`}
                  style={{ cursor: !hasCertification ? "not-allowed" : "pointer" }}>
                  {isEditMode ? "Update" : "Submit"}
                </button>
                {isEditMode && (
                  <button type="button" className="btn btn-outline-secondary text-muted" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div> */}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%"
            }}
          >


            <Button
              variant="primary"
              className="orange-button"
              onClick={handleSaveAndClose}
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* TABLE */}
        <div className="d-none d-md-block w-100 mt-2">
          <table className="w-100">
            <thead>
              <tr>
                <th className="profile_table_th text-center">S.No</th>
                <th className="profile_table_th">Certification Issued By</th>
                <th className="profile_table_th">Certification Name</th>
                <th className="profile_table_th">Certification Date</th>
                <th className="profile_table_th">Expiry Date, If any</th>
                <th className="profile_table_th">Action</th>
              </tr>
            </thead>
            <tbody>
              {certList.map((c, i) => (
                <tr key={i}>
                  <td className="profile_table_td text-center">{i + 1}</td>
                  <td className="profile_table_td table-ellipsis">
                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{c.issuedBy}</Tooltip>}>
                      <span>{c.issuedBy}</span>
                    </OverlayTrigger>
                  </td>
                  <td className="profile_table_td table-ellipsis">
                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{c.certificationName}</Tooltip>}>
                      <span>{c.certificationName}</span>
                    </OverlayTrigger>
                  </td>
                  <td className="profile_table_td">
                    {formatDateDDMMYYYY(c.certificationDate)}
                  </td>
                  <td className="profile_table_td">
                    {c.expiryDate ? formatDateDDMMYYYY(c.expiryDate) : "-"}
                  </td>                  <td className="profile_table_td">
                    <div className="d-flex gap-2">
                      {/* <div>
                        <img
                          src={viewIcon}
                          alt="View"
                          style={{ width: "25px", cursor: "pointer" }}
                          onClick={() => window.open(c.certificate?.fileUrl, "_blank")}
                        />
                      </div> */}

                      <div onClick={() => handleEyeClick(c.certificate?.fileUrl)}>
                        <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
                      </div>
                      <div>
                        <img src={editIcon} alt="Edit" style={{ width: '25px', cursor: 'pointer' }} onClick={() => {
                          handleEdit(c);
                          openModal();
                        }} />
                      </div>
                      <div>
                        <img src={deleteIcon} alt="Delete" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="d-block d-md-none">
          {certList.map((c, i) => (
            <div
              key={c.certificationId}
              className="border rounded p-3 mb-3 bg-white shadow-sm"
            >
              <div className="d-flex justify-content-between mb-2">
                <strong>Certification #{i + 1}</strong>
                <div className="d-flex gap-2">
                  {/* <div>
                    <img
                      src={viewIcon}
                      alt="View"
                      style={{ width: "25px", cursor: "pointer" }}
                      onClick={() => window.open(c.certificate?.fileUrl, "_blank")}
                    />
                  </div> */}

                  <div onClick={() => handleEyeClick(c.certificate?.fileUrl)}>
                    <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
                  </div>
                  <div>
                    <img src={editIcon} alt="Edit" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleEdit(c)} />
                  </div>
                  <div>
                    <img src={deleteIcon} alt="Delete" style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                  </div>
                </div>
              </div>

              <div className="mb-1">
                <small className="text-muted">Issued By</small>
                <div className='wrap-text'>{c.issuedBy}</div>
              </div>

              <div className="mb-1">
                <small className="text-muted">Certification</small>
                <div className='wrap-text'>{c.certificationName}</div>
              </div>

              <div className="mb-1">
                <small className="text-muted">Certification Date</small>
                <div className='wrap-text'>
                  {formatDateDDMMYYYY(c.certificationDate)}
                </div>              </div>

              <div>
                <small className="text-muted">Expiry Date</small>
                <div className='wrap-text'>
                  {c.expiryDate ? formatDateDDMMYYYY(c.expiryDate) : "-"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NAV */}
        <div className="d-flex justify-content-between">
          <BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
          <button
            type="button"
            className="btn btn-primary"
            style={{
              backgroundColor: "rgb(255, 112, 67)",
              border: "medium",
              padding: "0.6rem 2rem",
              borderRadius: "4px",
              color: "#fff",
              fontSize: '0.875rem'
            }}
            onClick={saveAndNext}
          >
            Save & Next
            <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
          </button>
        </div>

      </form>

      {loading && (
        <Loader />
      )}

    </div >
  );
};

export default CertificationDetails;

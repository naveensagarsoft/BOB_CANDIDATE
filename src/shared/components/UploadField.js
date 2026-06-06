import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faLink } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from '../../assets/delete-icon.png';
import viewIcon from '../../assets/view-icon.png';
import profileApi from "../../components/profile/services/profile.api";
import greenCheck from '../../assets/green-check.png'
import { handleEyeClick } from "../utils/fileDownload";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

const UploadField = forwardRef(({
  label,
  required,
  file,
  customName,
  customNameValue,
  onCustomNameChange,
  onBrowse,
  onChange,
  onDelete,
  disabled = false,
  allowedFormats = "JPG, PNG",
  maxSize = "2MB",
  infoImage,
  onInfoClick,
  showDigiLockerIcon = false,
  onDigiLockerClick
}, ref) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    return bytes < 1024
      ? `${bytes} B`
      : bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };



  const handleDelete = async () => {
    if (!file) return;
    try {
      if (file.isFromApi && file.documentTypeId) {
        await profileApi.deleteDocument(file.documentTypeId);
      }
      // refresh parent state from backend
      onDelete?.();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="col-md-12 col-sm-12">

      <div className="d-flex gap-3 align-items-center">
        {label && (
          <label className="grey-label mb-1 d-flex align-items-center gap-2" style={{ fontSize: '0.875rem' }}>
            {label} {required && <span className="text-danger">*</span>}
            {infoImage && (
              <button type="button" className="border-0 bg-transparent p-0" onClick={onInfoClick}>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  size="sm"
                  style={{ color: "#42579f" }}
                />
              </button>
            )}
            {showDigiLockerIcon && (
              <button 
                type="button" 
                className="border-0 bg-transparent p-0" 
                onClick={onDigiLockerClick}
                title="Connect to DigiLocker"
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon
                  icon={faLink}
                  size="sm"
                  style={{ color: "#ff7043" }}
                />
              </button>
            )}
          </label>
        )}

        {customName && (
          <input
            type="text"
            className="form-control styled-input mb-2"
            placeholder="Enter document name"
            value={customNameValue || ""}
            onChange={(e) => onCustomNameChange(e.target.value)}
            required
          />
        )}
      </div>

      {/* BEFORE UPLOAD */}
      {!file && (
        <div
          className="border rounded d-flex align-items-center gap-2 px-3 py-3"
          style={{
            // minHeight: "90px",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: disabled ? "#f5f5f5" : "#fff",
            borderColor: disabled ? "#d0d0d0" : "#bfc8e2",
            opacity: disabled ? 0.6 : 1
          }}
          onClick={!disabled ? onBrowse : undefined}
         >

          <FontAwesomeIcon icon={faUpload} className="text-secondary" size="lg" />

          <div className="d-flex flex-column" style={{ marginTop: '-10px' }}>
            <div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500", fontSize: '14px' }}>
              Click to upload
            </div>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              {allowedFormats} (Max {maxSize})
            </div>
          </div>

          {/* FILE INPUT with forwarded ref */}
          <input
            type="file"
            accept={allowedFormats.includes("PDF") ? ".jpg,.jpeg,.png,.pdf" : ".jpg,.jpeg,.png"}
            style={{ display: "none" }}
            ref={ref}
            onChange={onChange}
          />
        </div>
      )}

      {/* AFTER UPLOAD */}
      {file && (
        <div className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
          style={{
            border: "2px solid #bfc8e2",
            borderRadius: "8px",
            background: "#f7f9fc"
          }}
        >

          {/* Left: Check icon + file info */}
          <div className="d-flex align-items-center">
            <img
              alt="check"
              src={greenCheck}
              style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
            />

            <div className='p-2'>
              <div style={{ fontWeight: 600, color: '#42579f' }}>
                {file?.name || "Uploaded file"}
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {file.size && formatFileSize(file.size)}
              </div>
            </div>
          </div>

          {/* Right: Action icons */}
          <div className="d-flex gap-2">

            {/* <div>
              <img src={viewIcon} alt='View' style={{ width: '25px', cursor: 'pointer' }} onClick={handleView} />
            </div> */}

            <div onClick={() => handleEyeClick(file?.url)}>
              <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
            </div>

            <div>
              <img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} onClick={handleDelete} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
});

export default UploadField;

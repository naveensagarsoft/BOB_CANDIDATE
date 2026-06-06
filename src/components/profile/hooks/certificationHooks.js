import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import profileApi from "../services/profile.api";
import masterApi from "../../../services/master.api";
import { toast } from "react-toastify";
import {
  mapCertificationApiToUi,
  mapCertificationFormToApi
} from "../mappers/CertificationMapper";
import { handleEyeClick } from "../../../shared/utils/fileDownload";

/* -------------------- CONSTANTS -------------------- */
const MAX_CERT_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_CERT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const EMPTY_FORM = {
  issuedBy: "",
  certificationMasterId: "",
  certificationName: "",
  certificationDate: "",
  expiryDate: ""
};

/* -------------------- HELPERS -------------------- */
const isFutureDate = (dateStr) =>
  dateStr && new Date(dateStr) > new Date();

/* -------------------- HOOK -------------------- */
export const useCertificationDetails = ({ goNext }) => {
  const user = useSelector(state => state?.user?.user?.data);
  const candidateId = user?.user?.id;

  const fileInputRef = useRef(null);

  const [certList, setCertList] = useState([]);
  const [certMasterOptions, setCertMasterOptions] = useState([]);
  const [hasCertification, setHasCertification] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [nextError, setNextError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidationPending, setIsValidationPending] = useState(false);

  /* -------------------- DERIVED -------------------- */
  const isOtherSelected = useMemo(() => {
    const selected = certMasterOptions.find(
      o => o.value === formData.certificationMasterId
    );
    return selected?.label === "Other";
  }, [certMasterOptions, formData.certificationMasterId]);

  /* -------------------- FETCH MASTERS -------------------- */
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const res = await masterApi.getCertifications();
        const options = Array.isArray(res?.data)
          ? res.data.map(c => ({
            value: c.certificationMasterId,
            label: c.certificationName
          }))
          : [];
        setCertMasterOptions(options);
      } catch {
        setCertMasterOptions([]);
      }
    };
    fetchMasters();
  }, []);

  /* -------------------- FETCH HAS CERT -------------------- */
  useEffect(() => {
    if (!candidateId) return;

    const init = async () => {
      try {
        const res = await profileApi.getHasCertification();
        const hasCert = Boolean(res?.data);
        setHasCertification(hasCert);
        if (hasCert) fetchCertifications();
        else {
          resetForm();
          setCertList([]);
        }
      } catch {
        setHasCertification(false);
      }
    };

    init();
  }, [candidateId]);

  /* -------------------- FETCH CERTS -------------------- */
  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getCertifications();
      const mapped = Array.isArray(res?.data)
        ? res.data.map(mapCertificationApiToUi)
        : [];
      setCertList(mapped);
      setIsDirty(false);
    } catch {
      setCertList([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- HANDLERS -------------------- */
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [id]: value };

      if (id === "certificationMasterId") {
        const selected = certMasterOptions.find(o => o.value === value);
        updated.certificationName =
          selected?.label === "Other" ? "" : selected?.label || "";
      }

      if (id === "certificationDate") {
        updated.expiryDate = "";
      }

      return updated;
    });

    setFormErrors(p => ({ ...p, [id]: "" }));
    setIsDirty(true);
    setNextError("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local validation first
    if (!ALLOWED_CERT_TYPES.includes(file.type)) {
      setFormErrors(p => ({
        ...p,
        certificate: "Invalid file type"
      }));
      return;
    }

    if (file.size > MAX_CERT_FILE_SIZE_BYTES) {
      setFormErrors(p => ({
        ...p,
        certificate: "File size must be ≤ 2MB"
      }));
      return;
    }

    // 🔴 MUST have certification selected before validating
    if (!formData.certificationMasterId) {
      toast.error("Please select certification first");

      setCertificateFile(null);
      setExistingDocument(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    try {
      setLoading(true);

      const res = await profileApi.validateCertification(
        formData.certificationMasterId,
        file
      );

      // ✅ ALWAYS accept file
      setCertificateFile(file);
      setExistingDocument(null);
      setFormErrors(p => ({ ...p, certificate: "" }));
      setIsDirty(true);

      // 🔥 CORE CHANGE
      if (res?.data === true) {
        setIsValidationPending(false);
      } else {
        setIsValidationPending(true);
      }

    } catch (err) {
      // Even if validation API fails → treat as pending
      setCertificateFile(file);
      setExistingDocument(null);
      setIsValidationPending(true);

      toast.error("Validation failed, marked as pending");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleViewCertificate = () => {
    if (certificateFile instanceof File) {
      const url = URL.createObjectURL(certificateFile);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (existingDocument?.fileUrl) {
      handleEyeClick(existingDocument.fileUrl);
      return;
    }
    toast.error("No certificate to view");
  };

  const handleEdit = (row) => {
    setIsEditMode(true);
    setEditingRow(row);
    setFormData({
      issuedBy: row.issuedBy,
      certificationMasterId: row.certificationMasterId,
      certificationName: row.certificationName,
      certificationDate: row.certificationDate,
      expiryDate: row.expiryDate || ""
    });
    setExistingDocument(row.certificate);
    setCertificateFile(null);
    setNextError("");
  };

  const handleDelete = async (row) => {
    try {
      setLoading(true);
      await profileApi.deleteCertification(row.certificateId);
      toast.success("Deleted successfully");
      fetchCertifications();
      if (editingRow?.certificateId === row.certificateId) resetForm();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setCertificateFile(null);
    setExistingDocument(null);
    setIsEditMode(false);
    setEditingRow(null);
    setFormErrors({});
    setIsValidationPending(false);
  };

  /* -------------------- VALIDATION -------------------- */
 const validateCertificationDate = (formData, errors) => {
  if (!formData.certificationDate) {
    errors.certificationDate = "This field is required";
    return;
  }

  if (isFutureDate(formData.certificationDate)) {
    errors.certificationDate = "Cannot be future date";
  }
};

const validateForm = () => {
  if (!hasCertification) return true;

  const errors = {};

  if (!formData.certificationMasterId)
    errors.certificationMasterId = "This field is required";

  if (!formData.issuedBy.trim())
    errors.issuedBy = "This field is required";

  if (isOtherSelected && !formData.certificationName.trim())
    errors.certificationName = "This field is required";

  // ✅ extracted (same logic)
  validateCertificationDate(formData, errors);

  if (!certificateFile && !existingDocument)
    errors.certificate = "This field is required";

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

  /* -------------------- SAVE -------------------- */
  const handleSave = async () => {
    const isValid = validateForm();
  if (!isValid) {
        toast.error("Please fill all required fields correctly");
        return;
      }
    if (!validateForm()) {
      return false;   // ❗ validation failed
    }

  

    try {
      setLoading(true);

      const payload = mapCertificationFormToApi(
        formData,
        candidateId,
        isEditMode ? editingRow?.certificateId : null,
        certificateFile,
        existingDocument,
        isValidationPending
      );

      await profileApi.saveCertification(
        payload,
        certificateFile instanceof File ? certificateFile : undefined
      );

      toast.success(isEditMode ? "Updated successfully" : "Saved successfully");

      resetForm();
      fetchCertifications();
      setIsDirty(false);

      return true;   // ❗ success
    } catch {
      toast.error("Failed to save certification");
      return false;  // ❗ failure
    } finally {
      setLoading(false);
    }
  };

  const saveAndNext = () => {
    if (!hasCertification) {
      goNext();
      return;
    }
    

    if (!certList.length) {
      toast.error("Please add at least one certification");
      return;
    }

    setNextError("");
    goNext();
  };

  const handleHasCertificationToggle = async (checked) => {
    setHasCertification(checked);
    setNextError("");

    try {
      await profileApi.saveHasCertification(checked);
      setIsDirty(false);
      if (!checked) {
        resetForm();
        setCertList([]);
      } else {
        fetchCertifications();
      }
    } catch {
      setHasCertification(prev => !prev);
      toast.error("Failed to update");
    }
  };

  const clearCertificate = () => {
    setCertificateFile(null);
    setExistingDocument(null);
    setFormErrors(p => ({ ...p, certificate: "" }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return {
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
  };
};

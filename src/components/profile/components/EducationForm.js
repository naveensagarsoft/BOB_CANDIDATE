import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useRef, useState } from "react";
import profileApi from '../services/profile.api';
import { mapEducationFormToApi } from '../mappers/EducationMapper';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import deleteIcon from '../../../assets/delete-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import { hasDateCollision, hasDateCollisionAcrossProfiles, isValidCollegeName, validateEndDateAfterStart } from '../../../shared/utils/validation';
import bulbIcon from '../../../assets/bulb-icon.png';
import { forwardRef, useImperativeHandle } from 'react';
import { removeParsedEducationById } from '../store/resumeSlice';
import greenCheck from '../../../assets/green-check.png'
import { handleEyeClick } from "../../../shared/utils/fileDownload";

const EducationForm = forwardRef((props, ref) => {
  const {
    educationId,
    onEducationLevelChange,
    fixedEducationLevelId,
    fixedDocumentTypeId,
    disableEducationLevel = false,
    // showDegree = true,
    showSpecialization = true,
    showBoard = true,
    existingData = null,
    masterData,
    refreshEducation,
    existingRanges = [],
    onDirtyChange = () => { },
    parsedId = null,
    onDelete = null,
    onSave = () => { },  // ✅ Callback to keep accordion open after save
    experienceList = [],  // ✅ Experience list for cross-profile date collision check
    educationList = []  // ✅ Education list for cross-profile date collision check
  } = props;
  const dispatch = useDispatch();
  const parsedList = useSelector((state) => state.resume?.parsed?.education || []);
  const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;
  const fileInputRef = useRef(null);
  //const [loading, setLoading] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    university: "",
    universityName: "",
    otherQualification: "",
    college: "",
    degree: "Intermediate",
    from: "",
    to: "",
    percentage: "",
    specialization: "",
    otherSpecialization: "",
    educationType: "",
    educationLevel: "",
    educationDocCode: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [localDirty, setLocalDirty] = useState(false);

  useEffect(() => {
    if (!existingData) return;
    if (existingData?.document) {
      setExistingDocument(existingData.document);
    }
    setFormData(prev => ({
      ...prev,
      ...existingData
    }));
    // ✅ Clear any stale errors when loading existing data
    setFormErrors({});
  }, [existingData]);

  useEffect(() => {
    // DO NOT override if GET data exists
    if (existingData) return;
    const fixedId = fixedEducationLevelId || fixedDocumentTypeId;
    if (!fixedId || !masterData.educationLevels.length) return;
    const selected = masterData.educationLevels.find(
      el => el.documentTypeId === fixedId
    );
    if (!selected) return;
    setFormData(prev => ({
      ...prev,
      educationLevel: fixedId,
      educationDocCode: selected.docCode
    }));
  }, [
    fixedEducationLevelId,
    fixedDocumentTypeId,
    masterData.educationLevels,
    existingData
  ]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    clearErrors(id);

    if (id === "from" || id === "to") {
      clearErrors("dateRange");
    }

    if (id === "educationType") {
      clearErrors("educationType", "dateRange");
    }

    if (id === "educationLevel") {
      const selected = masterData.educationLevels.find(
        el => el.documentTypeId === value
      );

      setFormData(prev => ({
        ...prev,
        educationDocCode: selected?.docCode || "",
        university: ""
      }));

      // clearErrors("educationLevel", "university");
      // 🔴 CLEAR FILES (this is what you're missing)

      setCertificateFile(null);
      setExistingDocument(null);

      // 🔴 clear file error also
      clearErrors("educationLevel", "university", "certificateFile");

      if (educationId && onEducationLevelChange && selected) {
        onEducationLevelChange(educationId, selected.documentName);
      }
    }

    if (id === "university") {
      const selected = masterData?.boards?.find(
        b => b.educationQualificationsId === value
      );

      const isOthers =
        selected?.qualificationName?.toLowerCase() === "others";

      setFormData(prev => ({
        ...prev,
        university: value,
        specialization: "",
        otherSpecialization: "",
        otherQualification: isOthers ? prev.otherQualification : ""
      }));
    }

    if (id === "specialization") {
      setFormData(prev => ({
        ...prev,
        specialization: value,
        otherSpecialization: ""
      }));
    }

    setLocalDirty(true);
    onDirtyChange(true);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearErrors("certificateFile");

    if (file.size > 2 * 1024 * 1024) {
      setFormErrors(prev => ({
        ...prev,
        certificateFile: "File size must be under 2MB"
      }));
      return;
    }

    setCertificateFile(file);
    markDirty();
  };

  const markDirty = () => {
    setLocalDirty(true);
    onDirtyChange(true);
  };

  const formatFileSize = (size) => {
    if (!size) return "";
    const kb = size / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    // Required fields validation
    const requiredFields = [
      { key: 'educationLevel', label: 'Education Level' },
      { key: 'college', label: 'School / College / University' },
      // { key: 'from', label: 'From Date' },
      { key: 'to', label: 'To Date' },
      { key: 'percentage', label: 'Percentage' },
      ...(showBoard ? [{ key: 'university', label: 'Board' }] : []),
      // ...(showSpecialization ? [{ key: 'specialization', label: 'Specialization' }] : []),
      { key: 'educationType', label: 'Education Type' },
      ...(!isBoardLevel ? [{ key: 'from', label: 'From Date' }] : []),
    ];
    requiredFields.forEach(field => {
      if (!formData[field.key]?.toString().trim()) {
        errors[field.key] = `This field is required`;
        isValid = false;
      }
    });

    if (!formData.college?.trim()) {
      errors.college = "This field is required";
      isValid = false;
    } else if (!isValidCollegeName(formData.college)) {
      errors.college = "Only alphabets and spaces are allowed";
      isValid = false;
    }

    if (formData.universityName?.trim()) {
      if (!isValidCollegeName(formData.universityName)) {
        errors.universityName = "Only alphabets and spaces are allowed";
        isValid = false;
      }
    }

    if (isOthersSelected && !formData.otherQualification?.trim()) {
      errors.otherQualification = "This field is required";
      isValid = false;
    }

    if (isOtherSpecializationSelected && !formData.otherSpecialization?.trim()) {
      errors.otherSpecialization = "This field is required";
      isValid = false;
    }

    // Date range validation
    if (formData.from && formData.to) {
      const { isValid: isDateValid, error } = validateEndDateAfterStart(
        formData.from,
        formData.to
      );
      if (!isDateValid) {
        errors.dateRange = error || "Invalid education date range";
        isValid = false;
      }
    }

    const pct = Number(formData.percentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      errors.percentage = "Enter a valid percentage between 0 and 100";
      isValid = false;
    }

    // Certificate file validation
    if (!certificateFile && !existingDocument) {
      errors.certificateFile = "Certificate file is required";
      isValid = false;
    }
    setFormErrors(errors);
    // Scroll to first error immediately using the computed errors object
    if (!isValid) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    return { isValid, errors };
  };

  useImperativeHandle(ref, () => ({
    validate: () => validateForm(),
  }));

  const handlePercentageChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setFormData(prev => ({ ...prev, percentage: "" }));
      clearErrors("percentage");
      markDirty();
      return;
    }

    if (!/^\d{0,3}(\.\d{0,2})?$/.test(value)) return;

    setFormData(prev => ({ ...prev, percentage: value }));
    clearErrors("percentage");
    markDirty();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const { isValid } = validateForm();

    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    // ✅ BOARD vs INTER validation
    const boardLevelIds = masterData.educationLevels
      .filter(e => e.docCode === "BOARD")
      .map(e => e.documentTypeId);

    const interLevelIds = masterData.educationLevels
      .filter(e => e.docCode === "INTER")
      .map(e => e.documentTypeId);

    const isCurrentBoard = boardLevelIds.includes(formData.educationLevel);
    const isCurrentInter = interLevelIds.includes(formData.educationLevel);

    // Find existing BOARD & INTER entries
    const existingBoard = educationList.find(e =>
      boardLevelIds.includes(e.educationLevelId || e.data?.educationLevel)
    );

    const existingInter = educationList.find(e =>
      interLevelIds.includes(e.educationLevelId || e.data?.educationLevel)
    );

    // Convert to Date
    const currentTo = formData.to ? new Date(formData.to) : null;
    const boardTo = isCurrentBoard
      ? currentTo
      : existingBoard?.data?.to
        ? new Date(existingBoard.data.to)
        : null;

    const interTo = isCurrentInter
      ? currentTo
      : existingInter?.data?.to
        ? new Date(existingInter.data.to)
        : null;

    // 🔴 VALIDATION
    if (boardTo && interTo) {
      // Rule 1: INTER must be after BOARD
      if (interTo <= boardTo) {
        setFormErrors(prev => ({
          ...prev,
          to: "12th/Intermediate completion date must be after 10th/Board completion date"
        }));
        return;
      }

      // Rule 2: Minimum 1 year gap
      const minInterDate = new Date(boardTo);
      minInterDate.setFullYear(minInterDate.getFullYear() + 1);

      if (interTo < minInterDate) {
        setFormErrors(prev => ({
          ...prev,
          to: "There must be at least a 1 year gap between 10th/Board and 12th/Intermediate completion dates"
        }));
        return;
      }
    }

    // ✅ HIGHER EDUCATION VALIDATION (GRAD, POST_GRAD, etc.)

    const isBoard = boardLevelIds.includes(formData.educationLevel);
    const isInter = interLevelIds.includes(formData.educationLevel);
    const isHigherEducation = !isBoard && !isInter;

    // Find latest school-level date (INTER preferred, else BOARD)
    let schoolMaxDate = null;

    if (existingInter?.data?.to) {
      schoolMaxDate = new Date(existingInter.data.to);
    } else if (existingBoard?.data?.to) {
      schoolMaxDate = new Date(existingBoard.data.to);
    }

    // If editing current form itself
    if (isInter && currentTo) {
      schoolMaxDate = currentTo;
    }
    if (isBoard && currentTo && !existingInter) {
      schoolMaxDate = currentTo;
    }

    if (isHigherEducation && schoolMaxDate) {
      const fromDate = formData.from ? new Date(formData.from) : null;
      const toDate = formData.to ? new Date(formData.to) : null;

      // 🔴 FROM DATE CHECK
      if (fromDate && fromDate <= schoolMaxDate) {
        setFormErrors(prev => ({
          ...prev,
          from: "This must be after your 10th and Intermediate completion date"
        }));
        return;
      }
    }

    const fromDate = isBoardLevel ? formData.to : formData.from;

    const collision = hasDateCollision({
      from: fromDate,
      to: formData.to,
      educationId,
      existingRanges
    });

    if (collision) {
      setFormErrors(prev => ({
        ...prev,
        dateRange: "These dates overlap with another education entry"
      }));
      // setLoading(false);
      setIsSaving(false);
      return;
    }

    // ✅ Check for cross-profile date collision (education vs experience)
    // const crossProfileCollision = hasDateCollisionAcrossProfiles({
    //   from: fromDate,
    //   to: formData.to,
    //   excludeId: educationId,
    //   educationList: educationList || [],
    //   experienceList: experienceList || [],
    //   presentlyWorking: false  // Education doesn't have "presentlyWorking" concept, always false
    // });

    // if (crossProfileCollision) {
    //   setFormErrors(prev => ({
    //     ...prev,
    //     dateRange: "These dates overlap with a work experience entry"
    //   }));
    //   setIsSaving(false);
    //   return;
    // }

    // ✅ Get selected education type
    const selectedEducationType = masterData.educationTypes.find(
      e => e.educationTypeId === formData.educationType
    );

    const isFullTime =
      selectedEducationType?.educationType?.toLowerCase() === "full time";

    // ✅ Run cross validation ONLY for Full Time
    if (isFullTime) {
      const crossProfileCollision = hasDateCollisionAcrossProfiles({
        from: fromDate,
        to: formData.to,
        excludeId: educationId,
        educationList: educationList || [],
        experienceList: experienceList || [],
        presentlyWorking: false
      });

      if (crossProfileCollision) {
        setFormErrors(prev => ({
          ...prev,
          dateRange: "These dates overlap with a work experience entry"
        }));
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(true);

    //   setLoading(true)
    try {
      // Get the docCode from masterData based on the selected education level
      const selectedEducationLevel = masterData.educationLevels.find(
        level => level.documentTypeId === formData.educationLevel
      );
      const docCode = selectedEducationLevel?.docCode;
      if (!docCode) {
        toast.error("Education level docCode not found");
        setIsSaving(false);
        return;
      }

      const normalizedFormData = {
        ...formData,
        percentage: Number(formData.percentage),
        college: formData.college
          ?.replace(/\s+/g, " ")
          .trim(),
        university: formData.university
          ?.replace(/\s+/g, " ")
          .trim(),
        universityName: formData.universityName?.replace(/\s+/g, " ").trim(),
        otherQualification: isOthersSelected
          ? formData.otherQualification?.trim()
          : "",
        otherSpecialization: isOtherSpecializationSelected
          ? formData.otherSpecialization?.trim()
          : ""
      };

      // Validate the document before uploading
      let isValidationPending = false;
      let pendingChecks = null;

      if (certificateFile && docCode === "BOARD") {
        const res = await profileApi.ValidateDocument(docCode, certificateFile);

        if (res?.data === true) {
          isValidationPending = false;
          pendingChecks = null;
        } else {
          isValidationPending = true;
          pendingChecks = ["document"];
        }
      }

      const payload = mapEducationFormToApi({
        formData: normalizedFormData,
        candidateId,
        fixedEducationLevelId,
        educationId,
        isOthersSelected,
        isOtherSpecializationSelected,
        isValidationPending,
        pendingChecks
      });
      await profileApi.postEducationDetails(
        // candidateId,
        payload,
        certificateFile,
        docCode
      );
      toast.success("Education details saved successfully");
      onSave();  // ✅ NEW: Keep accordion open on this item after save
      // onDirtyChange(false);
      setLocalDirty(false);
      onDirtyChange(false);

      // If this form came from parsed resume data, remove that parsed entry from redux by id
      if (parsedId) {
        try {

          dispatch(removeParsedEducationById(parsedId));

          if (refreshEducation) {
            try {
              await refreshEducation(false);
            } catch (refreshErr) {
              console.error("Failed to refresh education details after save", refreshErr);
            }
          }

        } catch (e) {
          console.warn('Failed to remove parsed education from redux by id', e);
        }
      } else {
        if (refreshEducation) {
          try {
            await refreshEducation(true);
          } catch (refreshErr) {
            console.error("Failed to refresh education details after save", refreshErr);
          }
        }
      }
      // goNext();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save education");
    } finally {
      // setLoading(false)
      setIsSaving(false);
    }
  };

  const filteredSpecializations = useMemo(() => {
    if (!formData.university) return [];

    return masterData?.specializations?.filter(
      s => s.educationQualificationsId === formData.university
    ) || [];
  }, [formData.university, masterData.specializations]);

  if (!masterData) {
    return null; // THIS LINE FIXES CRASHES
  }

  const clearErrors = (...keys) => {
    setFormErrors(prev => {
      const updated = { ...prev };
      keys.forEach(k => delete updated[k]);
      return updated;
    });
  };

  const BOARD_LEVEL_IDS = masterData.educationLevels
    .filter(e => e.docCode === "BOARD")
    .map(e => e.documentTypeId);

  const shouldShowSpecialization =
    formData.educationLevel &&
    !BOARD_LEVEL_IDS.includes(formData.educationLevel);

  const BOARD_LABEL_LEVELS = masterData.educationLevels
    .filter(e => ["BOARD", "INTER"].includes(e.docCode))
    .map(e => e.documentTypeId);

  const isBoardLevel = BOARD_LABEL_LEVELS.includes(formData.educationLevel);

  const boardLabel = isBoardLevel ? "Board" : "Course";
  const boardPlaceholder = isBoardLevel ? "Select Board" : "Select Course";

  const selectedBoard = masterData?.boards?.find(
    b => b.educationQualificationsId === formData.university
  );

  const isOthersSelected =
    selectedBoard?.qualificationName?.toLowerCase() === "others";

  const otherFieldLabel = isBoardLevel
    ? "Board Name"
    : "Course Name";

  const selectedSpecialization = masterData?.specializations?.find(
    s => s.specializationId === formData.specialization
  );

  const isOtherSpecializationSelected =
    selectedSpecialization?.specializationName?.toLowerCase() === "others";

  return (
    <form className="row g-4 formfields pt-2" onSubmit={handleSubmit}>
      <div className="col-md-3 col-sm-12 mt-3">
        <label className="form-label">
          Education Level <span className="text-danger">*</span>
        </label>
        <select
          id="educationLevel"
          className={`form-select ${formErrors.educationLevel ? 'is-invalid' : ''}`}
          value={formData.educationLevel}
          disabled={disableEducationLevel}
          onChange={handleChange}
        >
          <option value="">Select Education Level</option>
          {masterData?.educationLevels.map(e => (
            <option key={e.documentTypeId} value={e.documentTypeId}>
              {e.documentName}
            </option>
          ))}
        </select>
        {formErrors.educationLevel && (
          <div className="invalid-feedback">{formErrors.educationLevel}</div>
        )}
      </div>
      {/* College */}
      <div className="col-md-3 col-sm-12 mt-3">
        <label className="form-label">
          School/College <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="college"
          className={`form-control ${formErrors.college ? 'is-invalid' : ''}`}
          value={formData.college}
          onBeforeInput={(e) => {
            if (!/^[A-Za-z ]$/.test(e.data)) e.preventDefault();
          }}
          onPaste={(e) => {
            if (!/^[A-Za-z ]+$/.test(e.clipboardData.getData("text"))) {
              e.preventDefault();
            }
          }}
          onChange={handleChange}
          maxLength={200}
        />
        {formErrors.college && (
          <div className="invalid-feedback">{formErrors.college}</div>
        )}
      </div>

      {!isBoardLevel && (
        <div className="col-md-3 col-sm-12 mt-3">
          <label htmlFor="universityName" className="form-label">
            University
          </label>

          <input
            type="text"
            id="universityName"
            className={`form-control ${formErrors.universityName ? 'is-invalid' : ''}`}
            value={formData.universityName}
            onBeforeInput={(e) => {
              if (!/^[A-Za-z ]$/.test(e.data)) e.preventDefault();
            }}
            onPaste={(e) => {
              if (!/^[A-Za-z ]+$/.test(e.clipboardData.getData("text"))) {
                e.preventDefault();
              }
            }}
            onChange={handleChange}
            maxLength={200}
          />

          {formErrors.universityName && (
            <div className="invalid-feedback">{formErrors.universityName}</div>
          )}
        </div>
      )}

      {/* University */}
      {showBoard && (
        <div className="col-md-3 col-sm-12 mt-3">
          <label htmlFor="university" className="form-label">
            {boardLabel} <span className="text-danger">*</span>
          </label>
          <select
            id="university"
            className={`form-select ${formErrors.university ? 'is-invalid' : ''}`}
            value={formData.university}
            disabled={!formData.educationLevel}
            onChange={handleChange}
          >
            <option value="">{boardPlaceholder}</option>
            {masterData?.boards.filter(
              b =>
                b.levelId === formData.educationLevel &&
                !b.qualificationName?.toLowerCase().startsWith("any")
            ).map(e => (
              <option key={e.educationQualificationsId} value={e.educationQualificationsId}>
                {e.qualificationName}
              </option>
            ))}
          </select>
          {formErrors.university && (
            <div className="invalid-feedback">{formErrors.university}</div>
          )}

        </div>
      )}

      {isOthersSelected && (
        <div className="col-md-3 col-sm-12 mt-3">
          <label id="otherQualification" className="form-label">
            {otherFieldLabel} <span className="text-danger">*</span>
          </label>

          <input
            type="text"
            id="otherQualification"
            className={`form-control ${formErrors.otherQualification ? 'is-invalid' : ''}`}
            value={formData.otherQualification}
            onChange={handleChange}
            maxLength={200}
          />

          {formErrors.otherQualification && (
            <div className="invalid-feedback">{formErrors.otherQualification}</div>
          )}
        </div>
      )}

      {/* From */}
      {!isBoardLevel && (
        <div className="col-md-3 col-sm-12 mt-3">
          <label className="form-label">From <span className="text-danger">*</span></label>
          <input
            type="date"
            id="from"
            className={`form-control ${formErrors.from || formErrors.dateRange ? 'is-invalid' : ''}`}
            value={formData.from}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
          />
          {formErrors.from && (
            <div className="invalid-feedback">{formErrors.from}</div>
          )}
          {formErrors.dateRange && !formErrors.from && !formErrors.to && (
            <div className="invalid-feedback">{formErrors.dateRange}</div>
          )}
        </div>
      )}

      {/* To */}
      <div className="col-md-3 col-sm-12 mt-3">
        <label className="form-label">{isBoardLevel ? "Date of issuance of certificate" : "To"}  <span className="text-danger">*</span></label>
        <input type="date" id="to" className={`form-control ${formErrors.to || formErrors.dateRange ? 'is-invalid' : ''}`} onChange={handleChange} value={formData.to} min={!isBoardLevel ? formData.from || undefined : undefined} max={new Date().toISOString().split("T")[0]} />
        {formErrors.to && (
          <div className="invalid-feedback">{formErrors.to}</div>
        )}
        {formErrors.dateRange && !formErrors.from && !formErrors.to && (
          <div className="invalid-feedback">{formErrors.dateRange}</div>
        )}
      </div>

      {/* Percentage */}
      <div className="col-md-3 col-sm-12 mt-3">
        <label className="form-label">Percentage <span className="text-danger">*</span></label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          inputMode="decimal"
          id="percentage"
          className={`form-control ${formErrors.percentage ? 'is-invalid' : ''}`}
          value={formData.percentage}
          onChange={handlePercentageChange}
        />
        {formErrors.percentage && (
          <div className="invalid-feedback">{formErrors.percentage}</div>
        )}
      </div>

      {/* SPECIALIZATION → only visible if showSpecialization = true */}
      {showSpecialization && shouldShowSpecialization && (
        <div className="col-md-3 col-sm-12 mt-3">
          <label className="form-label">Specialization</label>
          <select
            id="specialization"
            className={`form-select ${formErrors.specialization ? 'is-invalid' : ''}`}
            value={formData.specialization}
            onChange={handleChange}
            disabled={!formData.university}
          >
            <option value="">Select Specialization</option>
            {filteredSpecializations.map(e => (
              <option key={e.specializationId} value={e.specializationId}>
                {e.specializationName}
              </option>
            ))}
          </select>
          {formErrors.specialization && (
            <div className="invalid-feedback">{formErrors.specialization}</div>
          )}
        </div>
      )}

      {showSpecialization && shouldShowSpecialization && isOtherSpecializationSelected && (
        <div className="col-md-3 col-sm-12 mt-3">
          <label className="form-label">
            Other Specialization <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="otherSpecialization"
            className={`form-control ${formErrors.otherSpecialization ? 'is-invalid' : ''}`}
            value={formData.otherSpecialization}
            onChange={handleChange}
            maxLength={200}
          />
          {formErrors.otherSpecialization && (
            <div className="invalid-feedback">{formErrors.otherSpecialization}</div>
          )}
        </div>
      )}

      <div className="col-md-3 col-sm-12 mt-3">
        <label className="form-label">Education Type <span className="text-danger">*</span></label>
        <select
          id="educationType"
          className={`form-select ${formErrors.educationType ? 'is-invalid' : ''}`}
          value={formData.educationType}
          onChange={handleChange}
        >
          <option value="">Select Education Type</option>
          {masterData?.educationTypes.map(e => (
            <option key={e.educationTypeId} value={e.educationTypeId}>
              {e.educationType}
            </option>
          ))}
        </select>
        {formErrors.educationType && (
          <div className="invalid-feedback">{formErrors.educationType}</div>
        )}
      </div>

      <div className="col-md-3 col-sm-12 mt-3">
        <label htmlFor="eduCert" className="form-label">Education Certificate <span className="text-danger">*</span></label>
        {!certificateFile && !existingDocument && (
          <div
            className="border rounded d-flex flex-column align-items-center justify-content-center"
            style={{
              minHeight: "100px",
              cursor: "pointer",
              opacity: 1
            }}
            onClick={handleBrowse}
          >
            {/* Upload Icon */}
            <FontAwesomeIcon
              icon={faUpload}
              className="me-2 text-secondary"
            />
            {/* Upload Text */}
            <div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
              Click to upload
            </div>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              PDF, JPG or PNG (Max 2MB)
            </div>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {existingDocument && !certificateFile && (
          <div
            className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
            style={{
              border: "2px solid #bfc8e2",
              borderRadius: "8px",
              background: "#f7f9fc"
            }}
          >
            {/* LEFT SIDE: Check icon + File name + size */}
            <div className="d-flex align-items-center">
              <img
                src={greenCheck}
                alt="Check"
                style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#42579f" }}>
                  {existingDocument.displayName ?? existingDocument.fileName}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: View / Edit / Delete */}
            <div className="d-flex gap-2">
              <div onClick={() => handleEyeClick(existingDocument.fileUrl)}>
                <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
              </div>
              {/* Delete */}
              <img
                src={deleteIcon}
                alt="Delete"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => {
                  setExistingDocument(null);
                  setCertificateFile(null);
                }}
              />
            </div>
          </div>
        )}

        {certificateFile && (
          <div
            className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
            style={{
              border: "2px solid #bfc8e2",
              borderRadius: "8px",
              background: "#f7f9fc"
            }}
          >
            {/* LEFT SIDE: Check icon + File name + size */}
            <div className="d-flex align-items-center">
              <img
                src={greenCheck}
                alt="Check"
                style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#42579f" }} className="wraptext">
                  {certificateFile?.name}
                </div>
                <div className="text-muted" style={{ fontSize: "12px" }}>
                  {formatFileSize(certificateFile.size)}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: View / Edit / Delete */}
            <div className="d-flex gap-2">
              {/* View */}
              <img
                src={viewIcon}
                alt="View"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => window.open(URL.createObjectURL(certificateFile), "_blank")}
              />

              {/* Delete */}
              <img
                src={deleteIcon}
                alt="Delete"
                style={{ width: "25px", cursor: "pointer" }}
                onClick={() => setCertificateFile(null)}
              />
            </div>
          </div>
        )}
        {formErrors.certificateFile && (
          <div className="invalid-feedback d-block">{formErrors.certificateFile}</div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center gap-2 mt-2">
        <div className='d-flex'>
          <img src={bulbIcon} alt="Bulb" style={{ width: '25px', height: '25px', marginTop: '6px', marginRight: '5px' }} />
          <p className='orange_text mt-2 mb-0'>Please convert CGPA into percentage, if applicable.</p>
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary mt-3"
            // disabled={isSaving || !localDirty}
            disabled={isSaving}
            style={{
              backgroundColor: "#ff7043",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              color: "#fff",
            //  opacity: isSaving || !localDirty ? 0.6 : 1,
              // cursor: isSaving || !localDirty ? "not-allowed" : "pointer"
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
});

export default EducationForm;
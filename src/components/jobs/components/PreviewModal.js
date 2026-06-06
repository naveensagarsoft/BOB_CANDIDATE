import React, { useState, useEffect } from "react";
import { Modal, Accordion } from "react-bootstrap";
import "../../../css/PreviewModal.css";
import logo_Bob from "../../../assets/bob-logo.png";
import sign from "../../../assets/download.png";
import viewIcon from "../../../assets/view-icon.png";
// import TurnstileWidget from "../../integrations/Cpatcha/TurnstileWidget";
import masterApi from "../../../services/master.api";
import authApi from "../../auth/services/auth.api";
import { handleEyeClick } from "../../../shared/utils/fileDownload";
import bulbIcon from "../../../assets/bulb-icon.png";
import jobsApiService from "../services/jobsApiService";

import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { useRef } from "react";

const VerifiedSVG = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="#28a745" strokeWidth="2" />
    <path
      d="M7 12.5l2.5 2.5L17 8"
      stroke="#28a745"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const PreviewModal = ({
  show,
  onHide,
  previewData,
  onEditProfile,
  onProceedToPayment,
  selectedJob,
  masterData,

  onBack,
  applyForm,              // ✅ NEW
  onApplyFormChange,       // ✅ NEW
  formErrors,
  setFormErrors,
  interviewCentres,
  setTurnstileToken,
  states,             // ✅ NEW: Zonal states for location preferences
  preferenceCount = 3  // ✅ NEW: Track number of state preferences (1 or 3)
}) => {
  const [declarations, setDeclarations] = useState({
    decl1: false,
    decl2: false,
    decl3: false,
  });
  const shouldShowLanguage =
    selectedJob?.isProficientInLocalLanguage &&
    preferenceCount === 1;


  // const [locations, setLocations] = useState([]);
  const [locationsMap, setLocationsMap] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [interviewCentreOptions, setInterviewCentreOptions] = useState([]);
  const [loadingInterviewCentres, setLoadingInterviewCentres] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const captchaTimerRef = useRef(null);
  const allChecked =
    declarations.decl1 &&
    declarations.decl2 &&
    declarations.decl3;

  // const [activeAccordion, setActiveAccordion] = useState(["0"]);
  const [activeAccordion, setActiveAccordion] = useState([
    "0",
    "1",
    "2",
    "3",
    "4",
  ]);
  const [photoSrc, setPhotoSrc] = useState(null);
  const [signatureSrc, setSignatureSrc] = useState(null);

  const [stateLanguages, setStateLanguages] = useState([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await masterApi.getStateLanguages();

        console.log("👉 API raw:", res);
        console.log("👉 API data:", res.data);
        console.log("👉 FINAL ARRAY:", res.data?.data);

        setStateLanguages(res.data || []);
      } catch (err) {
        console.error("❌ language API failed", err);
      }
    };

    fetchLanguages();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha();

      setCaptchaId(res.data.data.captchaId);
      setCaptchaImage(res.data.data.image);

      setCaptchaText("");
      setCaptchaError("");
      setIsCaptchaVerified(false);

      // 🔥 reset timer
      if (captchaTimerRef.current) {
        clearTimeout(captchaTimerRef.current);
      }

      // ❌ don't start timer if already verified
      if (!isCaptchaVerified) {
        captchaTimerRef.current = setTimeout(() => {
          fetchCaptcha();
        }, 120000);
      }

    } catch (err) {
      console.error("Captcha fetch failed", err);
    }
  };

  useEffect(() => {
    if (show) {
      fetchCaptcha();
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (captchaTimerRef.current) {
        clearTimeout(captchaTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCaptchaVerified && captchaTimerRef.current) {
      clearTimeout(captchaTimerRef.current);
    }
  }, [isCaptchaVerified]);

  // const handleVerifyCaptcha = async () => {
  //   if (!captchaText.trim()) {
  //     setCaptchaError("Captcha is required");
  //     return;
  //   }

  //   try {
  //     const res = await authApi.verifyCaptcha(captchaId, captchaText);
  //     console.log("Captcha verification response:", res);

  //     if (res.data.success) {
  //       setIsCaptchaVerified(true);
  //       setCaptchaError("");
  //     } else {
  //       throw new Error();
  //     }

  //   } catch (err) {
  //     setIsCaptchaVerified(false);
  //     setCaptchaError("Invalid captcha");
  //     fetchCaptcha(); // refresh on failure
  //   }
  // };

  const handleVerifyCaptcha = async () => {
    if (!captchaText.trim()) {
      setCaptchaError("Captcha is required");
      return;
    }

    try {
      const res = await authApi.verifyCaptcha(captchaId, captchaText);

      const message = res?.data?.message || "";

      // ✅ Invalid case → show toast with backend message
      if (message.toLowerCase().includes("invalid")) {
        setIsCaptchaVerified(false);
        setCaptchaError(message);

        toast.error(message);   // 🔥 YOUR REQUIREMENT

        fetchCaptcha();         // refresh captcha
        return;
      }

      // ✅ Success case → NO toast
      setIsCaptchaVerified(true);
      setCaptchaError("");

    } catch (err) {
      const message =
        err?.response?.data?.message || "Something went wrong";

      setIsCaptchaVerified(false);
      setCaptchaError(message);

      toast.error(message);     // only for real errors
      fetchCaptcha();
    }
  };

  // const states = states ?? []; // ✅ Use states for location preferences
  const stateIds = selectedJob?.state_id_array ?? [];

  const hasInvalidIds =
    stateIds.length &&
    !stateIds.some(id => states.some(s => s.state_id === id));

  const availableStates =
    !(selectedJob?.isLocationWise || selectedJob?.is_location_preference_enabled) || hasInvalidIds
      ? states   // ⚠️ fallback - show all states
      : selectedJob?.isLocationWise && stateIds.length > 0
        ? states.filter(s => stateIds.includes(s.state_id)) // ✅ isLocationWise: filter by stateIds
        : states; // ✅ is_location_preference_enabled: show all states

  const cityIds = selectedJob?.city_id_array ?? [];

  const hasInvalidCityIds =
    cityIds.length &&
    !cityIds.some(id => masterData.cities.some(c => c.city_id === id));


  const availableCities =
    !(selectedJob?.isLocationWise || selectedJob?.is_location_preference_enabled) || hasInvalidCityIds
      ? masterData.cities   // ⚠️ fallback → all cities
      : selectedJob?.isLocationWise && cityIds.length > 0
        ? masterData.cities.filter(c => cityIds.includes(c.city_id)) // ✅ filtered
        : masterData.cities; // ✅ show all

  useEffect(() => {
    if (
      formErrors?.ctc ||
      formErrors?.examCenter
    ) {
      setActiveAccordion(["4"]); // 👈 Add Preference section
    }
  }, [formErrors]);


  useEffect(() => {
    if (show) {
      setDeclarations({
        decl1: false,
        decl2: false,
        decl3: false,
      });
    } else {
      // ✅ Reset formErrors when modal is closed
      setFormErrors({});
    }
  }, [show, setFormErrors]);


  // const fetchLocationsForState = (stateId, index) => {
  //   if (!stateId) return;

  //   // ✅ Use already filtered cities (single source of truth)
  //   const filteredCities = availableCities.filter(
  //     (city) => city.state_id === stateId
  //   );

  //   setLocationsMap((prev) => ({
  //     ...prev,
  //     [index]: filteredCities
  //   }));
  // };

  const fetchLocationsForState = (stateId, index) => {
    if (!stateId) return;

    const distributions = selectedJob?.positionStateDistributions?.filter(
      (d) => d.stateId === stateId
    );

    // ✅ Extract all cityIds
    const cityIds = [...new Set(
      distributions
        ?.map(d => d.cityId)
        .filter(Boolean) // remove null
    )];

    let filteredCities = [];

    if (cityIds.length > 0) {
      // ✅ Case: state has specific city restrictions (multiple allowed)
      filteredCities = masterData.cities.filter(
        (city) => cityIds.includes(city.city_id)
      );
    } else {
      // ✅ Case: no restriction → show all cities of state
      filteredCities = masterData.cities.filter(
        (city) => city.state_id === stateId
      );
    }

    setLocationsMap((prev) => ({
      ...prev,
      [index]: filteredCities,
    }));
  };

  useEffect(() => {
    if (!show) return;

    setLoadingInterviewCentres(true);
    const orgTypes = ["Zonal Office"];
    masterApi
      .getInterviewCentresByState(orgTypes, "") // 👈 explicitly empty
      .then((res) => {
        setInterviewCentreOptions(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch interview centres", err);
        setInterviewCentreOptions([]);
      })
      .finally(() => {
        setLoadingInterviewCentres(false);
      });
  }, [show]);

  const allDocs = previewData?.documents?.allDocs || [];

  const photoDoc = allDocs.find(
    (doc) => doc.displayname?.toLowerCase() === "photo"
  );

  const signatureDoc = allDocs.find(
    (doc) => doc.displayname?.toLowerCase() === "signature"
  );

  const photoUrl = photoDoc?.url || null;
  const signatureUrl = signatureDoc?.url || null;



  useEffect(() => {
    const loadImages = async () => {
      try {
        if (photoUrl) {
          const res = await masterApi.getSasUrl(photoUrl);
          setPhotoSrc(res.replace(/\s+/g, "")); // ✅ SAS URL
        }

        if (signatureUrl) {
          const res = await masterApi.getSasUrl(signatureUrl);
          setSignatureSrc(res.replace(/\s+/g, "")); // ✅ SAS URL
        }
      } catch (err) {
        console.error("Failed to load images", err);
      }
    };

    loadImages();
  }, [photoUrl, signatureUrl]);

  if (!previewData) {
    return null;
  }
  const allDocuments = Object.values(previewData.documents || {}).flat();
  const hasErrors = Object.values(formErrors || {}).some(
    (val) => val !== null && val !== undefined && val !== ""
  );

  const validateLocation = async ({ stateId, cityId, field, languageId }) => {
    try {
      const res = await jobsApiService.checkStateEligibility({
        positionId: selectedJob?.position_id,
        stateId,
        ...(cityId && { cityId }),
        ...(languageId && { languageId }),
      });

      if (res?.data === false) {
        setFormErrors(prev => ({
          ...prev,
          [`${field}Eligibility`]: res?.message || "Not eligible",
        }));
      }
    } catch (err) {
      setFormErrors(prev => ({
        ...prev,
        [`${field}Eligibility`]: "Failed to validate",
      }));
    }
  };

  const getStateDistribution = (stateId) => {
    return selectedJob?.positionStateDistributions?.find(
      d => d.stateId === stateId
    );
  };

  const isLocationMandatory = (stateId) => {
    const distributions = selectedJob?.positionStateDistributions?.filter(
      d => d.stateId === stateId
    );

    return distributions?.some(d => d.cityId);
  };


  const filteredLanguages = stateLanguages?.filter(
    l => l.stateId === applyForm.state1
  );
  const shouldDisableLanguage =
    !applyForm.state1 ||
    (isLocationMandatory(applyForm.state1) && !applyForm.location1);
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      dialogClassName="bob-preview-modal"
    >
      <Modal.Body className="bob-modal-body position-relative">
        {/* Close Button */}
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ top: '6px', right: '15px', zIndex: 1 }}
          onClick={onHide}
          aria-label="Close"
        />

        {/* ===== HEADER ===== */}
        <div className="bob-header">
          <div className="title_pre">
            <span>{selectedJob?.requisition_code} - {selectedJob?.requisition_title}</span>
          </div>
          <div className="bob-header-title">
            {selectedJob?.position_title ||
              "Deputy Manager : Product - ONDC (Open Network for Digital Commerce)"}
          </div>
        </div>

        {/* ===== ACCORDION ===== */}
        {/* <Accordion defaultActiveKey={["0"]} alwaysOpen className="bob-accordion"> */}
        <Accordion
          activeKey={activeAccordion}
          onSelect={(key) => setActiveAccordion(key)}
          alwaysOpen
          className="bob-accordion"
        >

          {/* === PERSONAL DETAILS === */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Personal Details</Accordion.Header>
            <Accordion.Body>
              <div className="personal-details-wrapper">
                <table className="table table-bordered bob-table w-100 mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-med" style={{ width: "20%" }}>Full Name</td>
                      <td className="fw-reg" colSpan={4} style={{ width: "60%" }}>
                        {previewData.personalDetails.fullName}
                      </td>


                      <td
                        rowSpan="3"
                        className="bob-photo-cell"
                      >
                        <div className="photo-signature-wrapper">

                          {/* PHOTO */}
                          <div className="photo-box">
                            <img
                              src={photoSrc || logo_Bob}
                              alt="Applicant"
                              className="photo-img"
                            />
                          </div>


                          <div className="signature-box">
                            <img
                              src={signatureSrc || sign}
                              alt="Signature"
                              className="signature-img"
                            />
                          </div>

                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="fw-med">Address</td>
                      <td className="fw-reg" colSpan={4}>{previewData.personalDetails.address}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Permanent Address</td>
                      <td className="fw-reg" colSpan={4}>{previewData.personalDetails.permanentAddress}</td>
                    </tr>

                    <tr >
                      <td className="fw-med" >Mobile</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.mobile}</td>
                      <td className="fw-med">Email</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.email}</td>
                    </tr>

                    <tr >
                      <td className="fw-med">Mother’s Name</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.motherName || "-"}</td>
                      <td className="fw-med">Father’s Name</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.fatherName}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Gender</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.gender_name || "-"}</td>
                      <td className="fw-med">Religion</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.religion_name || "-"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Category</td>
                      <td className="fw-reg" colSpan={2}  >{previewData.personalDetails.reservationCategory_name || "-"}</td>
                      <td className="fw-med">Caste/Community</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.caste || "-"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Date of Birth</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.dob}</td>
                      <td className="fw-med">Age (as on cut-off date)</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.age || "-"}</td>



                      {/* <td className="fw-med">Age (as on cut-off date)</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.age || "-"}</td> */}
                    </tr>

                    <tr>
                      <td className="fw-med">Ex-serviceman</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.exService || "N/A"}</td>
                      <td className="fw-med">Physical Disability</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.physicalDisability || "N"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Nationality</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.nationality_name}</td>
                      <td className="fw-med">Current CTC</td>
                      <td className="fw-reg" colSpan={2}>{previewData.experienceSummary?.currentCtc || "-"}</td>
                      {/* <td className="fw-med"></td>
                      <td className="fw-reg" colSpan={2}></td> */}
                    </tr>

                    <tr>
                      <td className="fw-med">Marital Status</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.maritalStatus_name}</td>
                      <td className="fw-med">Name of Spouse</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.spouseName || "-"}</td>
                    </tr>
                    <tr>
                      <td className="fw-med">Twin Sibling</td>
                      {/* <td className="fw-reg" colSpan={2}>{previewData.personalDetails.isTwin}</td> */}
                      <td className="fw-reg" colSpan={2}>
                        {previewData.personalDetails.isTwin === "Yes"
                          ? `Yes (${previewData.personalDetails.twinName})`
                          : "No"}
                      </td>
                      {/* <td className="fw-med">Details</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.isTwin === "YES"
                        ? `${previewData.personalDetails.twinName} (${previewData.personalDetails.twinGender_name})`
                        : "-"}</td> */}
                      <td className="fw-med">CIBIL Score</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.cibilScore}</td>
                    </tr>


                    <tr>
                      {/* <td className="fw-med">Current CTC</td>
                      <td className="fw-reg" colSpan={2}>{previewData.experienceSummary?.currentCtc || "-"}</td> */}
                      <td className="fw-med">Language Proficiency</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.languages || "-"}</td>
                      <td className="fw-med">Social Media Profile links</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.socialMediaProfileLink}</td>
                      {/* <td className="fw-med">Expected CTC</td>
                      <td className="fw-reg" colSpan={2}>{preferences.ctc ? `₹${Number(preferences.ctc).toLocaleString()}` : "-"}</td> */}
                    </tr>



                    {/* <tr>
                      <td className="fw-med">Location Preference 1</td>
                      <td className="fw-reg" colSpan={2}>{state1?.state_name || "-"}</td>
                      <td className="fw-med">Location Preference 2</td>
                      <td className="fw-reg" colSpan={2}>{state2?.state_name || "-"}</td>
                    </tr> */}

                    {/*<tr>
                       <td className="fw-med">Location Preference 3</td>
                      <td className="fw-reg" colSpan={2}>{state3?.state_name || "-"}</td> 
                      <td className="fw-med">Social Media Profile links</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.socialMediaProfileLink}</td>
                    </tr>*/}

                    <tr>
                      <td className="fw-med">Already secured regular employment under the Central Govt. in civil post?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.centralGovtEmployment || "No"}</td>
                      <td className="fw-med">Serving at a post lower than the one advertised?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.servingLowerPost || "No"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Family member of those who died in 1984 riots?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.familyMember1984 || "No"}</td>
                      <td className="fw-med">Belong to Religious Minority Community?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.religiousMinority || "No"}</td>
                    </tr>

                    <tr>
                      <td className="fw-med">Whether serving in Govt./ quasi Govt./ Public Sector Undertaking?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.servingInGovt || "No"}</td>
                      <td className="fw-med">Disciplinary action in any of your previous/ Current Employment?</td>
                      <td className="fw-reg" colSpan={2}>{previewData.personalDetails.disciplinaryAction || "No"}</td>
                    </tr>

                    {previewData.personalDetails.disciplinaryAction === "Yes" && (
                      <tr>
                        <td className="fw-med">Details of disciplinary proceedings, if Any</td>
                        <td className="fw-reg" colSpan={5}>{previewData.personalDetails.disciplinaryDetails || "N/A"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* === EDUCATION DETAILS === */}
          {/* <Accordion.Item eventKey="1">
            <Accordion.Header>Education Details</Accordion.Header>
            <Accordion.Body>
              <div className="table-responsive">
                <table className="table table-bordered bob-table">
                  <thead className="table-header">
                    <tr>
                      <th>S. No</th>
                      <th>Education Level</th>
                      <th>School/College</th>
                      <th>Board</th>
                      <th>Specialization</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.education.map((edu, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>

                      
                        <td>{edu.educationLevel_name || "-"}</td>

                       
                        <td>{edu.institution || "-"}</td>

                      
                        <td>{edu.mandatoryQualification_name || "-"}</td>

                        
                        <td>{edu.specialization_name || "-"}</td>

                       
                        <td>{edu.startDate || "-"}</td>
                        <td>{edu.endDate || "-"}</td>

                       
                        <td>
                          {edu.percentage !== null && edu.percentage !== undefined
                            ? edu.percentage <= 10
                              ? `${edu.percentage} CGPA`
                              : `${edu.percentage}%`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item> */}

          <Accordion.Item eventKey="1">
            <Accordion.Header>Education Details</Accordion.Header>
            <Accordion.Body>
              <div className="table-responsive">
                <table className="edu-table">
                  <thead>
                    <tr>
                      <th style={{ width: "4rem" }}>S. No</th>
                      <th>Education Level</th>
                      <th>School/College</th>
                      <th>University</th>
                      <th>Board/Course</th>
                      <th>Specialization</th>
                      <th style={{ width: '10%' }}>From Date</th>
                      <th style={{ width: '10%' }}>To Date</th>
                      <th style={{ width: '9%' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {previewData.education.map((edu, idx) => ( */}
                    {[...(previewData.education || [])]
                      .sort((a, b) => {
                        const getSortDate = (edu) => {
                          if (edu?.startDate && edu.startDate !== "-") {
                            return new Date(
                              edu.startDate.split("-").reverse().join("-")
                            );
                          }

                          if (edu?.endDate && edu.endDate !== "-") {
                            return new Date(
                              edu.endDate.split("-").reverse().join("-")
                            );
                          }

                          return new Date(0);
                        };

                        return getSortDate(b) - getSortDate(a);
                      })
                      .map((edu, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{edu.educationLevel_name || "-"}</td>
                          <td>{edu.institution || "-"}</td>
                          <td>{edu.universityName || "-"}</td>
                          <td>{edu.mandatoryQualification_name || "-"}</td>
                          <td>{edu.specialization_name || "-"}</td>
                          <td>{edu.startDate || "-"}</td>
                          <td>{edu.endDate || "-"}</td>
                          <td>
                            {edu.percentage != null && !isNaN(Number(edu.percentage))
                              ? `${Number(edu.percentage).toFixed(2)}%`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* === EXPERIENCE DETAILS === */}
          {/* <Accordion.Item eventKey="2">
            <Accordion.Header>Experience Details</Accordion.Header>
            <Accordion.Body>
             

              
              <div className="table-responsive">
                <table className="table table-bordered bob-table">
                  <thead className="table-header">
                    <tr>
                      <th>S. No</th>
                      <th>Organization</th>
                      <th>Post</th>
                      <th>Role</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Experience</th>
                      <th>Brief Description of Work</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!previewData.experience || previewData.experience.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No experience details available
                        </td>
                      </tr>
                    ) : (
                      previewData.experience.map((exp, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{exp.org || "-"}</td>
                          <td>{exp.designation || "-"}</td>
                          <td>{exp.department || "-"}</td>
                          <td>{exp.from || "-"}</td>
                          <td>{exp.to || "-"}</td>
                          <td>{exp.duration || "-"}</td>
                          <td>{exp.nature || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Accordion.Body>
          </Accordion.Item> */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Experience Details</Accordion.Header>
            <Accordion.Body>

              <div className="table-responsive">
                <table className="exp-table">
                  <thead>
                    <tr>
                      <th style={{ width: "4rem" }}>S. No</th>
                      <th>Organization</th>
                      <th>Post</th>
                      <th>Role</th>
                      <th className="date-col">From Date</th>
                      <th className="date-col">To Date</th>
                      <th className="date-col">Duration</th>
                      <th>Brief Description of work profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!previewData.experience || previewData.experience.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center" }}>
                          No experience details available
                        </td>
                      </tr>
                    ) : (
                      previewData.experience.map((exp, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{exp.org || "-"}</td>
                          <td>{exp.designation || "-"}</td>
                          <td>{exp.department || "-"}</td>
                          <td>{exp.from || "-"}</td>
                          <td>{exp.to || "-"}</td>
                          <td>{exp.duration || "-"}</td>
                          <td>{exp.nature || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </Accordion.Body>
          </Accordion.Item>
          {/* === DOCUMENT DETAILS === */}
          {/* <Accordion.Item eventKey="3">
            <Accordion.Header>Documents Details</Accordion.Header>
            <Accordion.Body>
              <table className="table table-bordered bob-table">
                <thead className="table-header">
                  <tr>
                    <th>File Type</th>
                    <th className="textCenter">Action</th>
                    <th>File Type</th>
                    <th className="textCenter">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allDocuments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No documents available
                      </td>
                    </tr>
                  )}

                  {allDocuments.map((doc, index) => {
                    if (index % 2 !== 0) return null; // process in pairs only

                    const nextDoc = allDocuments[index + 1];

                    return (
                      <tr key={index}>
                        
                        <td>{doc.displayname ? doc.displayname : doc.name}</td>
                        <td className="textCenter">
                          <img
                            src={viewIcon}
                            alt="View"
                            style={{ width: "25px", cursor: "pointer" }}
                            onClick={() => handleEyeClick(doc.url)}
                          />
                        </td>

                        
                        {nextDoc ? (
                          <>
                            <td>{nextDoc.displayname ? nextDoc.displayname : nextDoc.name}</td>
                            <td className="textCenter">
                              <img
                                src={viewIcon}
                                alt="View"
                                style={{ width: "25px", cursor: "pointer" }}
                                onClick={() => handleEyeClick(nextDoc.url)}
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td>-</td>
                            <td >-</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Accordion.Body>
          </Accordion.Item> */}

          <Accordion.Item eventKey="3">
            <Accordion.Header>Documents Details</Accordion.Header>
            <Accordion.Body>
              <table className="bob-doc-table">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>File Type</th>
                    <th className="textCenter" style={{ width: '10%' }}>Action</th>
                    <th style={{ width: "40%" }}>File Type</th>
                    <th className="textCenter" style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allDocuments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No documents available
                      </td>
                    </tr>
                  )}

                  {allDocuments.map((doc, index) => {
                    if (index % 2 !== 0) return null;

                    const nextDoc = allDocuments[index + 1];

                    return (
                      <tr key={index}>
                        {/* LEFT DOCUMENT */}
                        <td>{doc.displayname || doc.name}</td>

                        <td className="action-cell text-center imgbtn">
                          <button
                            onClick={() => handleEyeClick(doc.url)}
                            className="icon-button"
                          >
                            <img src={viewIcon} alt="View document" style={{ width: "25px", cursor: "pointer" }} />
                          </button>

                        </td>

                        {/* RIGHT DOCUMENT */}
                        {nextDoc ? (
                          <>
                            <td className="w-75">{nextDoc.displayname || nextDoc.name}</td>

                            <td className="action-cell text-center imgbtn">
                              <button
                                onClick={() => handleEyeClick(doc.url)}
                                className="icon-button"
                              >
                                <img src={viewIcon} alt="View document" style={{ width: "25px", cursor: "pointer" }} />

                              </button>

                            </td>
                          </>
                        ) : (
                          <>
                            <td>-</td>
                            <td className="action-cell">-</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>
              {(selectedJob?.isLocationWise ||
                selectedJob?.is_location_preference_enabled)
                ? (
                  selectedJob?.is_location_preference_enabled &&
                  !selectedJob?.isLocationWise
                )
                  ? "Add Preference"
                  : "Selection Details"
                : "Interview Details"}
            </Accordion.Header>

            <Accordion.Body>
              <div className="row g-3">

                {/* LOCATION PREFERENCES */}
                {(selectedJob?.isLocationWise || selectedJob?.is_location_preference_enabled) && (
                  <>
                    {/* STATE ROW */}
                    {Array.from({ length: preferenceCount }, (_, i) => i + 1).map((i) => (
                      <div className="col-md-4" key={`state-${i}`}>
                        <label className="form-label">
                          {selectedJob?.is_location_preference_enabled &&
                            !selectedJob?.isLocationWise
                            ? `State Preference ${i}`
                            : `State`}
                          {preferenceCount === 1 && <span className="text-danger"> *</span>}
                        </label>

                        <select
                          className={`form-control ${formErrors?.[`state${i}`] ? 'is-invalid' : ''}`}
                          value={applyForm[`state${i}`]}
                          // onChange={(e) => {
                          //   const stateId = e.target.value;

                          //   onApplyFormChange(`state${i}`, stateId);
                          //   onApplyFormChange(`location${i}`, "");

                          //   // ✅ Clear errors when value changes
                          //   setFormErrors(prev => {
                          //     const updated = { ...prev };
                          //     delete updated[`state${i}`];
                          //     delete updated[`location${i}`];
                          //     return updated;
                          //   });

                          //   fetchLocationsForState(stateId, i);
                          // }}
                          onChange={(e) => {
                            const stateId = e.target.value;

                            onApplyFormChange(`state${i}`, stateId);
                            onApplyFormChange(`location${i}`, "");

                            if (i === 1) {
                              onApplyFormChange("language", "");
                              onApplyFormChange("languageStudiedIn10or12", false);
                            }

                            const isCityMandatory = isLocationMandatory(stateId);

                            setFormErrors(prev => {
                              const updated = { ...prev };
                              delete updated[`state${i}`];
                              delete updated[`location${i}`];

                              if (i === 1) {
                                delete updated.stateEligibility;
                                delete updated.locationEligibility;
                                delete updated.languageEligibility;
                                delete updated.language;
                              }

                              return updated;
                            });

                            fetchLocationsForState(stateId, i);

                            // ✅ ONLY call API here if NO cityId
                            if (
                              preferenceCount === 1 &&
                              !shouldShowLanguage &&   // ✅ ADD THIS
                              stateId &&
                              !isCityMandatory
                            ) {
                              validateLocation({
                                stateId,
                                field: "state",
                              });
                            }
                          }}
                        >
                          <option value="">Select State</option>

                          {availableStates.map((s) => (
                            <option key={s.state_id} value={s.state_id}>
                              {s.state_name}
                            </option>
                          ))}
                        </select>
                        {formErrors?.[`state${i}`] && (
                          <div className="invalid-feedback d-block">
                            {formErrors[`state${i}`]}
                          </div>
                        )}


                        {i === 1 && formErrors?.stateEligibility && (
                          <div className="invalid-feedback d-block">
                            {formErrors.stateEligibility}
                          </div>
                        )}

                        {formErrors?.languageEligibility && (
                          <div className="invalid-feedback d-block inlinecls">
                            {formErrors.languageEligibility}
                          </div>
                        )}
                      </div>

                    ))}


                    {/* LOCATION ROW */}
                    {Array.from({ length: preferenceCount }, (_, i) => i + 1).map((i) => (
                      <div className="col-md-4" key={`location-${i}`}>
                        <label className="form-label">
                          {selectedJob?.is_location_preference_enabled &&
                            !selectedJob?.isLocationWise
                            ? `Location Preference ${i}`
                            : `Location`}
                          {isLocationMandatory(applyForm.state1) && (
                            <span className="text-danger"> *</span>
                          )}
                          {/* {preferenceCount === 1 && <span className="text-danger"> *</span>} */}
                        </label>

                        <select
                          className={`form-control ${formErrors?.[`location${i}`] ? 'is-invalid' : ''}`}
                          value={applyForm[`location${i}`]}
                          disabled={!applyForm[`state${i}`]}
                          // onChange={(e) => {
                          //   onApplyFormChange(`location${i}`, e.target.value);

                          //   // ✅ Clear errors when value changes
                          //   setFormErrors(prev => {
                          //     const updated = { ...prev };
                          //     delete updated[`location${i}`];
                          //     return updated;
                          //   });
                          // }}
                          onChange={(e) => {
                            const cityId = e.target.value;
                            const stateId = applyForm[`state${i}`];

                            onApplyFormChange(`location${i}`, cityId);

                            if (i === 1) {
                              onApplyFormChange("language", "");
                            }

                            const isCityMandatory = isLocationMandatory(stateId);

                            setFormErrors(prev => {
                              const updated = { ...prev };
                              delete updated[`location${i}`];

                              if (i === 1) {
                                delete updated.locationEligibility;
                                delete updated.languageEligibility;
                                delete updated.language;
                              }

                              return updated;
                            });
                            // ✅ ONLY call API here if cityId exists in distribution

                            if (
                              preferenceCount === 1 &&
                              !shouldShowLanguage &&   // ✅ ADD THIS
                              stateId &&
                              isCityMandatory &&
                              cityId
                            ) {
                              validateLocation({
                                stateId,
                                cityId,
                                field: "location",
                              });
                            }
                          }}
                        >
                          <option value="">Select Location</option>

                          {applyForm[`state${i}`] && !(locationsMap[i]?.length) && (
                            <option disabled>
                              No locations available
                            </option>
                          )}

                          {(locationsMap[i] || []).map((loc) => (
                            <option key={loc.city_id} value={loc.city_id}>
                              {loc.city_name}
                            </option>
                          ))}
                        </select>
                        {formErrors?.[`location${i}`] && (
                          <div className="invalid-feedback d-block">
                            {formErrors[`location${i}`]}
                          </div>
                        )}

                        {i === 1 && formErrors?.locationEligibility && (
                          <div className="invalid-feedback d-block">
                            {formErrors.locationEligibility}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* ✅ EXPECTED CTC (ONLY FOR CONTRACT) */}
                {selectedJob?.employment_type?.toLowerCase() === "contract" && (
                  <div className="col-md-4">
                    <label htmlFor="ctc" className="form-label">
                      Expected CTC <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      id="ctc"
                      className="form-control"
                      value={applyForm.ctc}
                      onChange={(e) => {
                        onApplyFormChange("ctc", e.target.value);
                        // setFormErrors(prev => ({ ...prev, ctc: "" }));
                        setFormErrors(prev => {
                          const updated = { ...prev };
                          delete updated.ctc;
                          return updated;
                        });
                      }}
                    />

                    {formErrors?.ctc && (
                      <div className="invalid-feedback d-block">
                        {formErrors.ctc}
                      </div>
                    )}
                  </div>
                )}

                {shouldShowLanguage && (
                  <div className="col-md-4">
                    <label className="form-label">

                      Language <span className="text-danger">*</span>
                    </label>

                    <select
                      className={`form-control ${formErrors?.language ? "is-invalid" : ""}`}
                      value={applyForm.language}
                      //disabled={!applyForm.state1}
                      disabled={shouldDisableLanguage}
                      // onChange={(e) =>
                      //   onApplyFormChange("language", e.target.value)
                      // }
                      onChange={(e) => {
                        const languageId = e.target.value;

                        onApplyFormChange("language", languageId);

                        setFormErrors(prev => {
                          const updated = { ...prev };
                          delete updated.languageEligibility;
                          delete updated.language;
                          return updated;
                        });
                        const stateId = applyForm.state1;
                        const isCityMandatory = isLocationMandatory(stateId);
                        if (applyForm.state1 && languageId) {
                          validateLocation({
                            stateId,
                            ...(isCityMandatory && applyForm.location1 && { cityId: applyForm.location1 }),
                            languageId,
                            field: "language",
                          });
                        }
                      }}
                    >
                      <option value="">
                        {!applyForm.state1
                          ? "Select Language"
                          : "Select Language"}
                      </option>

                      {filteredLanguages?.map(l => {
                        const langName = masterData.languages?.find(
                          m => m.language_id === l.languageId
                        )?.language_name;

                        return (
                          <option key={l.languageId} value={l.languageId}>
                            {langName || l.languageId}
                          </option>
                        );
                      })}

                      {applyForm.state1 && filteredLanguages?.length === 0 && (
                        <option disabled>No languages available</option>
                      )}
                    </select>
                    {formErrors?.language && (
                      <div className="invalid-feedback d-block">
                        {formErrors.language}
                      </div>
                    )}

                    {/* ✅ ADD THIS BLOCK */}
                    {applyForm.language && (
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="languageStudiedCheck"
                          checked={applyForm.languageStudiedIn10or12 || false}
                          onChange={(e) =>
                            onApplyFormChange(
                              "languageStudiedIn10or12",
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor="languageStudiedCheck"
                          className="form-check-label"
                        >
                          Language studied in 10th / 12th
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ EXAM / INTERVIEW CENTER (ALWAYS SHOW) */}
                <div className="col-md-4">
                  <label htmlFor="examCenter" className="form-label">
                    Interview Center <span className="text-danger">*</span>
                  </label>

                  <select
                    className={`form-control ${formErrors?.examCenter ? "is-invalid" : ""}`}
                    value={applyForm.examCenter}
                    onChange={(e) => {
                      onApplyFormChange("examCenter", e.target.value);
                      setFormErrors(prev => ({ ...prev, examCenter: null }));
                    }}
                  >
                    <option value="">Select Interview Center</option>

                    {loadingInterviewCentres && (
                      <option disabled>Loading interview centres...</option>
                    )}

                    {interviewCentreOptions.map((centre) => (
                      <option key={centre.interviewCentreId} value={centre.interviewCentreId}>
                        {centre.displayName}
                      </option>
                    ))}
                  </select>

                  {formErrors.examCenter && (
                    <div className="invalid-feedback d-block">
                      {formErrors.examCenter}
                    </div>
                  )}
                </div>



              </div>
            </Accordion.Body>
          </Accordion.Item>

        </Accordion>



        {/* ===== DECLARATION + BUTTONS ===== */}
        <div className="mt-4 text-center">
          {/* <div className="captcha-box mb-3">
            <span className="captcha-text">X A Y 2 U</span>
            <input type="text" className="captcha-input" />
          </div> */}
          {/* <TurnstileWidget onTokenChange={setTurnstileToken} /> */}

          {isCaptchaVerified ? (

            <div style={{
              marginTop: "10px", display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            }}>
              <VerifiedSVG size={70} />
              <div style={{
                color: "#28a745",
                fontWeight: 500
              }} className="mb-4">
                Captcha Verified
              </div>
            </div>
          ) : (

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px"
            }}>


              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }} className="captcha-box">
                <img
                  src={`data:image/jpeg;base64,${captchaImage}`}
                  alt="captcha"
                  style={{
                    height: "50px",
                    width: "160px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}
                />

                <button
                  type="button"
                  onClick={fetchCaptcha}
                  disabled={isCaptchaVerified}
                  title="Refresh"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isCaptchaVerified ? "not-allowed" : "pointer",
                    opacity: isCaptchaVerified ? 0.5 : 1
                  }}
                >
                  <FontAwesomeIcon icon={faRotateRight} />
                </button>
              </div>


              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "center",
                width: "100%"
              }} className="mb-3">


                <input
                  type="text"
                  value={captchaText}
                  onChange={(e) => {
                    setCaptchaText(e.target.value);
                    setCaptchaError("");
                    setIsCaptchaVerified(false);
                  }}
                  disabled={isCaptchaVerified}
                  placeholder="Enter captcha"
                  style={{
                    width: "200px",
                    height: "36px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: captchaError
                      ? "1px solid #dc3545"
                      : isCaptchaVerified
                        ? "1px solid #ccc"
                        : "",
                    background: isCaptchaVerified ? "#f5f5f5" : "#fff", // 👈 visual feedback
                    cursor: isCaptchaVerified ? "not-allowed" : "text"
                  }}
                />


                <button
                  type="button"
                  onClick={handleVerifyCaptcha}
                  disabled={isCaptchaVerified}
                  style={{
                    width: "80px",
                    height: "36px",
                    borderRadius: "6px",
                    border: "none",
                    background: isCaptchaVerified ? "#28a745" : "#F26522",
                    color: "#fff",
                    fontWeight: "500",
                    cursor: isCaptchaVerified ? "default" : "pointer"
                  }}
                >
                  {isCaptchaVerified ? " ✓ Captcha Verified" : "Verify"}
                </button>




                {captchaError && (
                  <div style={{
                    color: "#dc3545",
                    fontSize: "13px"
                  }}>
                    {captchaError}
                  </div>
                )}

              </div>

            </div>
          )}

          <div className='d-flex'>
            <img src={bulbIcon} alt="bulb icon" style={{ width: '22px', height: '22px', marginTop: '8px', marginRight: '5px' }} />
            <p className='orange_text mt-2 text-start'>The centre opted by the candidate is only a preference and not binding on the Bank. The Bank reserves the right to allot any centre at its sole discretion based on administrative considerations, and its decision shall be final and binding.</p>
          </div>

          <div className="declaration-box text-start">
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="decl1"
                checked={declarations.decl1}
                onChange={(e) =>
                  setDeclarations((prev) => ({
                    ...prev,
                    decl1: e.target.checked,
                  }))
                }
              />
              <label htmlFor="decl1" className="form-check-label decl">
                I acknowledge that any misrepresentation, omission, or furnishing of
                incorrect information may render my application liable for rejection
                at any stage of the recruitment process.
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="decl2"
                checked={declarations.decl2}
                onChange={(e) =>
                  setDeclarations((prev) => ({
                    ...prev,
                    decl2: e.target.checked,
                  }))
                }
              />
              <label htmlFor="decl2" className="form-check-label decl">
                I further confirm that all documents uploaded in this application
                have been provided voluntarily and as per my own understanding.
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="decl3"
                checked={declarations.decl3}
                onChange={(e) =>
                  setDeclarations((prev) => ({
                    ...prev,
                    decl3: e.target.checked,
                  }))
                }
              />
              <label htmlFor="decl3" className="form-check-label decl">
                I declare that I possess the requisite work experience for this post,
                as stipulated in the terms of the advertisement, and undertake to
                submit necessary documents/testimonials in support of the same.
              </label>
            </div>
          </div>


          {/* Footer Buttons */}
          <div className="d-flex justify-content-end align-items-center mt-4">
            {/* <button className="btn btn-outline-secondary" onClick={onBack}>
              ← Back
            </button> */}
            <div className="d-flex gap-3">
              {onEditProfile && (
                <button
                  className="btn edit-button"
                  onClick={onEditProfile}
                >
                  Edit Profile Details
                </button>
              )}
              {/* <button
                className="btn edit-button"
                onClick={onEditProfile}
              >
                Edit Profile Details
              </button> */}
              {onProceedToPayment && (
                <button
                  className="btn btn-bob-orange"
                  // disabled={!allChecked}
                  disabled={!allChecked || hasErrors}
                  onClick={() => {
                    if (!isCaptchaVerified) {
                      toast.error("Please verify captcha before proceeding");
                      return;
                    }

                    onProceedToPayment();
                  }}

                // onClick={onProceedToPayment}


                >
                  Proceed for Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal >
  );
};

export default PreviewModal;

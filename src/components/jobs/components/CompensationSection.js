
import { useState,useEffect} from "react";
import jobsApiService from "../../jobs/services/jobsApiService";
import { toast } from "react-toastify";
import bulb from "../../../assets/bulb-icon.png";
const CompensationSection = ({ applicationId, onHide, compensationStatus   }) => {
const [currentCTC, setCurrentCTC] = useState("");
const [expectedCTC, setExpectedCTC] = useState("");
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [submitBeforeDate, setSubmitBeforeDate] = useState(null);


const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

useEffect(() => {
  if (!applicationId) return;

  const fetchCompensationDetails = async () => {
    try {
      const res = await jobsApiService.getCompensationDetails(applicationId);

      if (res?.success && res?.data) {
       const { currentCtc, expectedCtc, submitBeforeDate } = res.data;

setCurrentCTC(currentCtc ? String(currentCtc) : "");
setExpectedCTC(expectedCtc ? String(expectedCtc) : "");

//  Correct assignment
setSubmitBeforeDate(submitBeforeDate);
      }
    } catch (error) {
      console.error("Failed to fetch compensation details", error);
      // optional toast (usually avoid noisy toasts on auto-load)
      // toast.error("Failed to load compensation details");
    }
  };

  fetchCompensationDetails();
}, [applicationId]);


// const canEdit =
//   compensationStatus === "NEW" ||
//   compensationStatus === "RENEGOTIATE";


const canEdit =
  compensationStatus === "NEW";

const formatINR = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString("en-IN");
};
const validateCompensation = () => {
  const newErrors = {};

  if (!currentCTC) {
    newErrors.currentCTC = "Current CTC is required";
  }

  if (!expectedCTC) {
    newErrors.expectedCTC = "Expected CTC is required";
  }

  if (
    currentCTC &&
    expectedCTC &&
    Number(expectedCTC) < Number(currentCTC)
  ) {
    newErrors.expectedCTC =
      "Expected CTC should be greater than or equal to Current CTC";
  }
//  if (!salarySlip) {
//     newErrors.salarySlip = "Salary slip is required";
//   }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
// const handleCompensationSubmit = async () => {
//   if (!applicationId) {
//     toast.error("Application ID missing");
//     return;
//   }

//   if (!validateCompensation()) return;

//   try {
//     setLoading(true);


//     const formData = new FormData();

// formData.append(
//   "compensation",
//   new Blob(
//     [
//       JSON.stringify({
//         applicationId: applicationId,

//         currentCtc: Number(currentCTC) || 0,
//         expectedCtc: Number(expectedCTC) || 0,

//         submitBeforeDate: submitBeforeDate, //  from state

//         compensationStatus: "NEW" //  static or dynamic
//       }),
//     ],
//     { type: "application/json" }
//   )
// );

//     await jobsApiService.saveCompensationDetails(formData);

//     toast.success("Compensation details updated successfully");
//   } catch (error) {
//     console.error("Compensation update failed", error);
//     toast.error("Failed to update compensation details");
//   } finally {
//     setLoading(false);
//   }
// };


const formatDateForAPI = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
};


const handleCompensationSubmit = async () => {
  if (!applicationId) {
    toast.error("Application ID missing");
    return;
  }

  if (!validateCompensation()) return;

  try {
    setLoading(true);

    const payload = {
      applicationId: applicationId,
      currentCtc: Number(currentCTC) || 0,
      expectedCtc: Number(expectedCTC) || 0,
      submitBeforeDate: formatDateForAPI(submitBeforeDate),
      compensationStatus: "NEW",
    };

    //  Save API
    await jobsApiService.saveCompensationDetails(payload);

    //  CALL THIS API AFTER SAVE (your requirement)
    const res = await jobsApiService.getCompensationDetails(applicationId);

    if (res?.success && res?.data) {
      const { currentCtc, expectedCtc, submitBeforeDate } = res.data;

      setCurrentCTC(currentCtc ? String(currentCtc) : "");
      setExpectedCTC(expectedCtc ? String(expectedCtc) : "");
      setSubmitBeforeDate(submitBeforeDate);
    }
    onHide(); 

    toast.success("Compensation details updated successfully");

  } catch (error) {
    console.error("Compensation update failed", error);
    toast.error("Failed to update compensation details");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="query-section bank-style">
      <h6 className="section-title">Compensation Details</h6>

      <div className="row g-4">
        {/* CTC Fields */}
        <div className="col-md-6">
          <label htmlFor="currentCTC" className="form-label">
            Current CTC <span className="text-danger">*</span>
          </label>
          <input
          id="currentCTC"
            type="text"
            className="form-control"
            value={formatINR(currentCTC)}
            readOnly={!canEdit}
            onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setCurrentCTC(raw);
                setErrors((prev) => ({ ...prev, currentCTC: "" }));
            }}
            />
            {errors.currentCTC && (
                <div className="invalid-feedback d-block">{errors.currentCTC}</div>
            )}
        </div>

        <div className="col-md-6">
          <label htmlFor="expectedCTC" className="form-label">
            Expected CTC <span className="text-danger">*</span>
          </label>
           <input
           id="expectedCTC"
            type="text"
            className="form-control"
            value={formatINR(expectedCTC)}
            readOnly={!canEdit}
            onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setExpectedCTC(raw);
                setErrors((prev) => ({ ...prev, expectedCTC: "" }));
            }}
            />
              {errors.expectedCTC && (
                    <div className="invalid-feedback d-block">{errors.expectedCTC}</div>
                )}
        </div>

       
        {/* ACTIONS */}
        <div className="col-12 d-flex align-items-center justify-content-between mt-3">
          <div className="compensation-info">
           <img src={bulb} alt="info" className="info-bulb-icon" />
            <span className="info-text">
              Please ensure that the above details are submitted on or before {formatDate(submitBeforeDate)}.
            </span>
          </div>

          <div className="query-actions">
            {/* <button
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Cancel
            </button> */}

            <button
              type="button"
              className={`btn btn-primaryy ${loading ? "disabled" : ""}`}
              onClick={handleCompensationSubmit}
              disabled={loading || !canEdit}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationSection;

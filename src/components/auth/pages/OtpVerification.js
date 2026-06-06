import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../../../css/OtpVerification.css';
import { setUser } from '../store/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import authApi from "../services/auth.api";
import EditMobileModal from "./EditMobileModal";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [showEditMobileModal, setShowEditMobileModal] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(true);

  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const credentials = useSelector((state) => state.user.credentials);

  const email = location.state?.email; // ← Get email sent from Login page
  const loginResponse = location.state?.loginResponse; // ← Get login response with mobile number and edit flag

  // Initialize mobile number from loginResponse or from state
  useEffect(() => {
    if (loginResponse?.mobileNumber && !mobileNumber) {
      setMobileNumber(loginResponse.mobileNumber);
      setLoginSuccess(loginResponse?.loginSuccess !== false);
    }
  }, [loginResponse, mobileNumber]);

  if (!email) {
    navigate("/", { replace: true });
    return null;
  }

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  }

  const handlePaste = (e, index) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, ''); // Keep only digits
    const digits = paste.split('');
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && index + i < 6; i++) {
      newOtp[index + i] = digits[i];
    }
    setOtp(newOtp);
    // Focus the next input
    const nextIndex = Math.min(index + digits.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const submitOtp = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.verifyOtp(email, otpValue);
      dispatch(setUser(res.data));

      // Check if there's an original location to redirect to (with query params)
      const from = location.state?.from;
      if (from) {
        // Redirect to the original location with all query params preserved
        navigate(from.pathname + from.search, { replace: true, state: { showDisclaimer: true } });
      } else {
        // Default redirect to candidate portal
        navigate("/candidate-portal", { replace: true, state: { showDisclaimer: true } });
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || err.response?.data?.error_description || "OTP verification failed. Please try again.");
      resetOtp();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) {
      toast.error("Email not found!");
      return;
    }
    try {
      setLoading(true);
      await authApi.resendOtp(email);
      toast.success("OTP resent successfully!");
      resetOtp();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleMobileNumberUpdate = (responseData) => {
    // responseData contains: { mobileNumber, loginSuccess, canEditMobile, responseMessage, ... }
    if (responseData?.loginSuccess) {
      setMobileNumber(responseData.mobileNumber);
      setLoginSuccess(true);
    } else {
      setLoginSuccess(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={pana} alt="Illustration" />
      </div>

      <div className="right-panel">
        <div className="logo">
          <img src={BobLogo} alt="Logo" />
          <h5 className="mt-1">Welcome to Candidate Login</h5>
        </div>

        <h4 className="text-center fw-semibold">Please enter verification code</h4>
        <p className="text-center text-muted mt-1">
          We've sent a 6-digit verification code to your registered mobile number.
        </p>

        <form className="login_form mt-3" onSubmit={submitOtp}>
          {loginResponse?.mobileNumber && (
            <div className="d-flex mb-5 mt-1 gap-2 justify-content-center">
              <p className="mb-0">
                <strong>Mobile Number:</strong> {mobileNumber}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* <input
                  type="text"
                  value={loginResponse.mobileNumber}
                  disabled
                  className="form-control"
                  style={{ backgroundColor: '#f5f5f5' }}
                /> */}

                {loginResponse.canEditMobile && loginSuccess && (
                  <FontAwesomeIcon
                    icon={faPencil}
                    style={{
                      cursor: 'pointer',
                      color: '#007BFF',
                      fontSize: '13px'
                    }}
                    // size="sm"
                    title="Edit mobile number"
                    onClick={() => setShowEditMobileModal(true)}
                  />
                )}
              </div>
            </div>
          )}

          {loginSuccess && (
            <>
              <label htmlFor="digit">Enter your OTP</label>

              <div className="otp-input-container">
                {otp.map((digit, index) => (
                  <input
                    id="digit"
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    className="otp-box"
                  />
                ))}
              </div>
              {/* <p className="forgot-link mb-4 mt-2" onClick={resendOtp}>Resend OTP</p>  */}
              <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                <small className="text-muted">
                  Didn't receive the OTP?
                </small>

                <button
                  type="button"
                  className="resend-btn"
                  onClick={resendOtp}
                  
                >
                 Resend OTP
                </button>
              </div>
              <button className="login-button mt-4" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}
        </form>
      </div>

      <EditMobileModal
        show={showEditMobileModal}
        onHide={() => setShowEditMobileModal(false)}
        currentMobileNumber={mobileNumber}
        credentials={credentials}
        onSuccess={handleMobileNumberUpdate}
      />
    </div>
  );
};

export default OtpVerification;

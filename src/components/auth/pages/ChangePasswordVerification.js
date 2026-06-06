import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../../../css/OtpVerification.css';
// import { setUser } from '../../store/userSlice';
import { toast } from "react-toastify";
import authApi from "../services/auth.api";

const ChangePasswordVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email; // ← Get email sent from Login page

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
  };

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
      await authApi.verifyPasswordOtp(email, otpValue);
      // dispatch(setUser(res.data));
      navigate("/change-password", {
        state: {
          email: email,  // send email for OTP validation
          otp: otpValue
        }
      }); // SUCCESS
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || err.response?.data?.error_description || "OTP verification failed. Please try again.");
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
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

          {/* <p className="forgot-link mb-4" onClick={resendOtp}>Resend OTP</p> */}
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
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordVerification;

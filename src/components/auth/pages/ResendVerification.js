// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../../css/Login.css";
import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormErrors(prev => ({ ...prev, email: "" }));
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,10}$/.test(email)) {
      errors.email = "Enter valid email";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await authApi.resendVerification(email);
      toast.success("Verification email sent. Please check your inbox.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification email.");
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

        <form className="login_form" onSubmit={handleResendVerification} noValidate>
          <label htmlFor="email">Email Id <span className="text-danger">*</span></label>
          <input
          id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`form-control text-muted ${formErrors.email ? 'is-invalid' : 'mb-4'}`}
            placeholder="Enter email"
          />
          {formErrors.email && <div className="invalid-feedback mb-4">{formErrors.email}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Resending verification email..." : "Resend Verification Email"}
          </button>

          <p className="register-link">
            ← Back to <Link to="/login" replace>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResendVerification;

import React, { useState } from "react";
import "../../../css/Login.css";
import pana from "../../../assets/pana.png";
import boblogo from "../../../assets/bob-logo1.jpg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await authApi.forgotPassword(email);

      toast.success("OTP sent to your mobile number.");
      navigate("/change-password-verification", {
        state: {
          email: email  // send email for OTP validation
        },
        replace: true
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={pana} alt="Illustration" />
        <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3>
      </div>

      <div className="right-panel">
        <div className="logo" style={{ marginBottom: '20px' }}>
          <img src={boblogo} alt="Logo" />
          <h4>Forgot your Password?</h4>
        </div>

        <form className="login_form mt-3" onSubmit={handleSubmit}>
          {/* <button
            className="back-button"
            onClick={() => navigate("/login")}
          >
            ← Login
          </button> */}

          <label htmlFor="email">Email Id:</label>
          <input
            id="email"
            type="email"
            value={email}
            required
            // placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
          />

          <button className="login-button mt-4" type="submit">
            Send OTP to Mobile
          </button>

          <p className="register-link mb-0">
            ← Back to <Link to="/login" replace>Login</Link>
          </p>
        </form>
        {/* {message && <p>{message}</p>} */}
      </div>
    </div>
  );
};

export default ForgotPassword;
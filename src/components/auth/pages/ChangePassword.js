// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../css/Login.css";
import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
// import { setUser, setAuthUser } from '../../store/userSlice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";
import { isStrongPassword } from "../../../shared/utils/validation";

const ChangePassword = () => {
  const [publicKey, setPublicKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [formErrors, setFormErrors] = useState({});

  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    fetch("/public_key.pem")
      .then(res => res.text())
      .then(key => setPublicKey(key))
      .catch(err => console.error("Failed to load public key:", err));
  }, []);

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(); // hex string
  };

  // const encryptCredentials = (email, password, publicKey) => {
  //   const encrypt = new JSEncrypt();
  //   encrypt.setPublicKey(publicKey);

  //   const data = `${email}|${password}`;
  //   const encrypted = encrypt.encrypt(data);

  //   return encrypted; // base64 encrypted string
  // };

  const encryptWithOAEP = async (data, publicKeyPem) => {
    const encoder = new TextEncoder();
    // Convert PEM → binary
    const pem = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\s/g, "");
    const binaryDer = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
    const key = await window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      false,
      ["encrypt"]
    );
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      key,
      encoder.encode(data)
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!password) errors.password = "Password is required";
    if (!confirmPassword) errors.confirmPassword = "Confirm Password is required";

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (password && !isStrongPassword(password)) {
      errors.password = "Password must be at least 14 characters and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!publicKey) {
      toast.error("Public key not loaded yet!");
      return;
    }

    setLoading(true);
    const hashedPassword = hashPassword(password);
    //  const encryptedCredentials = encryptCredentials(email, hashedPassword, publicKey);

    const encryptedCredentials = await encryptWithOAEP(
      `${email}|${hashedPassword}`,
      publicKey
    );

    try {
      // Step 1: Login API
      await authApi.resetPassword(encryptedCredentials, otp);
      toast.success("Password changed successfully. Please login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
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

        <form className="login_form" onSubmit={handleLogin}>
          {/* PASSWORD */}
          <label htmlFor="password">New Password:</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              // required
              onChange={(e) => {
                setPassword(e.target.value);
                setFormErrors(prev => ({ ...prev, password: "" }));
              }}
              style={{ paddingRight: "40px", marginBottom: "0.25rem" }}
              className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: formErrors.password ? "30px" : "15px",
                top: "49%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            />
          </div>
          {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password || "This field is required"}</div>}

          {/* CONFIRM PASSWORD */}
          <label htmlFor="confirmPassword" className="mt-3">Confirm Password:</label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              // required
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFormErrors(prev => ({ ...prev, confirmPassword: "" }));
              }}
              style={{ paddingRight: "40px" }}
              className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
            />
            <FontAwesomeIcon
              icon={showConfirm ? faEye : faEyeSlash}
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: formErrors.confirmPassword ? "30px" : "15px",
                top: "49%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666"
              }}
            />
          </div>
          {formErrors.confirmPassword && <div className="invalid-feedback d-block">{formErrors.confirmPassword || "This field is required"}</div>}

          {/* <p className="forgot-link mb-4">
            <Link className="" to="/forgot-password">Forgot Password?</Link>
          </p> */}

          <button className="login-button mt-4" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

          {/* <p className="register-link">
            New User? <Link to="/register">Register Here</Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

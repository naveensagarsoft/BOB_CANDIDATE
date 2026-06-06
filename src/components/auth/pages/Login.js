// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import "../../../css/Login.css";
import pana from "../../../assets/pana.png";
import BobLogo from "../../../assets/bob-logo1.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
// import JSEncrypt from "jsencrypt";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";
import { setCredentials } from "../store/userSlice";
import { Button, Modal } from "react-bootstrap";
const Login = () => {
  const [publicKey, setPublicKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    fetch("/public_key.pem")
      .then(res => res.text())
      .then(key => setPublicKey(key))
      .catch(err => console.error("Failed to load public key:", err));
  }, []);
  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(); // hex string
  }
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormErrors(prev => ({ ...prev, email: "" }));
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormErrors(prev => ({ ...prev, password: "" }));
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
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,10}$/.test(email)) {
      errors.email = "Enter valid email";
    }
    if (!password.trim()) errors.password = "Password is required";
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
    // const encryptedCredentials = encryptCredentials(email, hashedPassword, publicKey);
    const encryptedCredentials = await encryptWithOAEP(
      `${email}|${hashedPassword}`,
      publicKey
    );
    try {
      // Step 1: Login API
      const response = await authApi.login(encryptedCredentials);
      // console.log("Login response:", response);
      if (response.data?.data?.passwordExpired) {
        setShowExpiredModal(true);
      }
      // Check if login was successful
      if (!response.data?.data?.loginSuccess) {
        const errorMessage = response.data?.data?.responseMessage || "Login failed. Please try again.";
        toast.error(errorMessage);
        return;
      }
      // Store credentials in Redux for later use
      dispatch(setCredentials(encryptedCredentials));
      toast.success("An OTP has been sent to your registered mobile number.");
      navigate("/otp-verification", {
        state: {
          email: email,
          loginResponse: response.data?.data,  // Pass the login response data
          from: location.state?.from
        },
        replace: true
      });
    } catch (err) {
      const status = err.response?.status;
      //  else {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
      // }
    } finally {
      setLoading(false);
    }
  };
  const handleRedirectToChangePassword = async () => {
    setShowExpiredModal(false);
    setLoading(true);
    try {
      // Call forgot-password API to send OTP to email
      await authApi.forgotPassword(email);
      toast.success("OTP has been sent to your registered email.");
      navigate("/change-password-verification", {
        state: { email }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
      setShowExpiredModal(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="login-container">
        <div className="left-panel">
          <img src={pana} alt="Illustration" />
        </div>
        <div className="right-panel">
          <div className="logo">
            <img src={BobLogo} alt="Logo" />
            <h5 className="mt-1">Welcome to Candidate Login</h5>
          </div>
          <form className="login_form" onSubmit={handleLogin} noValidate>
            <label>Email Id <span className="text-danger">*</span></label>
            <input 
            id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`form-control text-muted ${formErrors.email ? 'is-invalid' : 'mb-4'}`}
              placeholder="Enter email"
            />
            {formErrors.email && <div className="invalid-feedback mb-4">{formErrors.email}</div>}
            <label htmlFor="password">Password <span className="text-danger">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                 type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`form-control text-muted ${formErrors.password ? 'is-invalid' : ''}`}
                placeholder="Enter password"
                style={{ paddingRight: '40px', marginBottom: '0.25rem' }}
              />
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: formErrors.password ? '30px' : '15px',
                  top: '49%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#666',
                }}
                size="sm"
                title={showPassword ? 'Hide password' : 'Show password'}
              // autoComplete="new-password"
              // data-ms-editor="false"
              />
            </div>
            {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
            <p className="forgot-link mb-4">
              <Link className="" to="/forgot-password" replace>Forgot Password?</Link>
            </p>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="register-link">
              New User? <Link to="/register" replace>Register Here</Link>
            </p>
            {/* <p className="register-link mb-0 mt-2">
              Registered but not verified? <Link to="/resend-verification" replace>Resend Verification</Link>
</p> */}
          </form>
        </div>
      </div>
      <Modal
        show={showExpiredModal}
        onHide={() => setShowExpiredModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header className="border-bottom pb-2 pt-2" closeButton>
          <Modal.Title className="cerhead" style={{ fontSize: '16px' }}>Password Expired</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your password has expired. Please click on change password, enter your OTP and change your password to continue.
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button
            variant="secondary"
            style={{ fontSize: '14px' }}
            onClick={() => setShowExpiredModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: '#ff6a00', color: 'white', border: 'none', fontSize: '14px' }}
            onClick={handleRedirectToChangePassword}
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Change Password"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default Login;
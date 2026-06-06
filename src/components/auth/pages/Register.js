// src/pages/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import panaImage from "../../../assets/pana.png";
import logoImage from "../../../assets/bob-logo1.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import { toast } from "react-toastify";
import authApi from "../services/auth.api";
// import TurnstileWidget from "../../integrations/Cpatcha/TurnstileWidget";
import { isStrongPassword } from "../../../shared/utils/validation";
import { useRef } from "react";

const Register = () => {
  const [publicKey, setPublicKey] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  //  const [turnstileKey, setTurnstileKey] = useState(0);

  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const captchaTimerRef = useRef(null);

  useEffect(() => {
    fetch("/public_key.pem")
      .then(res => res.text())
      .then(key => setPublicKey(key))
      .catch(err => console.error("Failed to load public key:", err));
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha();

      if (!res.data?.success) {
        throw new Error("Captcha API failed");
      }

      setCaptchaId(res.data.data.captchaId);
      setCaptchaImage(res.data.data.image);
      setCaptchaText(""); // clear input on refresh

      // 🔥 RESET TIMER every time captcha loads
      if (captchaTimerRef.current) {
        clearTimeout(captchaTimerRef.current);
      }

      captchaTimerRef.current = setTimeout(() => {
        fetchCaptcha(); // auto refresh after 2 mins
      }, 120000); // 120000 ms = 2 minutes

    } catch (err) {
      console.error("Captcha fetch failed", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    return () => {
      if (captchaTimerRef.current) {
        clearTimeout(captchaTimerRef.current);
      }
    };
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleDobChange = (e) => {
    const value = e.target.value;

    // Allow clearing
    if (!value) {
      setForm({ ...form, dob: "" });
      setFormErrors(prev => ({ ...prev, dob: "" }));
      return;
    }

    // value is ALWAYS yyyy-mm-dd for type="date"
    const [year] = value.split("-");

    // HARD BLOCK: more than 4 digits in year
    if (year.length > 4) {
      return;
    }

    setForm({ ...form, dob: value });
    setFormErrors(prev => ({ ...prev, dob: "" }));
  };

  const validateForm = (form, captchaText) => {
    const { name, email, phone, password, confirmPassword, dob } = form;
    const errors = {};

    if (!name.trim()) errors.name = "Full Name is required";
    if (!dob) errors.dob = "Date of Birth is required";

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,10}$/.test(email)) {
      errors.email = "Enter valid email";
    }

    if (!phone.trim()) {
      errors.phone = "Mobile Number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Mobile Number must be exactly 10 digits";
    }

    if (!password) errors.password = "Password is required";
    if (!confirmPassword) errors.confirmPassword = "Confirm Password is required";

    if (dob) {
      const selectedDate = new Date(dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        errors.dob = "Date of Birth cannot be in the future";
      }
    }

    if (password && !isStrongPassword(password)) {
      errors.password = "Password must be at least 14 characters and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!captchaText.trim()) {
      errors.captcha = "Captcha is required";
    }

    return errors;
  };

  const handleRegisterError = (err) => {
    console.error(err);

    if (err.response) {
      if (err.response.status === 400) {
        toast.error(err.response.data.message);
      } else {
        const msg = err.response.data?.message || "Registration/Login failed";
        toast.error(msg);
      }
    }
    // setTurnstileKey(prev => prev + 1);
    // setToken("");
    setCaptchaText("");
    fetchCaptcha();
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const errors = validateForm(form, captchaText);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!publicKey) {
      alert("Public key not loaded yet!");
      return;
    }

    const { name, email, phone, password, dob } = form;

    const hashedPassword = hashPassword(password);
    // const encryptedCredentials = encryptCredentials(email, hashedPassword, publicKey);

    const encryptedCredentials = await encryptWithOAEP(
      `${email}|${hashedPassword}`,
      publicKey
    );

    try {
      await authApi.registerCandidate({
        fullName: name,
        mobileNumber: Number(phone),
        dateOfBirth: dob,
        credentials: encryptedCredentials,
        // "cf-turnstile-response": token
        captcha: {
          captchaId: captchaId,
          captchaValue: captchaText
        }
      });

      setShowVerificationModal(true);
    } catch (err) {
      handleRegisterError(err);
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={panaImage} alt="Illustration" />
        {/* <h2>बैंक ऑफ़ बड़ौदा</h2>
        <h3>Bank of Baroda</h3> */}
      </div>

      <div className="right-panel">
        <div className="logo" style={{ marginBottom: '15px' }}>
          <img src={logoImage} alt="Logo" />
          <h4 className="mt-1">Welcome to Candidate Registration</h4>
        </div>

        <form onSubmit={handleRegister} className="login_form" noValidate>
          <label htmlFor="name">Full Name as per Aadhar <span className="text-danger">*</span></label>
          <input
            id="name"
            name="name"
            onChange={handleChange}
            className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
          />
          {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}

          <label htmlFor="date" className="mt-3">Date of Birth <span className="text-danger">*</span></label>
          <input
            id="date"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleDobChange}
            className={`form-control ${formErrors.dob ? 'is-invalid' : ''}`}
          />
          {formErrors.dob && <div className="invalid-feedback">{formErrors.dob}</div>}

          <label htmlFor="phone" className="mt-3">Mobile Number <span className="text-danger">*</span></label>
          <input
            id="phone"
            type="text"
            name="phone"
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setForm({ ...form, phone: value });
              setFormErrors(prev => ({ ...prev, phone: "" }));
            }}
            onKeyDown={(e) => {
              // Allow control keys
              if (
                ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
              ) {
                return;
              }
              // Block non-numeric keys
              if (!/^\d$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
          />
          {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}

          <label htmlFor="email" className="mt-3">Email <span className="text-danger">*</span></label>
          <input
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
          />
          {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}

          <label htmlFor="password" className="mt-3">Password <span className="text-danger">*</span></label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: formErrors.password ? "30px" : "10px",
                top: "49%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              size="sm"
              title={showPassword ? "Hide password" : "Show password"}
            />
          </div>
          {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}


          <label htmlFor="confirmPassword" className="mt-3">Confirm Password <span className="text-danger">*</span></label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              onChange={handleChange}
              className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
            />
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEye : faEyeSlash}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: formErrors.password ? "30px" : "10px",
                top: "49%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              size="sm"
              title={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            />
          </div>
          {formErrors.confirmPassword && <div className="invalid-feedback d-block">{formErrors.confirmPassword}</div>}

          <div className="mt-3">
            <label>Captcha <span className="text-danger">*</span></label>


            <div className="mt-2 mb-2" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={`data:image/jpeg;base64,${captchaImage}`}
                alt="captcha"
                style={{ height: "50px", width: "500px", border: "1px solid #ccc" }}
              />

              <button
                type="button"
                onClick={fetchCaptcha}
                className="btn btn-sm"
                title="Refresh Captcha"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px"
                }}
              >
                <FontAwesomeIcon icon={faRotateRight} />
              </button>


            </div>
            <input
              type="text"
              value={captchaText}
              onChange={(e) => {
                setCaptchaText(e.target.value);
                setFormErrors(prev => ({ ...prev, captcha: "" }));
              }}
              className={`form-control mt-2 ${formErrors.captcha ? 'is-invalid' : ''}`}
              placeholder="Enter captcha"
            />
            {formErrors.captcha && (
              <div className="invalid-feedback d-block">
                {formErrors.captcha}
              </div>
            )}


          </div>
          {/* <TurnstileWidget key={turnstileKey} onTokenChange={setToken} /> */}
          <button type="submit" className="login-button mt-4 mb-2">Register</button>

          <p className="register-link mb-0">
            Already registered? <Link to="/login" replace>Login</Link>
          </p>
        </form>
      </div>

      {showVerificationModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>We've sent a verification link to your Email.<br />
              Please check your inbox and verify to continue.</p>

            <button
              onClick={() => {
                setShowVerificationModal(false);
                navigate("/login", { replace: true });   // redirect ONLY after closing modal
              }}
              className="ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
import axios from "axios";


const BASE_URL = process.env.REACT_APP_AUTH_BASE_URL;
// Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ---------- API FUNCTIONS ----------

// Login API
export const login = (credentials) => {
  return api.post("/candidate-auth/login", { credentials });
};

// Resend Verification Email
export const resendVerification = (email) => {
  return api.post(
    "/candidate-auth/resend-verification",
    null,
    {
      params: { email },
    }
  );
};

export const registerCandidate = (data) => {
  return api.post("/candidate-auth/register", data);
};

export const verifyOtp = (email, otp) => {
  return api.post(
    "/candidate-auth/verify-otp",
    { email, otp },
    { withCredentials: true }
  );
};

// Resend OTP
export const resendOtp = (email) => {
  return api.post(
    "/candidate-auth/resend-otp",
    email,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "text/plain",
        "X-Client": "candidate"
      }
    }
  );
};
// Forgot Password (send reset link)
export const forgotPassword = (email) => {
  return api.get("/candidate-auth/forgot-password", {
    params: { email },
  });
};

// Reset Password
export const resetPassword = (credentials, otp) => {
  return api.post("/candidate-auth/reset-password", {
    credentials,
    otp,
  });
};

// Verify OTP for Password Reset
export const verifyPasswordOtp = (email, otp) => {
  return api.get("/candidate-auth/password-otp-verify", {
    params: { email, otp },
    withCredentials: true,
  });
};

// Edit Mobile Number
export const editMobileNumber = (newMobileNo, credentials) => {
  return api.post(
    `/candidate-auth/edit-mobile-no/${newMobileNo}`,
    { credentials },
    {
      withCredentials: true
    }
  );
};

// Logout
export const logout = () => {
  return api.post(
    "/candidate-auth/logout",
    {},
    {
      withCredentials: true
    }
  );
};

export const getCaptcha = () => {
  return api.get("/captcha/generate");
};

export const verifyCaptcha = (captchaId, captchaValue) => {
  return api.post("/captcha/verify", {
    captchaId,
    captchaValue
  });
};


const authApi = {
  login,
  resendVerification,
  registerCandidate,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  verifyPasswordOtp,
  editMobileNumber,
  logout,
  getCaptcha,
  verifyCaptcha
};
export default authApi;
import CandidatePortal from './layouts/CandidatePortal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from '../components/auth/pages/Login';
import Register from '../components/auth/pages/Register';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ForgotPassword from '../components/auth/pages/ForgotPassword';
import '@fontsource/poppins';
import '@fontsource/poppins/600.css';
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import PrivateRoute from '../components/auth/pages/PrivateRoute';
import { useState } from 'react';
import CustomChatbot from '../components/integrations/chatbot/CustomChatbot';
import OtpVerification from '../components/auth/pages/OtpVerification';
import ChangePasswordVerification from '../components/auth/pages/ChangePasswordVerification';
import ChangePassword from '../components/auth/pages/ChangePassword';
import Oppurtunities from '../components/jobs/pages/Oppurtunities';
import ResendVerification from '../components/auth/pages/ResendVerification';
import PaymentSuccess from '../components/jobs/components/PaymentSuccess';
import PaymentFailed from '../components/jobs/components/PaymentFailed';
import SessionManager from './SessionManager';

function App() {
  const location = useLocation();

  const showChat = ![ '/careers-portal','/forgot-password','/register','/login','/','/otp-verification','/change-password-verification','/change-password'].includes(location.pathname);

  const [chatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <div className="App">

      <Routes>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/candidate-portal" replace />} />

        {/* Public routes */}
        <Route path='/current-oppurtunities' element={<Oppurtunities />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/change-password-verification" element={<ChangePasswordVerification />} />
        <Route path='/change-password' element={<ChangePassword />} />
        {/* <Route path='/resend-verification' element={<ResendVerification />} /> */}

        {/* 🔥 Protected routes */}
        <Route element={<PrivateRoute />}>
          
          {/* 🔥 SessionManager layer */}
          <Route element={<SessionManager />}>
            <Route path="/candidate-portal" element={<CandidatePortal />} />
            <Route path="/candidate-portal/:requisitionId" element={<CandidatePortal />} />
            <Route path="/candidate-portal/:requisitionId/:positionId" element={<CandidatePortal />} />
            <Route path="/candidate-portal/payment-success" element={<PaymentSuccess />} />
            <Route path="/candidate-portal/payment-failed" element={<PaymentFailed />} />
            <Route path="/digilocker-upload-callback" element={<CandidatePortal />} />
          </Route>

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />

      {showChat && (
        <CustomChatbot isOpen={chatOpen} onToggle={toggleChat} />
      )}

    </div>
  );
}

export default App;
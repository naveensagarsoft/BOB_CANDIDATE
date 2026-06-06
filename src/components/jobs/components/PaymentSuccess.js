import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../app/layouts/Header";
import "../../../css/PaymentSuccess.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/candidate-portal", { state: { activeTab: "applied-jobs" } });
    }, 5000);

    return () => {
      clearInterval(countdown);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <>
      <Header />

      {/* Blocking Overlay */}
      <div className="payment-success-overlay">
        <div className="payment-success-content">
          <h2 style={{ color: "#28a745" }}>✅ Payment Successful</h2>

          <p>
            Redirecting to <b>Applied Jobs</b> in{" "}
            <strong>{seconds}</strong> seconds...
          </p>
        </div>
      </div>
    </>
  );
}

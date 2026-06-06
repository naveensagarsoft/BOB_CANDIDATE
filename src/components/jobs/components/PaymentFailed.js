import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../app/layouts/Header";
import "../../../css/PaymentSuccess.css";

export default function PaymentFailed() {
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

          <h2 style={{ color: "#dc3545" }}>❌ Payment Failed</h2>

          <p>Your payment could not be completed.</p>

          <p>
            Redirecting to <b>Applied Jobs</b> in{" "}
            <strong>{seconds}</strong> seconds...
          </p>

        </div>
      </div>
    </>
  );
}

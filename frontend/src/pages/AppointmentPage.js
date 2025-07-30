// AppointmentPage.js
import React from "react";
import AppointmentForm from "../components/AppointmentForm";
import { useNavigate, useLocation } from "react-router-dom";
import KiranuHeader from "../App";

export default function AppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const patientId = location.state?.patientId;

  React.useEffect(() => {
    if (!patientId) {
      navigate("/", { replace: true });
    }
  }, [patientId, navigate]);

  if (!patientId) return null;

  return (
    <div>
      <KiranuHeader />
      <h2>Book Appointment</h2>
      <AppointmentForm patientId={patientId} />
    </div>
  );
}

// DoctorPage.js
import React from "react";
import DoctorForm from "../components/DoctorForm";
import KiranuHeader from "../App";

export default function DoctorPage() {
  return (
    <div>
      <KiranuHeader />
      <h2>Register Doctor</h2>
      <DoctorForm />
    </div>
  );
}

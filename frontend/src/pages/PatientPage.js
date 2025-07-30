// PatientPage.js
import React from "react";
import PatientForm from "../components/PatientForm";
import KiranuHeader from "../App";

export default function PatientPage() {
  return (
    <div>
      <KiranuHeader />
      <h2>Register Patient</h2>
      <PatientForm />
    </div>
  );
}

import React, { useState } from "react";
import { registerPatient } from "../api";
import '../App.css';


export default function PatientForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "M",
    contact_info: "",
    medical_history: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerPatient(form);
    alert("Patient registered");
  };

  return (
    <>
    
      <form onSubmit={handleSubmit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
        <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" required />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="Other">Other</option>
        </select>
        <input value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="Contact Info" required />
        <textarea value={form.medical_history} onChange={(e) => setForm({ ...form, medical_history: e.target.value })} placeholder="Medical History" />
        <button type="submit">Register Patient</button>
      </form>
    </>
  );
}

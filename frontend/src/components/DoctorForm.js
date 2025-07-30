import React, { useState } from "react";
import { registerDoctor } from "../api";
import '../App.css';
import { useNavigate } from "react-router-dom";

export default function DoctorForm() {
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    qualifications: "",
    availability_schedule: [],
  });
  const [tempDateTime, setTempDateTime] = useState("");

  const addSlot = () => {
    if (tempDateTime) {
      setForm({ ...form, availability_schedule: [...form.availability_schedule, tempDateTime] });
      setTempDateTime("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerDoctor(form);
    alert("Doctor registered");
  };

  return (
    <>
    
      <form onSubmit={handleSubmit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
        <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization" required />
        <input value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="Qualifications" required />
        <input type="datetime-local" value={tempDateTime} onChange={(e) => setTempDateTime(e.target.value)} />
        <button type="button" onClick={addSlot}>Add Timeslot</button>
        <ul>
          {form.availability_schedule.map((slot, idx) => (
            <li key={idx}>{new Date(slot).toLocaleString()}</li>
          ))}
        </ul>
        <button type="submit">Register Doctor</button>
      </form>
    </>
  );
}

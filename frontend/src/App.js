import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PatientForm from "./components/PatientForm";
import DoctorForm from "./components/DoctorForm";
import AppointmentForm from "./components/AppointmentForm";
import Login from "./components/Login"; 
import Home from "./components/Home"; 
import Main from "./components/Main";
import Profile from "./components/Profile";
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patients" element={<PatientForm />} />
        <Route path="/doctors" element={<DoctorForm />} />
        <Route path="/appointments" element={<AppointmentForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

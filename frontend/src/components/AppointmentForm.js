import React, { useState, useEffect } from "react";
import { bookAppointment, getDoctorAvailability, listDoctors } from "../api";
import '../App.css';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

export default function AppointmentForm({ patientId: initialPatientId }) {
  const [doctorId, setDoctorId] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState(initialPatientId || "");
  const [activeTab, setActiveTab] = useState("appointment");
  const [message, setMessage] = useState("")
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDoctors() {
      const res = await listDoctors();
      const data = await res.json();
      setDoctors(data.doctors);
    }
    fetchDoctors();
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      if (doctorId) {
        const res = await getDoctorAvailability(doctorId);
        const data = await res.json();
        setAvailableSlots(data.availability);
      } else {
        setAvailableSlots([]);
      }
    }
    fetchAvailability();
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setMessage("Select a timeslot");
      return;
    }
    try {
      await bookAppointment({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_datetime: selectedSlot,
      });
      setMessage("Appointment booked");
      setDoctorId("");
      setAvailableSlots([]);
      setSelectedSlot("");
    } catch (err) {
      setMessage("Failed to book appointment");
    }
  };
  const handleProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  const handleSignOut = () => {
    Cookies.remove('user');
    Cookies.remove('appointments');
    window.location.href = '/';
  };


  return (
    <div>
      {/* Collapsible Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: menuOpen ? 220 : 56,
          background: "#27ae60",
          color: "#fff",
          zIndex: 2001,
          transition: "width 0.2s",
          boxShadow: menuOpen ? "2px 0 8px rgba(0,0,0,0.08)" : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: menuOpen ? "flex-start" : "center",
          paddingTop: 0
        }}
      >
        {/* Sidebar Toggle Button */}
        <button
          style={{
            background: "#27ae60",
            color: "#fff",
            border: "none",
            fontSize: 28,
            padding: "18px 0 18px 0",
            width: "100%",
            cursor: "pointer",
            outline: "none",
            textAlign: menuOpen ? "right" : "center"
          }}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? "←" : "☰"}
        </button>
        {/* Sidebar Content */}
        {menuOpen && (
          <div style={{ width: "100%", marginTop: 30 }}>
            <button
              style={{
                background: "#27ae60",
                color: "#fff",
                border: "none",
                borderRadius: 0,
                padding: "18px 32px",
                fontWeight: "bold",
                fontSize: 18,
                textAlign: "left",
                width: "100%",
                cursor: "pointer"
              }}
              onClick={handleProfile}
            >
              Profile
            </button>
            <button
              style={{
                background: "#27ae60",
                color: "#fff",
                border: "none",
                borderRadius: 0,
                padding: "18px 32px",
                fontWeight: "bold",
                fontSize: 18,
                textAlign: "left",
                width: "100%",
                cursor: "pointer"
              }}
              onClick={handleSignOut}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
       {/* Navbar */}
      <div style={{
        width: '100%',
        height: 80,
        background: '#fff',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: menuOpen ? 220 : 56,
        zIndex: 1000,
        padding: '0 48px',
        transition: "left 0.2s"
      }}>
        {/* Logo */}
        <img
          src={require('../assets/kiranu-logo.png')}
          alt="Kiranu Logo"
          style={{
            width: 180,
            height: 60,
            cursor: 'pointer',
            marginRight: 32
          }}
          onClick={() => setActiveTab("home")}
        />
        {/* Navbar buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            style={{
              background: "transparent",
              color: activeTab === "home" ? "#27ae60" : "#333",
              border: "none",
              borderRadius: 6,
              padding: "14px 28px",
              fontWeight: "bold",
              fontSize: 20,
              cursor: "pointer",
              borderBottom: activeTab === "home" ? "3px solid #27ae60" : "3px solid transparent"
            }}
            onClick={() => navigate('/home')}
          >
            Home
          </button>
          <button
            style={{
              background: "transparent",
              color: activeTab === "about" ? "#27ae60" : "#333",
              border: "none",
              borderRadius: 6,
              padding: "14px 28px",
              fontWeight: "bold",
              fontSize: 20,
              cursor: "pointer",
              borderBottom: activeTab === "about" ? "3px solid #27ae60" : "3px solid transparent"
            }}
            onClick={() => navigate('/')}
          >
            About Us
          </button>
          <button
            style={{
              background: "transparent",
              color: activeTab === "speciality" ? "#27ae60" : "#333",
              border: "none",
              borderRadius: 6,
              padding: "14px 28px",
              fontWeight: "bold",
              fontSize: 20,
              cursor: "pointer",
              borderBottom: activeTab === "speciality" ? "3px solid #27ae60" : "3px solid transparent"
            }}
            onClick={() => navigate('/')}
          >
            Speciality
          </button>
          <button
            style={{
              background: "transparent",
              color: activeTab === "feedback" ? "#27ae60" : "#333",
              border: "none",
              borderRadius: 6,
              padding: "14px 28px",
              fontWeight: "bold",
              fontSize: 20,
              cursor: "pointer",
              borderBottom: activeTab === "feedback" ? "3px solid #27ae60" : "3px solid transparent"
            }}
            onClick={() => navigate('/')}
          >
            Feedback
          </button>
        </div>
      </div>
      {/* Main content below navbar */}
      <div style={{
        minHeight: '100vh',
        background: '#fff',
        paddingTop: 100,
        marginLeft: menuOpen ? 220 : 56,
        transition: "margin-left 0.2s"
      }}>
        {/* Message Box */}
        {message && (
          <div
            style={{
              maxWidth: 500,
              margin: "24px auto 0 auto",
              background: "#eafaf1",
              color: "#27ae60",
              border: "1px solid #27ae60",
              borderRadius: 8,
              padding: "16px 24px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 18,
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
            }}
          >
            {message}
          </div>
        )}
        <div style={{ paddingTop: 70 }}>
          {/* ...existing code... */}
          <form onSubmit={handleSubmit} className="appointment-form">
          <label>Patient ID:</label>
          <input
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            placeholder="Patient ID"
            required
          />
          <label>Doctor:</label>
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)} required>
            <option value="">--Select Doctor--</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialization})
              </option>
            ))}
          </select>
          {availableSlots.length > 0 && (
            <>
              <label>Select Timeslot:</label>
              <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
                <option value="">--Select--</option>
                {availableSlots.map((slot, idx) => (
                  <option key={idx} value={slot}>
                    {new Date(slot).toLocaleString()}
                  </option>
                ))}
              </select>
            </>
          )}
         <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20, textAlign: 'center' }}>
           <button style = {{width : 200}} type="submit">Book Appointment</button>
           </div>
        </form>
        </div>
        {/* Contact Us section */}
        <div style={{
          width: '100%',
          background: '#f8f8f8',
          padding: '24px 0',
          textAlign: 'center',
          position: 'relative',
          left: 0,
          bottom: 0,
          zIndex: 999
        }}>
          <h4>Contact Us</h4>
          <div>Email: <a href="mailto:support@kiranu.com">support@kiranu.com</a></div>
          <div>Phone: <a href="tel:+911234567890">+91 12345 67890</a></div>
        </div>
      </div>
    </div>
  );
}


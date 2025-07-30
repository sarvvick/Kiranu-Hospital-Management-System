// Home.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import '../App.css';

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect effect
  useEffect(() => {
    // If no user in location.state, try cookies, else redirect to login
    let userCookie = Cookies.get('user');
    let appointmentsCookie = Cookies.get('appointments');
    if ((!location.state || !location.state.user) && userCookie && appointmentsCookie) {
      const userObj = JSON.parse(userCookie);
      const appointmentsObj = JSON.parse(appointmentsCookie);
      setUser(userObj);
      setAppointments(appointmentsObj);
    } else if (!location.state || !location.state.user) {
      navigate('/login', { replace: true });
    }
  }, [location.state, navigate]);

  // Fetch user and appointments from backend
  useEffect(() => {
    async function fetchUserAndAppointments() {
      let userObj = null;
      if (location.state && location.state.user) {
        userObj = location.state.user;
      } else {
        // Try cookies
        const userCookie = Cookies.get('user');
        if (userCookie) userObj = JSON.parse(userCookie);
      }
      if (!userObj) return;
      setUser(userObj);

      // Fetch latest user info
      let userInfo = null;
      if (userObj.role === "patient") {
        const res = await fetch(`http://localhost:5000/patients/${userObj.id}`);
        userInfo = await res.json();
      } else {
        const res = await fetch(`http://localhost:5000/doctors/${userObj.id}`);
        userInfo = await res.json();
      }
      setUser(prev => ({ ...prev, ...userInfo }));

      // Fetch appointments
      let appointmentsRes;
      if (userObj.role === "patient") {
        appointmentsRes = await fetch(`http://localhost:5000/appointments/patient/${userObj.id}`);
      } else {
        appointmentsRes = await fetch(`http://localhost:5000/appointments/doctor/${userObj.id}`);
      }
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData.appointments || []);

      // Fetch doctor availability if doctor
      if (userObj.role === "doctor") {
        const availRes = await fetch(`http://localhost:5000/doctors/${userObj.id}/availability`);
        const availData = await availRes.json();
        setSchedule(Array.isArray(availData.availability) ? availData.availability : []);
      }
    }
    fetchUserAndAppointments();
  }, [location.state]);

  // Poll appointments and available timings every minute
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      // Fetch appointments
      let appointmentsRes;
      if (user.role === "patient") {
        appointmentsRes = await fetch(`http://localhost:5000/appointments/patient/${user.id}`);
      } else {
        appointmentsRes = await fetch(`http://localhost:5000/appointments/doctor/${user.id}`);
      }
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData.appointments || []);

      // Fetch available timings for doctor
      if (user.role === "doctor") {
        const availRes = await fetch(`http://localhost:5000/doctors/${user.id}/availability`);
        const availData = await availRes.json();
        setSchedule(Array.isArray(availData.availability) ? availData.availability : []);
      }
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [user]);

  const addSlot = async () => {
    if (!newSlot) {
      setMessage("Please select a time slot.");
      return;
    }
    try {
      await fetch(`http://localhost:5000/doctors/${user.id}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: newSlot })
      });
      // Fetch updated availability
      const availRes = await fetch(`http://localhost:5000/doctors/${user.id}/availability`);
      const availData = await availRes.json();
      setSchedule(Array.isArray(availData.availability) ? availData.availability : []);
      setNewSlot("");
      setMessage("Slot added successfully.");
    } catch (err) {
      setMessage("Failed to add slot.");
    }
  };

  if (!user) return <div>Loading...</div>;

  const upcomingAppointments = appointments
    .filter(a => a.app_status === "Upcoming")
    .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime));
  const pastAppointments = appointments
    .filter(a => a.app_status === "Past")
    .sort((a, b) => new Date(b.appointment_datetime) - new Date(a.appointment_datetime));

  const handleProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  const handleSignOut = () => {
    // Remove login state and cookies if any
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('appointments');
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "appointments=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (e) {}
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
          {/* Tab content rendering */}
          {activeTab === "home" && (
            <>
              <button
                style={{ position: 'fixed', width: 150, top: 20, right: 20, background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', zIndex: 1000 }}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
              <div style={{
          maxWidth: 1000,
          margin: '40px auto',
          background: '#f4f4f4',
          borderRadius: 8,
          padding: '32px 24px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
        }}>
              <h1 style={{ fontSize: '50px' }}>Welcome, {user.name || user.username}!</h1>
              <h3 style={{ fontSize: '35px' }}>Upcoming Appointments</h3>
              <ul>
                {upcomingAppointments.length === 0 && <li style={{ fontSize: '19px' }}>No upcoming appointments found.</li>}
                {upcomingAppointments.map((a, idx) => (
                  <li style={{ fontSize: '19px' }} key={idx}>
                    {user.role === "patient"
                      ? `Doctor ID: ${a.doctor_id}, Date: ${new Date(a.appointment_datetime).toLocaleString()}`
                      : `Patient ID: ${a.patient_id}, Date: ${new Date(a.appointment_datetime).toLocaleString()}`}
                  </li>
                ))}
              </ul>
              <h3 style={{ fontSize: '35px' }}>Past Appointments</h3>
              <ul>
                {pastAppointments.length === 0 && <li style={{ fontSize: '19px' }}>No past appointments found.</li>}
                {pastAppointments.map((a, idx) => (
                  <li style={{ fontSize: '19px' }} key={idx}>
                    {user.role === "patient"
                      ? `Doctor ID: ${a.doctor_id}, Date: ${new Date(a.appointment_datetime).toLocaleString()}`
                      : `Patient ID: ${a.patient_id}, Date: ${new Date(a.appointment_datetime).toLocaleString()}`}
                  </li>
                ))}
              </ul>
              {user.role === "patient" ? (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20, textAlign: 'center' }}>
                  <button
                    style={{ width: 200, background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 0', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => navigate("/appointments", { state: { patientId: user.id } })}
                  >
                    Book Appointment
                  </button>
                </div>
              ) : (
                <div>
                  <h4>Add to Availability Schedule</h4>
                  <div style ={{width: 300}}>
                  <input type="datetime-local" value={newSlot} onChange={e => setNewSlot(e.target.value)} />
                  </div>
                  <div style ={{width: 150}}>
                  <button onClick={addSlot}>Add Timeslot</button>
                  </div>
                  <h4>Available Timings</h4>
                  <ul>
                    {schedule.map((slot, idx) => (
                      <li key={idx}>{new Date(slot).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            </>
          )}
          {activeTab === "about" && (
            <div style={{ maxWidth: 700, margin: '40px auto', background: '#f4f4f4', borderRadius: 8, padding: '32px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h2>About Us</h2>
              <p>
                Welcome to Kiranu! We are dedicated to providing seamless healthcare appointment solutions.
              </p>
            </div>
          )}
          {activeTab === "speciality" && (
            <div style={{ maxWidth: 700, margin: '40px auto', background: '#f4f4f4', borderRadius: 8, padding: '32px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h2>Speciality</h2>
              <p>
                We offer appointments with specialists in cardiology, dermatology, pediatrics, and more.
              </p>
            </div>
          )}
          {activeTab === "feedback" && (
            <div style={{ maxWidth: 700, margin: '40px auto', background: '#f4f4f4', borderRadius: 8, padding: '32px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h2>Feedback</h2>
              <p>
                We value your feedback! Please let us know how we can improve your experience.
              </p>
            </div>
          )}
        </div>
        {/* Contact Us section */}
        <div style={{
          width: '100%',
          background: '#f8f8f8',
          padding: '24px 0',
          textAlign: 'center',
          position: 'fixed',
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


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { registerPatient, registerDoctor } from '../api';
import '../App.css';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const appointmentsCookie = Cookies.get('appointments');
    if (userCookie && appointmentsCookie) {
      const userObj = JSON.parse(userCookie);
      const appointmentsObj = JSON.parse(appointmentsCookie);
      navigate('/home', { state: { user: userObj, appointments: appointmentsObj } });
    }
  }, []);
  const [tab, setTab] = useState('login');
  // Login states
  const [loginRole, setLoginRole] = useState('patient');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  // Sign up states
  const [signupRole, setSignupRole] = useState('patient');
  const [signupData, setSignupData] = useState({
    password: '',
    // patient fields
    name: '', age: '', gender: 'M', contact_info: '', medical_history: '',
    // doctor fields
    specialization: '', qualifications: '', availability_schedule: [], tempSlot: ''
  });
  const [message, setMessage] = useState(""); // Add message state

  const [menuOpen, setMenuOpen] = useState(false);
  

  const handleProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  const handleSignOut = () => {
    Cookies.remove('user');
    Cookies.remove('appointments');
    window.location.href = '/';
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId, role: loginRole, password: loginPassword })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessage(""); // Clear any previous error
      // Set cookies for user and appointments
      Cookies.set('user', JSON.stringify({ ...data.info, role: loginRole }), { expires: 7 });
      Cookies.set('appointments', JSON.stringify(data.appointments), { expires: 7 });
      navigate('/home', { state: { user: { ...data.info, role: loginRole }, appointments: data.appointments } });
    } catch (err) {
      setMessage("Invalid credentials");
    }
  };

  // Sign up handler
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      let res, data;
      if (signupRole === 'patient') {
        res = await registerPatient({
          name: signupData.name,
          age: signupData.age,
          gender: signupData.gender,
          contact_info: signupData.contact_info,
          medical_history: signupData.medical_history,
          password: signupData.password
        });
        data = await res.json();
        setMessage(`Sign up successful! Your ID is: ${data.id}`);
        setTab('login');
      } else {
        // Doctor signup: retry if id exists
        let success = false;
        while (!success) {
          res = await registerDoctor({
            name: signupData.name,
            specialization: signupData.specialization,
            qualifications: signupData.qualifications,
            availability_schedule: signupData.availability_schedule,
            password: signupData.password
          });
          data = await res.json();
          if (data.error && data.error.toLowerCase().includes('id already exists')) {
            continue;
          }
          if (data.id) {
            setMessage(`Sign up successful! Your ID is: ${data.id}`);
            setTab('login');
            success = true;
          } else {
            setMessage('Sign up failed!');
            break;
          }
        }
      }
    } catch {
      setMessage('Sign up failed!');
    }
  };

  // Add slot for doctor
  const addSlot = () => {
    if (signupData.tempSlot) {
      setSignupData({
        ...signupData,
        availability_schedule: [...signupData.availability_schedule, signupData.tempSlot],
        tempSlot: ''
      });
    }
  };

  const inputStyle = { maxWidth: 400, minWidth: 300, margin: '0 auto 18px auto', display: 'block' };
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
          onClick={() => navigate('/home')}
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
              background: "#fdecea",
              color: "#e74c3c",
              border: "1px solid #e74c3c",
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
        <div className="login-container">
          <div className="tabs mb-4" style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
            <div
              className={`tab ${tab === 'login' ? 'active' : ''}`}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '12px 0',
                cursor: 'pointer',
                borderBottom: tab === 'login' ? '3px solid #28a745' : 'none',
                fontWeight: tab === 'login' ? 'bold' : 'normal',
                color: tab === 'login' ? '#28a745' : '#888',
                background: 'none'
              }}
              onClick={() => setTab('login')}
            >
              Login
            </div>
            <div
              className={`tab ${tab === 'signup' ? 'active' : ''}`}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '12px 0',
                cursor: 'pointer',
                borderBottom: tab === 'signup' ? '3px solid #28a745' : 'none',
                fontWeight: tab === 'signup' ? 'bold' : 'normal',
                color: tab === 'signup' ? '#28a745' : '#888',
                background: 'none'
              }}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </div>
          </div>
          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <input className="form-control mb-2" style={inputStyle} type="text" placeholder="ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
              <select className="form-control mb-2" style={inputStyle} value={loginRole} onChange={e => setLoginRole(e.target.value)}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              <input className="form-control mb-2" style={inputStyle} type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              <button className="btn btn-success" style={inputStyle} type="submit">Login</button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <select className="form-control mb-2" style={inputStyle} value={signupRole} onChange={e => setSignupRole(e.target.value)}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              <input className="form-control mb-2" style={inputStyle} type="password" placeholder="Password" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} required />
              {signupRole === 'patient' ? (
                <>
                  <input className="form-control mb-2" style={inputStyle} placeholder="Name" value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} required />
                  <input className="form-control mb-2" style={inputStyle} type="number" placeholder="Age" value={signupData.age} onChange={e => setSignupData({ ...signupData, age: e.target.value })} required />
                  <select className="form-control mb-2" style={inputStyle} value={signupData.gender} onChange={e => setSignupData({ ...signupData, gender: e.target.value })}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input className="form-control mb-2" style={inputStyle} placeholder="Contact Info" value={signupData.contact_info} onChange={e => setSignupData({ ...signupData, contact_info: e.target.value })} required />
                  <textarea className="form-control mb-2" style={inputStyle} placeholder="Medical History" value={signupData.medical_history} onChange={e => setSignupData({ ...signupData, medical_history: e.target.value })} />
                </>
              ) : (
                <>
                  <input className="form-control mb-2" style={inputStyle} placeholder="Name" value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} required />
                  <input className="form-control mb-2" style={inputStyle} placeholder="Specialization" value={signupData.specialization} onChange={e => setSignupData({ ...signupData, specialization: e.target.value })} required />
                  <input className="form-control mb-2" style={inputStyle} placeholder="Qualifications" value={signupData.qualifications} onChange={e => setSignupData({ ...signupData, qualifications: e.target.value })} required />
                  <div className="mb-2">
                    <input type="datetime-local" className="form-control mb-2" style={inputStyle} value={signupData.tempSlot} onChange={e => setSignupData({ ...signupData, tempSlot: e.target.value })} />
                    <button type="button" className="btn btn-secondary mb-2" style={inputStyle} onClick={addSlot}>Add Timeslot</button>
                    <ul style={{ maxWidth: 400, minWidth: 300, margin: '0 auto' }}>
                      {signupData.availability_schedule.map((slot, idx) => (
                        <li key={idx}>{new Date(slot).toLocaleString()}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              <button className="btn btn-success" style={inputStyle} type="submit">Sign Up</button>
            </form>
          )}
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
    </div>
  );
};
export default Login;
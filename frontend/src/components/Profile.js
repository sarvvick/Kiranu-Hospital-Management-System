import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [changePwdMode, setChangePwdMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const userObj = JSON.parse(userCookie);
      setUser(userObj);
      setForm(userObj);
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Send update to backend
      let endpoint = "";
      let payload = {};
      if (user.role === "patient") {
        endpoint = `http://localhost:5000/patients/${user.id}`;
        payload = {
          name: form.name,
          age: form.age,
          gender: form.gender,
          contact_info: form.contact_info,
          medical_history: form.medical_history,
        };
      } else {
        endpoint = `http://localhost:5000/doctors/${user.id}`;
        payload = {
          name: form.name,
          specialization: form.specialization,
          qualifications: form.qualifications,
        };
      }
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to update profile in database.");
      }
      setUser({ ...user, ...payload });
      Cookies.set("user", JSON.stringify({ ...user, ...payload }), { expires: 7 });
      setEditMode(false);
    } catch (err) {
      alert("Failed to update profile in database.");
    }
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      setPwdMessage("Password cannot be empty.");
      return;
    }
    // Update password in user object and cookies
    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    setForm(updatedUser);
    Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
    setPwdMessage("Password updated successfully.");
    setNewPassword("");
    setChangePwdMode(false);
  };

  const handleProfile = () => {
    // Already on profile, just close menu
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
          onClick={() => { setActiveTab("home"); navigate('/home'); }}
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
            onClick={() => { setActiveTab("home"); navigate('/home'); }}
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
            onClick={() =>{ setActiveTab("about"); navigate('/');}}
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
            onClick={() => { navigate('/');setActiveTab("speciality");}}
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
            onClick={() => {setActiveTab("feedback"); navigate('/');}}
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
        {/* Login link top right */}
        <button
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 150,
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 1000
          }}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      {/* Main content below navbar */}
      <div
        style={{
          minHeight: '100vh',
          background: '#fff',
          paddingTop: 100,
          marginLeft: menuOpen ? 220 : 56,
          transition: "margin-left 0.2s"
        }}
      >
        <div style={{
          maxWidth: 600,
          margin: '40px auto',
          background: '#f4f4f4',
          borderRadius: 8,
          padding: '32px 24px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '60px' }}>Profile</h2>
          {user.role === "patient" ? (
            <div>
              <div style={{ fontSize: '25px' }}><b>ID:</b> {user.id}</div>
              <div style={{ fontSize: '25px' }}>
                <b>Name:</b> {editMode ? (
                  <input name="name" value={form.name || ""} onChange={handleChange} />
                ) : user.name}
              </div>
              <div style={{ fontSize: '25px' }}>
                <b>Age:</b> {editMode ? (
                  <input name="age" value={form.age || ""} onChange={handleChange} />
                ) : user.age}
              </div>
              <div style={{ fontSize: '25px' }}>
                <b>Gender:</b> {editMode ? (
                  <select name="gender" value={form.gender || ""} onChange={handleChange}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : user.gender}
              </div>
              <div style={{ fontSize: '25px' }}>
                <b>Contact Info:</b> {editMode ? (
                  <input name="contact_info" value={form.contact_info || ""} onChange={handleChange} />
                ) : user.contact_info}
              </div>
              <div style={{ fontSize: '25px' }}>
                <b>Medical History:</b> {editMode ? (
                  <textarea name="medical_history" value={form.medical_history || ""} onChange={handleChange} />
                ) : user.medical_history}
              </div>
            </div>
          ) : (
            <div>
              <div><b>ID:</b> {user.id}</div>
              <div>
                <b>Name:</b> {editMode ? (
                  <input name="name" value={form.name || ""} onChange={handleChange} />
                ) : user.name}
              </div>
              <div>
                <b>Specialization:</b> {editMode ? (
                  <input name="specialization" value={form.specialization || ""} onChange={handleChange} />
                ) : user.specialization}
              </div>
              <div>
                <b>Qualifications:</b> {editMode ? (
                  <input name="qualifications" value={form.qualifications || ""} onChange={handleChange} />
                ) : user.qualifications}
              </div>
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            {editMode ? (
              <button
                style={{
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  marginRight: 12,
                  cursor: "pointer"
                }}
                onClick={handleSave}
              >
                Save
              </button>
            ) : (
              <button
                style={{
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            )}
            {editMode && (
              <button
                style={{
                  background: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => { setEditMode(false); setForm(user); }}
              >
                Cancel
              </button>
            )}
           {/* { Change Password Section }
            <button
              style={{
                background: "#2980b9",
                color: "#fff",
                border: "none",
                borderRadius: 5,
                padding: "10px 24px",
                fontWeight: "bold",
                marginLeft: 12,
                cursor: "pointer"
              }}
              onClick={() => { setChangePwdMode(!changePwdMode); setPwdMessage(""); setNewPassword(""); }}
            >
              {changePwdMode ? "Cancel Password Change" : "Change Password"}
            </button>
          </div>
          {changePwdMode && (
            <div style={{ marginTop: 20 }}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginRight: 8,
                  minWidth: 200
                }}
              />
              <button
                style={{
                  background: "#27ae60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "8px 18px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={handleChangePassword}
              >
                Save Password
              </button>
              {pwdMessage && (
                <div style={{
                  marginTop: 10,
                  color: pwdMessage.includes("success") ? "#27ae60" : "#e74c3c",
                  fontWeight: "bold"
                }}>
                  {pwdMessage}
                </div>
              )}
            </div>
           )}*/}
        </div>
        </div>
        {/* Contact Us section */}
        <div style={{
          width: '100%',
          background: '#f8f8f8',
          padding: '24px 0',
          textAlign: 'center',
          position: 'relative',
          left: 0,
          bottom: -180,
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
}




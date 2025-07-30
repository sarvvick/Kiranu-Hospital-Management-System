import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  require('../assets/slide1.jpg'),
  require('../assets/slide2.jpg'),
  require('../assets/slide3.jpg'),
  require('../assets/slide4.jpg')
];

export default function Main() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ fontSize: '60px' }}>About Us</h2>
            <p style={{ fontSize: '20px' }}>
              At Kiranu Hospital, we are dedicated to providing exceptional healthcare with compassion, precision, and integrity. Located in the heart of our community, we have earned a reputation for our patient-first approach and a commitment to excellence in medical care. Our multidisciplinary team of experienced doctors, nurses, and specialists work together to ensure each patient receives personalized treatment and attention.
              From outpatient services to advanced surgical procedures, we combine cutting-edge technology with a warm, human touch—because your health and comfort are our top priorities.
            </p>
          </div>
        );
      case "speciality":
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ fontSize: '60px' }}>Speciality</h2>
            <p style={{ fontSize: '20px' }}>
              We offer a wide range of specialties including Cardiology, Orthopedics, Obstetrics & Gynecology, Pediatrics, General Surgery, and Emergency & Critical Care. Each department is equipped with advanced technology and led by experienced specialists to ensure accurate diagnosis, effective treatment, and holistic recovery. Whether it’s routine check-ups or complex procedures, Kiranu Hospital stands ready to serve with expertise and dedication.
            </p>
          </div>
        );
      case "feedback":
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ fontSize: '60px' }}>Feedback</h2>
            <p style={{ fontSize: '20px' }}>
              At Kiranu Hospital, your feedback helps us grow and improve. We value every patient’s experience and encourage you to share your thoughts, whether it's appreciation, suggestions, or concerns. Your input plays a vital role in helping us enhance our services, maintain high standards of care, and ensure a better experience for all who walk through our doors.


            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  

  const handleProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  const handleSignOut = () => {
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
            onClick={() => setActiveTab("about")}
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
            onClick={() => setActiveTab("speciality")}
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
            onClick={() => setActiveTab("feedback")}
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
        {/* Slideshow */}
        <div style={{
          maxWidth: 2000,
          margin: '5px auto 0 auto',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#fafafa'
        }}>
          <img
            src={slides[current]}
            alt={`slide${current + 1}`}
            style={{ width: '100%', height: 650, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            {slides.map((_, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  margin: '0 4px',
                  borderRadius: '50%',
                  background: idx === current ? '#28a745' : '#ccc',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrent(idx)}
              />
            ))}
          </div>
        </div>
        {/* Tab content below slideshow */}
        <div style={{
          maxWidth: 1000,
          margin: '40px auto',
          background: '#f4f4f4',
          borderRadius: 8,
          padding: '32px 24px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
        }}>
          {renderTabContent()}
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
        bottom: 0,
        zIndex: 999
      }}>
        <h4>Contact Us</h4>
        <div>Email: <a href="mailto:support@kiranu.com">support@kiranu.com</a></div>
        <div>Phone: <a href="tel:+911234567890">+91 12345 67890</a></div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Home, Pill, HelpCircle, Users, Camera, Settings } from "lucide-react";
import { getMedications } from "./services/database";
import Help from "./components/Help/Help";
import Admin from "./components/Admin/Admin";
import "./App.css";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("home");
  const [isRinging, setIsRinging] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [medications, setMedications] = useState([]);
  const [nextMed, setNextMed] = useState(null);

  // Load medications from Supabase
  useEffect(() => {
    loadMedications();
    const interval = setInterval(loadMedications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadMedications = async () => {
    try {
      const data = await getMedications();
      setMedications(data);
      findNextMedication(data);
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  };

  // Find next medication based on current time
  const findNextMedication = (meds) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeNum = currentHours * 60 + currentMinutes;

    // Convert time string "08:00" to minutes
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Find medications that haven't been taken yet today
    const upcomingMeds = meds.filter((med) => {
      const medTime = timeToMinutes(med.time);
      return medTime > currentTimeNum;
    });

    // Sort by time and get the closest one
    if (upcomingMeds.length > 0) {
      upcomingMeds.sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
      );
      setNextMed(upcomingMeds[0]);
    } else if (meds.length > 0) {
      // If no upcoming meds today, show first med for tomorrow
      setNextMed(meds[0]);
    } else {
      setNextMed(null);
    }
  };

  // Check if it's time to take medication
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (nextMed) {
        const currentTimeStr = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setIsRinging(currentTimeStr === nextMed.time);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextMed]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "help") setCurrentView("help");
    else if (tab === "admin") setCurrentView("admin");
    else setCurrentView("home");
  };

  const handleBack = () => {
    setCurrentView("home");
    setActiveTab("home");
    loadMedications(); // Refresh when returning
  };

  // Render Help view
  if (currentView === "help") {
    return <Help onBack={handleBack} />;
  }

  // Render Admin view
  if (currentView === "admin") {
    return <Admin onBack={handleBack} />;
  }

  // Render Home view
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <button className="icon-btn profile-btn" aria-label="Profile">
          <img src="/profile.jpeg" alt="Profile" className="profile-icon-img" />
        </button>
        <h1 className="app-title">MediMind AI</h1>
        <button
          className={`icon-btn bell-btn ${isRinging ? "ringing" : ""}`}
          aria-label="Notifications"
        >
          <img
            src={isRinging ? "/bell-ringing.jpeg" : "/bell-not-ringing.jpeg"}
            alt="Notifications"
            className="bell-icon-img"
          />
          {isRinging && <span className="notification-badge">1</span>}
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Time Display */}
        <div className="time-section">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Left Column - Next Dose with REAL medication from database */}
          <div className={`next-dose-card ${isRinging ? "urgent" : ""}`}>
            <div className="pill-icon">
              <div className="med-image-home">
                <img
                  src={nextMed?.image_url || "/drug-icon.jpeg"}
                  alt={nextMed?.name || "Medication"}
                />
              </div>
              <div className="dose-info">
                <p className="dose-label">
                  {isRinging ? "⚠️ TAKE NOW" : "Next Dose"}
                </p>
                <p className="dose-time">
                  {isRinging ? "NOW" : nextMed?.time || "No medication"}
                </p>
              </div>
            </div>
            <div className="medication-box">
              <h2 className="med-name">
                {nextMed?.name || "No medication scheduled"}
              </h2>
              <p className="med-instruction">
                {nextMed
                  ? `${nextMed.quantity} (${nextMed.dosage})`
                  : "Add medications in Admin"}
                {nextMed?.with_water && " - Take with water"}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Scan Button */}
            <button
              className={`scan-button ${isRinging ? "pulse" : ""}`}
              onClick={() => alert("Opening camera...")}
            >
              <div className="camera-icon">
                <Camera size={48} strokeWidth={1.5} />
              </div>
              <span className="scan-text">
                {isRinging ? "TAKE MY MEDS NOW" : "SCAN MY MEDS"}
              </span>
            </button>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <p className="stat-number">0/{medications.length}</p>
                <p className="stat-label">Taken Today</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">85%</p>
                <p className="stat-label">Weekly Adherence</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => handleTabClick("home")}
        >
          <Home size={24} strokeWidth={2.5} />
          <span>Home</span>
        </button>
        <button
          className={`nav-item ${activeTab === "meds" ? "active" : ""}`}
          onClick={() => handleTabClick("meds")}
        >
          <Pill size={24} strokeWidth={2.5} />
          <span>Meds</span>
        </button>
        <button
          className={`nav-item ${activeTab === "help" ? "active" : ""}`}
          onClick={() => handleTabClick("help")}
        >
          <HelpCircle size={24} strokeWidth={2.5} />
          <span>Help</span>
        </button>
        <button
          className={`nav-item ${activeTab === "care" ? "active" : ""}`}
          onClick={() => handleTabClick("care")}
        >
          <Users size={24} strokeWidth={2.5} />
          <span>Care</span>
        </button>
        <button
          className={`nav-item admin-nav-item ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => handleTabClick("admin")}
        >
          <Settings size={24} strokeWidth={2.5} />
          <span>Admin</span>
        </button>
      </nav>
    </div>
  );
}

export default App;

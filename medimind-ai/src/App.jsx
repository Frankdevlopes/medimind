import React, { useState, useEffect } from "react";
import { Home, Pill, HelpCircle, Users, Camera, Settings } from "lucide-react";
import { getMedications } from "./services/database";

import Help from "./components/Help/Help";
import Admin from "./components/Admin/Admin";
import Scanner from "./components/Scanner/Scanner";

import "./App.css";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("home");
  const [isRinging, setIsRinging] = useState(false);
  const [currentView, setCurrentView] = useState("home");
  const [medications, setMedications] = useState([]);
  const [nextMed, setNextMed] = useState(null);

  // Load medications
  useEffect(() => {
    loadMedications();
    const interval = setInterval(loadMedications, 60000);
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

  const findNextMedication = (meds) => {
    const now = new Date();
    const currentTimeNum = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const upcomingMeds = meds.filter((med) => {
      const medTime = timeToMinutes(med.time);
      return medTime > currentTimeNum;
    });

    if (upcomingMeds.length > 0) {
      upcomingMeds.sort(
        (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
      );
      setNextMed(upcomingMeds[0]);
    } else if (meds.length > 0) {
      setNextMed(meds[0]);
    } else {
      setNextMed(null);
    }
  };

  // Clock + alarm
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
    loadMedications();
  };

  // HELP PAGE
  if (currentView === "help") {
    return <Help onBack={handleBack} />;
  }

  // ADMIN PAGE
  if (currentView === "admin") {
    return <Admin onBack={handleBack} />;
  }

  // SCANNER PAGE
  if (currentView === "scanner") {
    return <Scanner onBack={handleBack} />;
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <button className="icon-btn profile-btn">
          <img src="/profile.jpeg" alt="Profile" className="profile-icon-img" />
        </button>

        {/* LOGO AND TITLE CONTAINER */}
        <div className="logo-title-container">
          <img
            src="/medimind logo.jpeg"
            alt="MediMind Logo"
            className="header-logo"
          />
          <h1 className="app-title">MediMind</h1>
        </div>

        <button className={`icon-btn bell-btn ${isRinging ? "ringing" : ""}`}>
          <img
            src={isRinging ? "/bell-ringing.jpeg" : "/bell-not-ringing.jpeg"}
            alt="Notifications"
            className="bell-icon-img"
          />
        </button>
      </header>

      {/* MAIN */}
      <main className="main-content">
        {/* TIME */}
        <div className="time-section">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>

        {/* GRID */}
        <div className="content-grid">
          {/* NEXT DOSE */}
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
                  {isRinging ? "NOW" : nextMed?.time || "--"}
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
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            {/* CAMERA BUTTON */}
            <button
              className={`scan-button ${isRinging ? "pulse" : ""}`}
              onClick={() => setCurrentView("scanner")}
            >
              <div className="camera-icon">
                <Camera size={48} strokeWidth={1.5} />
              </div>

              <span className="scan-text">
                {isRinging ? "TAKE MY MEDS NOW" : "SCAN MY MEDS"}
              </span>
            </button>

            {/* STATS */}
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

      {/* NAVIGATION */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => handleTabClick("home")}
        >
          <Home size={24} />
          <span>Home</span>
        </button>

        <button
          className={`nav-item ${activeTab === "help" ? "active" : ""}`}
          onClick={() => handleTabClick("help")}
        >
          <HelpCircle size={24} />
          <span>Help</span>
        </button>

        <button
          className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => handleTabClick("admin")}
        >
          <Settings size={24} />
          <span>Admin</span>
        </button>
      </nav>
    </div>
  );
}

export default App;

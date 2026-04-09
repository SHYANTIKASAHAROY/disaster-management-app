import React, { useState } from "react";
import "./App.css";

// 🗺️ MAP IMPORTS
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 🚨 FIX MARKER ICON
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    type: "",
    customType: "", // ✅ NEW
    name: "",
    location: "",
    severity: "Medium",
  });

  // 🧠 SAFETY TIPS
  const getSafetyTip = (type) => {
    switch (type) {
      case "Fire":
        return "Stay low, avoid smoke, exit immediately.";
      case "Flood":
        return "Move to higher ground and avoid water.";
      case "Crime":
        return "Stay in safe areas and contact authorities.";
      case "Accident":
        return "Call emergency services and avoid movement.";
      case "Earthquake":
        return "Drop, cover, and hold on.";
      default:
        return "Stay alert and follow official instructions.";
    }
  };

  // 🤖 AI MESSAGE
    const sendMessage = async () => {
  if (!message) return;

  const userMsg = { role: "user", text: message };
  setChat((prev) => [...prev, userMsg]);

  try {
    const res = await fetch("https://disaster-management-app-qq49.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    const botMsg = {
      role: "bot",
      text: data.reply,
    };

    setChat((prev) => [...prev, botMsg]);
    setMessage("");
  } catch {
    setChat((prev) => [
      ...prev,
      { role: "bot", text: "⚠️ Error connecting to AI" },
    ]);
  }
};
  // 🌍 SUBMIT REPORT
  const submitReport = async () => {
    if (!form.type || !form.name || !form.location) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${form.location}`,
        {
          headers: { "User-Agent": "CrisisCore-App" },
        }
      );

      const data = await res.json();

      if (data.length === 0) {
        alert("Location not found");
        return;
      }

      const finalType =
        form.type === "Other" ? form.customType : form.type;

      const safetyTip = getSafetyTip(finalType);

      const newReport = {
        ...form,
        type: finalType,
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        time: new Date().toLocaleString(),
        safetyTip, // ✅ added
      };

      setReports([newReport, ...reports]);

      setForm({
        type: "",
        customType: "",
        name: "",
        location: "",
        severity: "Medium",
      });
    } catch {
      alert("Error fetching location");
    }
  };

  const deleteReport = (i) => {
    setReports(reports.filter((_, index) => index !== i));
  };

  // 🚨 ALERT ON CLICK
  const showDetails = (r) => {
    alert(
      `📍 ${r.location}
🚨 Type: ${r.type}
🕒 Time: ${r.time}

🛟 Safety Tip:
${r.safetyTip}`
    );
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <div className="navbar">
        <div className="brand">
          <h1 className="logo">Crisis Core</h1>
          <p>Disaster Response & Assistance System</p>
        </div>

        <div className="nav-buttons">
          <button onClick={() => setActiveTab("home")}>HOME</button>
          <button onClick={() => setActiveTab("reports")}>REPORTS</button>
          <button onClick={() => setActiveTab("map")}>MAP</button>
          <button onClick={() => setChatOpen(true)}>AI ASSISTANT</button>
          <button
            className="sos-nav"
            onClick={() => (window.location.href = "tel:112")}
          >
            SOS
          </button>
        </div>
      </div>

      {/* HOME */}
      {activeTab === "home" && (
        <div className="card">
          <h2>Report Emergency</h2>

          <div className="types">
            {["Fire", "Flood", "Crime", "Accident", "Earthquake", "Other"].map(
              (t) => (
                <button
                  key={t}
                  className={form.type === t ? "active" : ""}
                  onClick={() => setForm({ ...form, type: t })}
                >
                  {t}
                </button>
              )
            )}
          </div>

          {/* ✅ OTHER INPUT */}
          {form.type === "Other" && (
            <input
              placeholder="Enter disaster type"
              value={form.customType}
              onChange={(e) =>
                setForm({ ...form, customType: e.target.value })
              }
            />
          )}

          <input
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <div className="action-buttons">
            <button className="submit" onClick={submitReport}>
              Send Report
            </button>

            <button className="sos-btn">SOS</button>
          </div>
        </div>
      )}

      {/* REPORTS */}
      {activeTab === "reports" && (
        <div className="reports">
          <h2>Past Reports</h2>

          {reports.length === 0 ? (
            <p>No reports yet</p>
          ) : (
            reports.map((r, i) => (
              <div
                className="report-card"
                key={i}
                onClick={() => showDetails(r)} // ✅ click alert
              >
                <p><b>Name:</b> {r.name}</p>
                <p><b>Location:</b> {r.location}</p>
                <p><b>Type:</b> {r.type}</p>
                <p><b>Severity:</b> {r.severity}</p>
                <p><b>Time:</b> {r.time}</p>
                <p><b>Lat:</b> {r.lat}</p>
                <p><b>Lng:</b> {r.lng}</p>
                <p><b>Safety Tip:</b> {r.safetyTip}</p>

                <button onClick={() => deleteReport(i)}>Delete</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* MAP */}
      {activeTab === "map" && (
        <div className="map">
          <h2>📍 Live Disaster Map</h2>

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "500px", borderRadius: "12px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {reports.map((r, i) =>
              r.lat && r.lng ? (
                <Marker key={i} position={[r.lat, r.lng]}>
                  <Popup>
                    <b>{r.name}</b><br />
                    {r.location}<br />
                    {r.type}<br />
                    Severity: {r.severity}
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
      )}

      {/* CHAT */}
      {chatOpen && (
        <div className="chat-box">
          <div className="chat-header">
            AI Assistant
            <span onClick={() => setChatOpen(false)}>✖</span>
          </div>

          <div className="chat-body">
            {chat.map((c, i) => (
              <div key={i} className={c.role === "user" ? "user" : "bot"}>
                {c.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* FLOAT BUTTON */}
      <div className="ai-float" onClick={() => setChatOpen(true)}>
        🤖
      </div>
    </div>
  );
}

export default App;gi
import React, { useState, useEffect } from "react";
import { BASE_URL } from "../api";
import { CloudSync, WarningAmber } from "@mui/icons-material";

const ServerConnectionBanner = () => {
  const [status, setStatus] = useState("checking"); // 'checking', 'sleeping', 'awake', 'error'
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Dot animation for loading status
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    let active = true;
    let failCount = 0;
    
    // Set a timer to declare it 'sleeping' if no response in 2 seconds
    const sleepTimer = setTimeout(() => {
      if (active && status === "checking") {
        setStatus("sleeping");
      }
    }, 2000);

    const checkStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/`, { method: "GET" });
        if (res.ok) {
          if (active) {
            setStatus("awake");
            clearTimeout(sleepTimer);
          }
        } else {
          throw new Error("Server error");
        }
      } catch (err) {
        if (!active) return;
        failCount++;
        // If it fails more than 20 times, show error
        if (failCount > 20) {
          setStatus("error");
        }
        // Poll again in 3 seconds
        setTimeout(checkStatus, 3000);
      }
    };

    checkStatus();

    return () => {
      active = false;
      clearTimeout(sleepTimer);
    };
  }, []);

  if (status === "awake") return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 9999,
      maxWidth: "350px",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      transition: "all 0.5s ease",
      backgroundColor: status === "error" ? "rgba(127, 29, 29, 0.85)" : "rgba(30, 27, 75, 0.85)",
      border: status === "error" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(99, 102, 241, 0.3)",
      color: status === "error" ? "#fecaca" : "#c7d2fe",
      fontFamily: "Roboto, sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {status === "error" ? (
          <WarningAmber style={{ color: "#f87171", fontSize: "24px" }} />
        ) : (
          <CloudSync style={{ color: "#818cf8", fontSize: "24px" }} />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: status === "error" ? "#fca5a5" : "#a5b4fc"
          }}>
            {status === "error" ? "Database Offline" : "Server Connection"}
          </span>
          <span style={{ fontSize: "13px", fontWeight: "500", marginTop: "2px" }}>
            {status === "checking" && `Connecting to database${dots}`}
            {status === "sleeping" && `Waking up server (free hosting)${dots}`}
            {status === "error" && "Unable to connect. Retrying..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServerConnectionBanner;

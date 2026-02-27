import React from "react";
import ResponseInput from "./ResponseInput.jsx";
import SessionLog from "./SessionLog.jsx";

function DoctorDashboard() {
    return (
        <div className="dashboard doctor">
            <h2>🩺 Doctor/Nurse View</h2>
            <ResponseInput />
            <SessionLog />
        </div>
    );
}

export default DoctorDashboard;

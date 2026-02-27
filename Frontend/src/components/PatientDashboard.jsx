import React from "react";
import WebcamFeed from "./webcamfeed.jsx";
import SignOutput from "./SignOutput.jsx";
import SignVisualization from "./SignVisualization.jsx";
import SessionLog from "./SessionLog.jsx";

function PatientDashboard() {
    return (
        <div className="dashboard patient">
            <h2>👩‍⚕️ Patient View</h2>
            <WebcamFeed />
            <SignOutput />
            <SignVisualization />
            <SessionLog />
        </div>
    );
}

export default PatientDashboard;

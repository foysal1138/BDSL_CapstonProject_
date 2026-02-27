import React, { useState } from "react";

function SessionLog() {
    const [logs] = useState([
        { sender: "Patient", message: "Need water" },
        { sender: "Doctor", message: "Water is coming" }
    ]);

    return (
        <div className="session-log">
            <h3>Session Log</h3>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}><strong>{log.sender}:</strong> {log.message}</li>
                ))}
            </ul>
        </div>
    );
}

export default SessionLog;

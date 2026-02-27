import React, { Suspense, lazy } from "react";
import { WSProvider } from "./services/websocket";

const PatientDashboard = lazy(() => import("./components/PatientDashboard.jsx"));
const DoctorDashboard = lazy(() => import("./components/DoctorDashboard.jsx"));

function App() {
    return (
        <WSProvider>
            <div className="app-container">
                <h1 className="title">🏥 Hospital Communication Dashboard</h1>
                <Suspense fallback={<div>Loading dashboards...</div>}>
                    <div className="dashboard-grid">
                        <PatientDashboard />
                        <DoctorDashboard />
                    </div>
                </Suspense>
            </div>
        </WSProvider>
    );
}

export default App;

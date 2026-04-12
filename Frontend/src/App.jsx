// Application router with protected routes for authenticated users
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientList from './pages/PatientList';
import Profile from './pages/Profile';

// ProtectedRoute ensures user has valid auth token before accessing protected pages
function ProtectedRoute({ children }) {
  const authToken = localStorage.getItem('authToken');
  return authToken ? children : <Navigate to="/login" replace />;
}

// Main app with all routes: public (login, signup, forgot-password) and protected (dashboard, patients, profile)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
        <Route path="/patient-registration" element={<ProtectedRoute><PatientRegistration /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

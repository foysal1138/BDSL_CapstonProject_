// Doctor registration form with profile information and BMDC number
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiHash, FiChevronDown, FiMail, FiLock } from "react-icons/fi";
import apiClient from "../config/apiClient";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", firstName: "", gender: "", bmdcRegNum: "", dateOfBirth: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Validate form fields before submission
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.gender) errs.gender = "Please select gender";
    if (!form.bmdcRegNum.trim()) errs.bmdcRegNum = "BMDC Reg. Number is required";
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    return errs;
  };

  // Register doctor account and save profile locally
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        await apiClient.post("/auth/signup", {
          email: form.email,
          password: form.password,
          role: "doctor",
        });
        localStorage.setItem("doctorProfile", JSON.stringify({
          firstName: form.firstName,
          gender: form.gender,
          bmdcRegNum: form.bmdcRegNum,
          dateOfBirth: form.dateOfBirth,
          email: form.email,
        }));
        alert("Registration successful! Please log in.");
        navigate("/login");
      } catch (error) {
        setApiError(error.message || "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear error when field is edited
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-600 text-white text-2xl font-bold mb-4">
            BSL
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Sign Up</h1>
          <p className="text-gray-500 mt-1">Create your doctor account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{apiError}</div>}

            {/* Email and Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" placeholder="Email Address" className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? "border-red-400" : "border-gray-300"}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={loading} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" placeholder="Password" className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.password ? "border-red-400" : "border-gray-300"}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={loading} />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder="Confirm Password" className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.confirmPassword ? "border-red-400" : "border-gray-300"}`} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} disabled={loading} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="First Name" className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.firstName ? "border-red-400" : "border-gray-300"}`} value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
              </div>
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="relative">
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select className={`w-full appearance-none px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${errors.gender ? "border-red-400" : "border-gray-300"}`} value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* BMDC Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BMDC Registration Number</label>
              <div className="relative">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="e.g. A-12345" className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.bmdcRegNum ? "border-red-400" : "border-gray-300"}`} value={form.bmdcRegNum} onChange={(e) => handleChange("bmdcRegNum", e.target.value)} />
              </div>
              {errors.bmdcRegNum && <p className="text-red-500 text-xs mt-1">{errors.bmdcRegNum}</p>}
            </div>

            {/* Date of Birth with max date constraint to prevent future dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" max={new Date().toISOString().split('T')[0]} className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.dateOfBirth ? "border-red-400" : "border-gray-300"}`} value={form.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
              </div>
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg mt-2 cursor-pointer">
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

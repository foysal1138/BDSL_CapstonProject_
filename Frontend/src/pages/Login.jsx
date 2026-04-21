// Login page - User authentication with email and password
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import apiClient from "../config/apiClient";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // Validate email and password format
    const validate = () => {
        const errs = {};
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
        if (!form.password) errs.password = "Password is required";
        else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
        return errs;
    };

    // Submit login request and store auth token
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length === 0) {
            setLoading(true);
            try {
                const response = await apiClient.post("/auth/login", { email: form.email, password: form.password });
                localStorage.setItem("authToken", response.access_token);
                localStorage.setItem("user", JSON.stringify(response.user));
                navigate("/dashboard");
            } catch (error) {
                setApiError(error.message || "Login failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-600 text-white text-2xl font-bold mb-4">BSL</div>
                    <h1 className="text-3xl font-bold text-gray-800">Bangla Sign Language</h1>
                    <p className="text-gray-500 mt-1">Sign in to your account</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {apiError && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"><p className="text-sm font-semibold">Error</p><p className="text-xs mt-1">{apiError}</p></div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Enter your email" className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${errors.email ? "border-red-400" : "border-gray-300"}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={loading} />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showPass ? "text" : "password"} placeholder="Enter your password" className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${errors.password ? "border-red-400" : "border-gray-300"}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={loading} />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">Don't have an account? <Link to="/signup" className="text-teal-600 hover:underline font-medium">Sign up</Link></p>
                        <Link to="/forgot-password" className="text-teal-600 hover:underline text-sm mt-2 inline-block">Forgot password?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

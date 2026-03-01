import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiDroplet,
  FiChevronDown,
  FiArrowLeft,
} from "react-icons/fi";

export default function PatientRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    lastName: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    address: "",
    nidBirthCert: "",
    bloodGroup: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.surname.trim()) errs.surname = "Surname is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.gender) errs.gender = "Gender is required";
    if (!form.age) errs.age = "Age is required";
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.nidBirthCert.trim())
      errs.nidBirthCert = "NID / Birth Certificate No. is required";
    if (!form.bloodGroup) errs.bloodGroup = "Blood group is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Store patient data
      const patients = JSON.parse(localStorage.getItem("patients") || "[]");
      patients.push({ ...form, id: Date.now() });
      localStorage.setItem("patients", JSON.stringify(patients));
      alert("Patient registered successfully!");
      navigate("/dashboard");
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  // Auto-calculate age from DOB
  const handleDOBChange = (value) => {
    handleChange("dateOfBirth", value);
    if (value) {
      const today = new Date();
      const birth = new Date(value);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setForm((prev) => ({ ...prev, dateOfBirth: value, age: String(age) }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 mb-4 cursor-pointer"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Patient Registration
          </h1>
          <p className="text-gray-500 mt-1">Register a new patient</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="First Name"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.firstName ? "border-red-400" : "border-gray-300"
                    }`}
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surname
                </label>
                <input
                  type="text"
                  placeholder="Surname"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.surname ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.surname}
                  onChange={(e) => handleChange("surname", e.target.value)}
                />
                {errors.surname && (
                  <p className="text-red-500 text-xs mt-1">{errors.surname}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.lastName ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Gender & Age Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    className={`w-full appearance-none px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
                      errors.gender ? "border-red-400" : "border-gray-300"
                    }`}
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Auto-calculated"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 ${
                    errors.age ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.age}
                  readOnly
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                )}
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.dateOfBirth ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.dateOfBirth}
                  onChange={(e) => handleDOBChange(e.target.value)}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  rows={2}
                  placeholder="Enter full address"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                    errors.address ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* NID / Birth Certificate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NID / Birth Certificate Number
              </label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter NID or Birth Certificate No."
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.nidBirthCert ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.nidBirthCert}
                  onChange={(e) => handleChange("nidBirthCert", e.target.value)}
                />
              </div>
              {errors.nidBirthCert && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.nidBirthCert}
                </p>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <FiDroplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  className={`w-full appearance-none pl-10 pr-8 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white ${
                    errors.bloodGroup ? "border-red-400" : "border-gray-300"
                  }`}
                  value={form.bloodGroup}
                  onChange={(e) => handleChange("bloodGroup", e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              {errors.bloodGroup && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.bloodGroup}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg mt-2 cursor-pointer"
            >
              Register Patient
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

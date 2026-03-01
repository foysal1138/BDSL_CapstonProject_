import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiCalendar,
  FiHash,
  FiArrowLeft,
  FiEdit2,
  FiSave,
} from "react-icons/fi";

export default function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "Doctor",
    surname: "",
    lastName: "",
    gender: "male",
    bmdcRegNum: "A-00000",
    dateOfBirth: "1990-01-01",
  });

  useEffect(() => {
    const saved = localStorage.getItem("doctorProfile");
    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("doctorProfile", JSON.stringify(form));
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 mb-4 cursor-pointer"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-6 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <FiUser size={36} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {form.firstName} {form.lastName}
            </h2>
            <p className="text-teal-100 text-sm">BMDC: {form.bmdcRegNum}</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="flex justify-end">
              {editing ? (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 cursor-pointer"
                >
                  <FiSave size={14} /> Save
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 cursor-pointer"
                >
                  <FiEdit2 size={14} /> Edit
                </button>
              )}
            </div>

            {[
              { label: "First Name", key: "firstName", icon: <FiUser /> },
              { label: "Surname", key: "surname", icon: <FiUser /> },
              { label: "Last Name", key: "lastName", icon: <FiUser /> },
              { label: "Gender", key: "gender", icon: <FiUser /> },
              { label: "BMDC Reg. No.", key: "bmdcRegNum", icon: <FiHash /> },
              {
                label: "Date of Birth",
                key: "dateOfBirth",
                icon: <FiCalendar />,
              },
            ].map(({ label, key, icon }) => (
              <div
                key={key}
                className="flex items-center gap-3 border-b border-gray-100 pb-3"
              >
                <span className="text-teal-600">{icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{label}</p>
                  {editing ? (
                    key === "gender" ? (
                      <select
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <input
                        type={key === "dateOfBirth" ? "date" : "text"}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      />
                    )
                  ) : (
                    <p className="text-sm font-medium text-gray-800">
                      {form[key] || "—"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

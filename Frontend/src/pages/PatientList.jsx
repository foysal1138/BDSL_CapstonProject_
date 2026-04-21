// Display registered patients with search and filter capabilities
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiUsers, FiClipboard } from "react-icons/fi";
import apiClient from "../config/apiClient";

export default function PatientList() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");

    // Load patient records from backend on component mount
    useEffect(() => {
        let mounted = true;
        const loadPatients = async () => {
            try {
                const data = await apiClient.get("/patients");
                if (mounted) setPatients(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                if (mounted) setError(fetchError.message || "Failed to load patient records.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadPatients();
        return () => { mounted = false; };
    }, []);

    // Filter patients by search query across multiple fields
    const filteredPatients = patients.filter((patient) => {
        const searchValue = query.trim().toLowerCase();
        if (!searchValue) return true;
        return [patient.tracking_id, patient.first_name, patient.last_name, patient.gender, patient.address, patient.nid_birth_cert, patient.blood_group]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchValue));
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-white px-4 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 mb-5 cursor-pointer">
                    <FiArrowLeft /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-teal-100 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 text-sm font-medium bg-white/15 rounded-full px-3 py-1 mb-3">
                                    <FiUsers /> Registered patients
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold">Patient Tracking List</h1>
                                <p className="text-sm text-white/85 mt-2 max-w-2xl">
                                    Review registered patients and their unique tracking IDs from the database.
                                </p>
                            </div>
                            <div className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm min-w-[160px]">
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Total records</p>
                                <p className="text-2xl font-bold">{patients.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                            <div className="relative w-full lg:max-w-md">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by tracking ID, name, blood group, or NID..." className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <FiClipboard className="text-teal-600" />
                                <span>{filteredPatients.length} result(s) shown</span>
                            </div>
                        </div>

                        {loading && (
                            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
                                Loading patient records...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filteredPatients.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
                                No patient records found.
                            </div>
                        )}

                        {!loading && !error && filteredPatients.length > 0 && (
                            <>
                                {/* Desktop table view */}
                                <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-4 py-3">Tracking ID</th>
                                                <th className="px-4 py-3">Patient</th>
                                                <th className="px-4 py-3">Gender</th>
                                                <th className="px-4 py-3">Age</th>
                                                <th className="px-4 py-3">Blood Group</th>
                                                <th className="px-4 py-3">NID / Birth Certificate</th>
                                                <th className="px-4 py-3">Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {filteredPatients.map((patient) => (
                                                <tr key={patient.id} className="align-top hover:bg-teal-50/40 transition-colors">
                                                    <td className="px-4 py-4 font-semibold text-teal-700 whitespace-nowrap">
                                                        {patient.tracking_id}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-medium text-gray-900">
                                                            {patient.first_name} {patient.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4 capitalize text-gray-700">{patient.gender}</td>
                                                    <td className="px-4 py-4 text-gray-700">{patient.age}</td>
                                                    <td className="px-4 py-4 font-medium text-gray-700">{patient.blood_group}</td>
                                                    <td className="px-4 py-4 text-gray-700">{patient.nid_birth_cert}</td>
                                                    <td className="px-4 py-4 text-gray-700 max-w-xs">{patient.address}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile card view */}
                                <div className="grid gap-4 lg:hidden">
                                    {filteredPatients.map((patient) => (
                                        <article key={patient.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tracking ID</p>
                                                    <p className="text-lg font-semibold text-teal-700">{patient.tracking_id}</p>
                                                </div>
                                                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
                                                    {patient.blood_group}
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-2 text-sm text-gray-700">
                                                <p><span className="font-medium">Name:</span> {patient.first_name} {patient.last_name}</p>
                                                <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                                                <p><span className="font-medium">Age:</span> {patient.age}</p>
                                                <p><span className="font-medium">DOB:</span> {new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                                <p><span className="font-medium">NID:</span> {patient.nid_birth_cert}</p>
                                                <p><span className="font-medium">Address:</span> {patient.address}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

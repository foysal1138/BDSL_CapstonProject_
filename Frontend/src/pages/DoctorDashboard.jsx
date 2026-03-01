import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiVideo,
  FiVideoOff,
  FiVolume2,
  FiMenu,
  FiX,
  FiLogOut,
  FiUserPlus,
  FiRefreshCw,
  FiMic,
  FiMicOff,
} from "react-icons/fi";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const streamRef = useRef(null);

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraOn(true);
    } catch (err) {
      alert("Unable to access camera. Please allow camera permissions.");
    }
  }, []);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Text-to-Speech
  const handleSpeak = () => {
    if (!translatedText.trim()) {
      alert("No text to speak. Please type or get a translation first.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = "bn-BD"; // Bangla
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  // Simulate sign language detection (placeholder)
  const handleDetect = () => {
    const sampleTranslations = [
      "আমি ভালো আছি",
      "আমার মাথা ব্যথা",
      "আমার জ্বর হয়েছে",
      "পেটে ব্যথা",
      "আমি পানি খেতে চাই",
      "ধন্যবাদ",
      "হ্যাঁ",
      "না",
    ];
    const random =
      sampleTranslations[Math.floor(Math.random() * sampleTranslations.length)];
    setTranslatedText((prev) => (prev ? prev + " " + random : random));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white">
                <FiUser />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Dr. Profile
                </p>
                <p className="text-xs text-gray-500">Doctor</p>
              </div>
            </div>
            <button
              className="lg:hidden text-gray-500 cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-teal-50 text-teal-700 font-medium cursor-pointer"
            >
              <FiVideo size={18} />
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/patient-registration");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <FiUserPlus size={18} />
              Register Patient
            </button>
            <button
              onClick={() => {
                navigate("/profile");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <FiUser size={18} />
              My Profile
            </button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-600 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={22} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              Doctor Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-500">
              Bangla Sign Language Translator
            </span>
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm">
              <FiUser />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Video Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Sign Language Recognition
                  </h2>
                  <p className="text-sm text-gray-500">
                    Point camera at the patient to translate sign language
                  </p>
                </div>
                <div className="flex gap-2">
                  {cameraOn ? (
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm cursor-pointer"
                    >
                      <FiVideoOff size={16} /> Stop Camera
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition text-sm cursor-pointer"
                    >
                      <FiVideo size={16} /> Start Camera
                    </button>
                  )}
                  <button
                    onClick={handleDetect}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm cursor-pointer"
                  >
                    <FiRefreshCw size={16} /> Detect
                  </button>
                </div>
              </div>

              {/* Video Area */}
              <div className="relative bg-gray-900 aspect-video max-h-[420px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <FiVideoOff size={48} className="mb-3" />
                    <p className="text-lg">Camera is off</p>
                    <p className="text-sm mt-1">
                      Click "Start Camera" to begin
                    </p>
                  </div>
                )}
                {cameraOn && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
            </div>

            {/* Text + Audio Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Translated Text Box */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Translated Text
                  </h2>
                  <button
                    onClick={() => setTranslatedText("")}
                    className="text-sm text-gray-500 hover:text-red-500 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-gray-700"
                  placeholder="Translated Bangla sign language text will appear here..."
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                />
              </div>

              {/* Audio Controls */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">Audio</h2>
                <p className="text-sm text-gray-500 text-center">
                  Convert translated text to speech
                </p>
                <button
                  onClick={handleSpeak}
                  className="w-20 h-20 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <FiVolume2 size={32} />
                </button>
                <p className="text-xs text-gray-400">Tap to speak</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

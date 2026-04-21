// Real-time Bangla sign language recognition dashboard with camera and WebSocket
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiVideo, FiVideoOff, FiVolume2, FiMenu, FiX, FiLogOut, FiUserPlus, FiUsers, FiRefreshCw } from "react-icons/fi";
import useSignLanguagePrediction from "../huggingface/useSignLanguagePrediction";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translationActive, setTranslationActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // WebSocket hook for real-time sign language prediction
  const { predictions, connected, error, startPrediction, sendFrame, stopPrediction } = useSignLanguagePrediction();

  const getCameraPermissionMessage = (err) => {
    if (!err) return "Unable to access camera.";
    if (err.name === "NotAllowedError") {
      return "Camera permission is blocked. Click the lock icon in the browser address bar, allow camera access for this site, then retry.";
    }
    if (err.name === "NotFoundError") {
      return "No camera device was found. Connect a camera and retry.";
    }
    if (err.name === "NotReadableError") {
      return "Camera is already in use by another app. Close that app and retry.";
    }
    return "Unable to access camera. Please allow camera permissions and retry.";
  };

  // Initialize camera stream on user request
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraOn(true);
      return true;
    } catch (err) {
      const message = getCameraPermissionMessage(err);
      setCameraError(message);
      alert(message);
      return false;
    }
  }, []);

  // Cleanup camera stream and stop WebSocket
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    stopPrediction();
    setTranslationActive(false);
    setCameraOn(false);
  }, [stopPrediction]);

  // Capture frame from video stream and encode as JPEG for transmission
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = 224;
    canvas.height = 224;
    context.drawImage(videoRef.current, 0, 0, 224, 224);
    return canvas.toDataURL("image/jpeg");
  }, []);

  // Start live translation session with camera and WebSocket
  const startTranslation = useCallback(async () => {
    const hasCamera = cameraOn || await startCamera();
    if (!hasCamera) {
      setTranslationActive(false);
      return;
    }
    setTranslatedText("");
    setCameraError("");
    const connectedToBackend = await startPrediction();
    if (connectedToBackend) {
      setTranslationActive(true);
    }
  }, [cameraOn, startCamera, startPrediction]);

  // Stop translation and cleanup resources
  const stopTranslation = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    stopPrediction();
    setTranslationActive(false);
  }, [stopPrediction]);

  // Update translated text when backend sends new prediction
  useEffect(() => {
    if (predictions?.status === "success" && predictions?.prediction) {
      setTranslatedText(predictions.prediction);
    }
  }, [predictions]);

  useEffect(() => {
    if (error && translationActive) {
      setTranslationActive(false);
    }
  }, [error, translationActive]);

  // Send frames at regular intervals when translation is active and connected
  useEffect(() => {
    if (!translationActive || !connected) return undefined;
    captureIntervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) sendFrame(frame);
    }, 120);
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [captureFrame, connected, sendFrame, translationActive]);

  // Cleanup all resources on component unmount
  useEffect(() => {
    return () => {
      stopTranslation();
      stopCamera();
    };
  }, [stopCamera, stopTranslation]);

  // Convert translated text to speech using Text-to-Speech API
  const handleSpeak = () => {
    if (!translatedText.trim() || isSpeaking) {
      alert("No text to speak. Please start translation first.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = "bn-BD";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Clear authentication and return to login page
  const handleLogout = () => {
    stopTranslation();
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Helper to close sidebar and navigate
  const navToPage = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const audioReady = translatedText.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white">
                <FiUser />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Dr. Profile</p>
                <p className="text-xs text-gray-500">Doctor</p>
              </div>
            </div>
            <button className="lg:hidden text-gray-500 cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-teal-50 text-teal-700 font-medium cursor-pointer">
              <FiVideo size={18} /> Dashboard
            </button>
            <button onClick={() => navToPage("/patient-registration")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer">
              <FiUserPlus size={18} /> Register Patient
            </button>
            <button onClick={() => navToPage("/patients")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer">
              <FiUsers size={18} /> Patient List
            </button>
            <button onClick={() => navToPage("/profile")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer">
              <FiUser size={18} /> My Profile
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer">
              <FiLogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600 cursor-pointer" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={22} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Doctor Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-500">Bangla Sign Language Translator</span>
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm">
              <FiUser />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Camera Feed Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Sign Language Recognition</h2>
                  <p className="text-sm text-gray-500">Stream camera frames to recognize Bangla signs in real-time</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={cameraOn ? stopCamera : startCamera} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm cursor-pointer ${cameraOn ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-teal-100 text-teal-700 hover:bg-teal-200"}`}>
                    {cameraOn ? <FiVideoOff size={16} /> : <FiVideo size={16} />} {cameraOn ? "Stop Camera" : "Start Camera"}
                  </button>
                  <button onClick={translationActive ? stopTranslation : startTranslation} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm cursor-pointer ${translationActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>
                    <FiRefreshCw size={16} /> {translationActive ? "Stop Translation" : "Start Translation"}
                  </button>
                </div>
              </div>

              {cameraError && (
                <div className="mx-4 sm:mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {cameraError}
                </div>
              )}

              {error && (
                <div className="mx-4 sm:mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Backend prediction connection failed. Make sure backend is running, then click Start Translation again.
                </div>
              )}

              <div className="relative bg-gray-900 aspect-video max-h-[420px]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <FiVideoOff size={48} className="mb-3" />
                    <p className="text-lg">Camera is off</p>
                    <p className="text-sm mt-1">Click Start Camera to begin</p>
                  </div>
                )}
                {cameraOn && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
                  </div>
                )}
              </div>
            </div>

            {/* Translation Output and Audio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">Translated Text</h2>
                  <button onClick={() => setTranslatedText("")} className="text-sm text-gray-500 hover:text-red-500 cursor-pointer">
                    Clear
                  </button>
                </div>
                <textarea rows={5} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-gray-700" placeholder="Translated signs will appear here..." value={translatedText} onChange={(e) => setTranslatedText(e.target.value)} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">Audio Output</h2>
                <p className="text-sm text-gray-500 text-center">Convert text to Bengali speech</p>
                <p className="text-xs text-gray-500 text-center">
                  {audioReady ? "Text ready" : "Waiting for text"}
                </p>
                <button onClick={handleSpeak} disabled={!audioReady || isSpeaking} className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${audioReady && !isSpeaking ? "bg-teal-600 hover:bg-teal-700 hover:scale-105" : "bg-gray-300"}`}>
                  <FiVolume2 size={32} />
                </button>
                <p className="text-xs text-gray-400">
                  {isSpeaking ? "Speaking..." : "Tap to speak"}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

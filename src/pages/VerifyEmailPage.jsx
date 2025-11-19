import React, { useState, useEffect, useRef } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { useFlash } from "../context/FlashContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const VerifyOtpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setFlashMessage } = useFlash();
  const location = useLocation();
  const userEmail = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // Autofocus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // Auto-verify when all 6 digits entered
    if (newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split("");
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[nextIndex]?.focus();
    if (pastedData.length === 6) handleVerifyOtp(pastedData);
  };

  const handleVerifyOtp = async (manualOtp) => {
    const otpValue = typeof manualOtp === "string" ? manualOtp : otp.join("");
    if (otpValue.length !== 6) return setError("Enter 6-digit OTP!");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp: otpValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        dispatch(login({ user: data.user, token: data.token }));
        setFlashMessage("✅ Email verified successfully!", "success");
        setTimeout(() => navigate("/chat", { replace: true }), 1200);
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setError("⚠️ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setResendStatus("Resending OTP...");
    try {
      const response = await fetch("http://localhost:5000/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setResendStatus("✅ OTP resent successfully!");
        setFlashMessage(data.message || "OTP resent successfully!", "success");
        setCountdown(30); // ⏱ 30 seconds cooldown
      } else {
        setResendStatus("❌ " + (data.error || "Failed to resend OTP"));
      }
    } catch {
      setResendStatus("⚠️ Network error");
    } finally {
      setTimeout(() => setResendStatus(""), 4000);
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
      >
        {/* Success animation overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-md z-20"
            >
              <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              <p className="text-lg font-semibold mt-2 text-green-700">
                Email Verified!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">We sent a 6-digit code to</p>
          <p className="text-gray-800 font-semibold">{userEmail}</p>
        </div>

        {/* OTP Inputs */}
        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                whileFocus={{ scale: 1.1 }}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-600 outline-none transition text-black placeholder-gray-400"
              />
            ))}
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerifyOtp()}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold transition ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" /> Verifying...
              </span>
            ) : (
              "Verify & Sign In"
            )}
          </button>
        </div>

        {/* Resend Section */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-600 text-sm">Didn’t receive a code?</p>
          <button
            onClick={handleResendCode}
            disabled={resending || countdown > 0}
            className={`font-semibold flex items-center justify-center gap-2 mx-auto transition ${
              resending || countdown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-green-600 hover:underline"
            }`}
          >
            {resending ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Resending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Code"
            )}
          </button>

          {resendStatus && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-medium ${
                resendStatus.includes("✅")
                  ? "text-green-600"
                  : "text-gray-700"
              }`}
            >
              {resendStatus}
            </motion.p>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/signin")}
          className="w-full text-gray-500 mt-6 hover:text-gray-700 transition"
        >
          ← Back to Sign In
        </button>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;

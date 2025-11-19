import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock, Loader2, CheckCircle } from "lucide-react";
import { useFlash } from "../context/FlashContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URI || "http://127.0.0.1:5000";

const ForgotPasswordFlow = () => {
  const { setFlashMessage } = useFlash();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // --- Step 1: Send OTP ---
  const handleSendOtp = async () => {
    if (!email) return setFlashMessage("⚠️ Enter your registered email.", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlashMessage("✅ OTP sent successfully to your email!", "success");
        setStep(2);
        setCountdown(30);
      } else {
        setFlashMessage(data.error || "Failed to send OTP.", "error");
      }
    } catch {
      setFlashMessage("⚠️ Server error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6)
      return setFlashMessage("⚠️ Enter the 6-digit OTP.", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlashMessage("✅ OTP verified successfully!", "success");
        setStep(3);
      } else {
        setFlashMessage(data.error || "Invalid OTP.", "error");
      }
    } catch {
      setFlashMessage("⚠️ Server error. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async () => {
    const otpValue = otp.join("");

    if (!newPassword || !confirmPassword)
      return setFlashMessage("⚠️ Fill in both password fields.", "error");

    if (newPassword !== confirmPassword)
      return setFlashMessage("⚠️ Passwords do not match.", "error");

    if (newPassword.length < 6)
      return setFlashMessage("⚠️ Password must be at least 6 characters long.", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpValue,
          new_password: newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.same_password) {
          setFlashMessage("⚠️ New password cannot be same as the old password.", "error");
        } else {
          setFlashMessage("✅ Password reset successful! Please sign in.", "success");
          setSuccess(true);
          setTimeout(() => navigate("/signin", { replace: true }), 1500);
        }
      } else {
        setFlashMessage(data.error || "Password reset failed.", "error");
      }
    } catch {
      setFlashMessage("⚠️ Server error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setCountdown(30);
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlashMessage("✅ OTP resent successfully!", "success");
      } else {
        setFlashMessage(data.error || "Failed to resend OTP.", "error");
      }
    } catch {
      setFlashMessage("⚠️ Network error. Try again later.", "error");
    }
  };

  // --- OTP Input Handler ---
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
      >
        {/* Success Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-20"
            >
              <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              <p className="text-green-700 font-semibold mt-2 text-lg">
                Password Reset Successful!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Forgot Password
        </h2>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full ${
                s <= step ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Email */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col items-center">
                <Mail className="w-10 h-10 text-blue-500 mb-4" />
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4 outline-none text-gray-800"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" /> Sending OTP...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col items-center">
                <KeyRound className="w-10 h-10 text-green-500 mb-4" />
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      maxLength="1"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-10 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-blue-600 outline-none"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" /> Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
                <div className="text-center mt-3">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in {countdown}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col items-center">
                <Lock className="w-10 h-10 text-purple-500 mb-4" />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-3 outline-none text-gray-800"
                />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4 outline-none text-gray-800"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" /> Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => navigate("/signin")}
          className="w-full text-gray-500 mt-6 hover:text-gray-700 transition text-sm"
        >
          ← Back to Sign In
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordFlow;

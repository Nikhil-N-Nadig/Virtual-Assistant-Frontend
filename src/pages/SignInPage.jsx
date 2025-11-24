import React, { useState } from 'react';
import { ShoppingBag, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { login } from '../store/authSlice';
import { useFlash } from "../context/FlashContext";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URI || "http://127.0.0.1:5000";

const SignInPage = () => {
  const dispatch = useDispatch();
  const { setFlashMessage } = useFlash();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);


  // Redirect if already logged in
  const { status } = useSelector((state) => state.auth);



  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateSignIn = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateSignIn()) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/signin`,
        formData,
        { withCredentials: true }
      );
      console.log("Response data: ",response)
      const { user } = response.data;

      const token=user.auth_token
      console.log("User: ",user);
      console.log("Token: ",token)


      dispatch(login({ user, token }));
      // console.log("Redux after login:", store.getState().auth);
      console.log("User logged in:", user, token);
      setFlashMessage("✅ Login successful!", "success");

      // Wait a tiny bit to ensure Redux updates before routing
      setTimeout(() => navigate("/chat", { replace: true }), 200);


    }  catch (error) {
  console.error("Signin error full:", error);
      const data = error.response?.data;

    // ⚠️ If account not verified → OTP sent → move to verify page
    if (error.response?.status === 403 && data?.requires_verification) {
      setFlashMessage(data.message || "Please verify your email.", "info");

      // ✅ Pass email through router state
      navigate("/verify", { state: { email: data.email } });
      return;
    }
  console.log("Error response:", error.response?.data);
  setFlashMessage(
    error.response?.data?.error?.toString() || error.message || "⚠️ Server error",
    "error"
  );
}
 finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSignIn();
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform hover:scale-[1.02] transition-all duration-300">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue shopping</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-black placeholder-gray-400"
                  placeholder="john@example.com"
              />

            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-black placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" 
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-600 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:scale-[1.02]"}`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full text-gray-500 mt-4 hover:text-gray-700 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
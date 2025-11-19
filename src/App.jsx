import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ChatInterface from "./pages/ChatInterface";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ForgotPasswordFlow } from "./pages";
import SavedReminders from "./pages/SavedReminders";

function App() {
  const { userData } = useSelector((state) => state.auth);
  const emailForOTP = userData?.email;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/verify" element={<VerifyEmailPage userEmail={emailForOTP} />} />
      <Route path="/forgot-password" element={<ForgotPasswordFlow />} />


      {/* Protected Routes */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatInterface />
          </ProtectedRoute>
        }
      />

      // App.jsx or routes
      <Route path="/reminders" element={<SavedReminders userId={userData?.id} />} />


      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

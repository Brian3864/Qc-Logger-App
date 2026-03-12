
// src/Root.jsx
import React from "react";
import { useAuth } from "./AuthContext";
import LoginPage from "./components/LoginPage";
import App from "./App";


export default function Root() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;
  if (!user) return <LoginPage />;

  return <App user={user} onLogout={logout} />;
}
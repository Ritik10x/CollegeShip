import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
export default function AdminRoute() {
  const { isAdmin, isAuthLoading } = useUser();
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        {" "}
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>{" "}
      </div>
    );
  }
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaSignOutAlt,
  FaChevronLeft,
  FaCompass,
  FaBars,
  FaTimes,
  FaStar,
  FaLink,
  FaClipboardList,
} from "react-icons/fa";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Navbar from "./Navbar";
export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <>
      {" "}
      <Navbar suppressMobileNav />{" "}
      <div className="flex h-screen overflow-hidden glass-section pt-[65px] sm:pt-24">
        {" "}
        {/* Sidebar */}{" "}
        <aside className="hidden md:flex w-64 shrink-0 flex-col glass-sidebar border-r border-brand-border overflow-y-auto">
          {" "}
          <div className="p-6 border-b border-brand-border">
            {" "}
            <NavLink to="/" className="flex items-center gap-2">
              {" "}
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                {" "}
                <span className="text-white font-bold text-lg">C</span>{" "}
              </div>{" "}
              <span className="font-bold text-xl tracking-tight text-[#0D0D12]">
                Admin Panel
              </span>{" "}
            </NavLink>{" "}
          </div>{" "}
          <div className="flex-1 overflow-y-auto py-6">
            {" "}
            <nav className="space-y-1 px-4">
              {" "}
              <NavLink
                to="/explore"
                className="flex items-center gap-3 px-4 py-3 rounded-card font-medium text-text-muted hover:bg-brand-bg/80 transition-colors duration-200 transition-all"
              >
                {" "}
                <FaCompass /> Explore Colleges{" "}
              </NavLink>{" "}
              <NavLink
                to="/admin/colleges"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                }
              >
                {" "}
                <FaUniversity /> Colleges{" "}
              </NavLink>{" "}
              <NavLink
                to="/admin/reviews"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                }
              >
                {" "}
                <FaStar /> Showcase Reviews{" "}
              </NavLink>{" "}
              <NavLink
                to="/admin/college-reviews"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                }
              >
                {" "}
                <FaStar /> College Reviews{" "}
              </NavLink>{" "}
              <NavLink
                to="/admin/applications"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                }
              >
                {" "}
                <FaClipboardList /> Applications{" "}
              </NavLink>{" "}
              <NavLink
                to="/admin/footer"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                }
              >
                {" "}
                <FaLink /> Footer Settings{" "}
              </NavLink>{" "}
            </nav>{" "}
          </div>{" "}
        </aside>{" "}
        {/* Sidebar Drawer for Mobile */}{" "}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 bottom-0 top-[65px] z-40 flex md:hidden">
            {" "}
            {/* Backdrop */}{" "}
            <div
              className="fixed inset-0 glass-overlay transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            ></div>{" "}
            {/* Drawer content */}{" "}
            <div className="relative flex-1 flex flex-col max-w-xs w-full glass-sidebar shadow-glass-lg animate-in slide-in-from-left duration-200">
              {" "}
              <div className="p-6 border-b border-brand-border flex justify-between items-center">
                {" "}
                <NavLink
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {" "}
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    {" "}
                    <span className="text-white font-bold text-lg">C</span>{" "}
                  </div>{" "}
                  <span className="font-bold text-xl tracking-tight text-[#0D0D12]">
                    Admin Panel
                  </span>{" "}
                </NavLink>{" "}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-card text-text-muted hover:bg-brand-bg hover:text-text-main"
                  aria-label="Close admin menu"
                >
                  {" "}
                  <FaTimes size={20} />{" "}
                </button>{" "}
              </div>{" "}
              <div className="flex-1 overflow-y-auto py-6">
                {" "}
                <nav className="space-y-1 px-4">
                  {" "}
                  <NavLink
                    to="/explore"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-card font-medium text-text-muted hover:bg-brand-bg/80 transition-colors duration-200 transition-all"
                  >
                    {" "}
                    <FaCompass /> Explore Colleges{" "}
                  </NavLink>{" "}
                  <NavLink
                    to="/admin/colleges"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                    }
                  >
                    {" "}
                    <FaUniversity /> Colleges{" "}
                  </NavLink>{" "}
                  <NavLink
                    to="/admin/reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                    }
                  >
                    {" "}
                    <FaStar /> Showcase Reviews{" "}
                  </NavLink>{" "}
                  <NavLink
                    to="/admin/college-reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                    }
                  >
                    {" "}
                    <FaStar /> College Reviews{" "}
                  </NavLink>{" "}
                  <NavLink
                    to="/admin/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                    }
                  >
                    {" "}
                    <FaClipboardList /> Applications{" "}
                  </NavLink>{" "}
                  <NavLink
                    to="/admin/footer"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-card font-medium transition-all ${isActive ? "bg-brand-bg text-primary" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`
                    }
                  >
                    {" "}
                    <FaLink /> Footer Settings{" "}
                  </NavLink>{" "}
                </nav>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {/* Main Content */}{" "}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {" "}
          <header className="glass-nav border-b border-white/50 h-16 flex items-center justify-between px-4 sm:px-6 md:hidden">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 min-w-[44px] min-h-[44px] -ml-2 text-text-muted hover:text-[#0D0D12] rounded-lg hover:bg-brand-bg/80 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {" "}
                <FaBars size={20} />{" "}
              </button>{" "}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-text-muted hover:text-[#0D0D12]"
              >
                {" "}
                <FaChevronLeft className="w-3.5 h-3.5" />{" "}
                <span className="text-xs font-semibold">Back</span>{" "}
              </button>{" "}
            </div>{" "}
            <span className="font-bold text-lg tracking-tight text-[#0D0D12]">
              Admin Panel
            </span>{" "}
            <button
              onClick={handleLogout}
              className="text-[#B3261E] p-2 hover:bg-[#B3261E]/10 rounded-lg"
              title="Logout"
            >
              {" "}
              <FaSignOutAlt size={18} />{" "}
            </button>{" "}
          </header>{" "}
          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
            {" "}
            <Outlet />{" "}
          </main>{" "}
        </div>{" "}
      </div>{" "}
    </>
  );
}

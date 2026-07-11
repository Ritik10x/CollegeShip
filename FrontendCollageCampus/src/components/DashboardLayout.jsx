import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaHome,
  FaFileAlt,
  FaHeart,
  FaCompass,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import { useUser } from "../context/UserContext";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAdmin } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);
      navigate('/', { replace: true });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'Home', isExternal: true },
    { path: '/dashboard/applications', icon: <FaFileAlt />, label: 'Applications' },
    { path: '/dashboard/favorites', icon: <FaHeart />, label: 'Favorites' },
    { path: '/explore', icon: <FaCompass />, label: 'Explore', isExternal: true },
  ];

  return (
    <>
      <Navbar suppressMobileNav />
      <div className="flex min-h-screen glass-section pt-[65px] sm:pt-24">
        <button className="md:hidden p-2.5 min-w-[44px] min-h-[44px] fixed top-[76px] left-4 z-40 rounded-card glass-chip text-text-muted hover:text-[#0D0D12]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle dashboard sidebar">
          {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 glass-overlay z-30 md:hidden" onClick={() => setMobileOpen(false)}></div>
        )}
        <aside ref={sidebarRef} className={`w-64 max-w-[85vw] bg-white border-r border-border-subtle flex flex-col fixed top-[65px] sm:top-24 md:sticky md:top-24 h-[calc(100vh-65px)] sm:h-[calc(100vh-6rem)] transition-transform duration-200 z-40 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <Link to="/dashboard" className="p-8 flex items-center gap-3 hover:bg-brand-bg/80 transition-all duration-150 ease-in-out group">
            <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center text-white font-black text-2xl shadow-card transition-transform duration-300 group-hover:-translate-y-[1px] active:scale-[0.98] shrink-0">
              D
            </div>
            <div>
              <h1 className="font-black text-xl text-[#0D0D12] leading-tight tracking-tight">Dashboard</h1>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-0.5">Student Portal</p>
            </div>
          </Link>
          <nav className="mt-4 flex-1 px-4 space-y-2">
            {menuItems.map((item) => (
              item.isExternal ? (
                <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-card transition-all duration-200 group text-text-muted hover:bg-brand-bg/80 hover:text-[#0D0D12]">
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ) : (
                <NavLink key={item.path} to={item.path} end={item.path === '/dashboard'} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-card transition-all duration-200 group ${isActive ? 'bg-brand-bg text-primary font-semibold shadow-card shadow-brand-bg' : 'text-text-muted hover:bg-brand-bg/80 hover:text-[#0D0D12]'}`}>
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              )
            ))}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-border-subtle">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-4 mb-2">Admin</p>
                <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-card transition-all duration-200 bg-brand-bg text-accent font-semibold hover:bg-[#A8813E] shadow-card">
                  <span className="text-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <span className="text-sm">Admin Panel</span>
                </Link>
              </div>
            )}
          </nav>
          <div className="mt-auto border-t border-border-subtle p-4 md:hidden">
            <Link
              to="/dashboard/settings"
              onClick={() => setMobileOpen(false)}
              className="mb-2 flex min-h-[44px] items-center gap-3 rounded-card px-4 py-3 text-sm text-text-muted hover:bg-brand-bg/80"
            >
              Account Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex w-full min-h-[44px] items-center gap-3 rounded-card px-4 py-3 text-sm font-semibold text-[#B3261E] hover:bg-[#B3261E]/10"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="hidden">
            <div></div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-bg text-primary rounded-card font-bold text-sm hover:bg-brand-bg/80 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
                </svg>
                Dashboard
              </Link>
              <div className="relative">
                <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 bg-brand-bg px-3 py-1.5 rounded-full border border-brand-bg cursor-pointer hover:bg-brand-bg/80 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    {user?.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <FaChevronDown className={`text-brand-bg text-[10px] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-dropdown py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-[#0D0D12] truncate">{user?.displayName || 'Student'}</p>
                      <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="w-full text-left px-4 py-2 text-xs font-bold text-accent hover:bg-brand-bg/80 flex items-center gap-2 transition-colors border-b border-gray-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-[#B3261E] hover:bg-[#B3261E]/10 flex items-center gap-2 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto w-full flex-1 pt-[4.5rem] sm:pt-16 md:pt-0 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

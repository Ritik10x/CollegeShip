import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTrophy,
  FaUser,
  FaPhoneAlt,
  FaChevronDown,
  FaUserPlus,
  FaStar,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { FIELD_LIMITS } from "../lib/fieldLimits";

export const openAuthModal = (view = "login") => {
  window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { view } }));
};

export default function AuthModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    educationLevel: "",
    academicInterest: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => {
      setView(e.detail.view || "login");
      setIsOpen(true);
      setError("");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        educationLevel: "",
        academicInterest: "",
      });
    };
    window.addEventListener("open-auth-modal", handleOpen);
    return () => window.removeEventListener("open-auth-modal", handleOpen);
  }, []);

  if (!isOpen) return null;

  const authErrorMessage = (err) => {
    const msgMap = {
      "auth/email-already-in-use": "This email is already registered.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/unauthorized-domain": "This site domain is not authorized for Google sign-in yet. Please use email/password for now.",
      "auth/operation-not-allowed": "This sign-in provider is not enabled in Firebase Authentication.",
      "auth/popup-closed-by-user": "Sign-in was cancelled before it finished.",
      "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups and try again.",
    };
    return msgMap[err.code] || err.message;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(val)) {
      setFormData({ ...formData, [e.target.name]: val });
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (view === "signup") {
      if (!formData.firstName.trim()) {
        setError("First name is required.");
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
        setError("First name must contain letters only — no numbers or symbols.");
        return;
      }
      if (formData.lastName && !/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
        setError("Last name must contain letters only — no numbers or symbols.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address (e.g. name@example.com).");
        return;
      }
      if (!/^\d{10}$/.test(formData.phone)) {
        setError("Phone number must be exactly 10 digits — no letters or symbols.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }
    setLoading(true);
    try {
      if (view === "login") {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const displayName = `${formData.firstName} ${formData.lastName}`.trim();
        const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(credential.user, { displayName });
      }
      window.dispatchEvent(new Event("auth-change"));
      setIsOpen(false);
      navigate("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      window.dispatchEvent(new Event("auth-change"));
      setIsOpen(false);
      navigate("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center glass-overlay p-3 sm:p-4 overflow-y-auto">
      <div
        className={`bg-white border border-brand-border rounded-card shadow-glass-lg w-full max-h-[92vh] overflow-y-auto ${view === "signup" ? "max-w-[480px]" : "max-w-[420px]"} relative flex flex-col my-4 sm:my-auto transition-all duration-150 ease-in-out`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-text-muted hover:text-text-main transition p-2 min-w-[44px] min-h-[44px] z-10 bg-white border border-brand-border rounded-full flex items-center justify-center shadow-card"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-5 sm:p-8 pt-8 sm:pt-10 flex-1">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-[#B3261E] text-[#B3261E] text-xs rounded-card text-center font-medium">
              {error}
            </div>
          )}
          {view === "login" ? (
            <>
              {/* LOGIN HEADER */}
              <div className="text-center mb-8">
                <div className="w-10 h-10 bg-brand-bg rounded-card flex items-center justify-center mx-auto mb-4 border border-brand-bg">
                  <FaGraduationCap className="text-primary text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-[#0D0D12] mb-2">Welcome Back</h2>
                <p className="text-xs text-text-muted">Please enter your details to sign in to your account.</p>
              </div>
              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-text-main mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaEnvelope className="text-text-muted text-sm" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      maxLength={FIELD_LIMITS.email}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-border rounded-card text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-text-main">Password</label>
                    <a href="#" className="text-[10px] font-bold text-primary hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaLock className="text-text-muted text-sm" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      maxLength={FIELD_LIMITS.password}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-brand-border rounded-card text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400 tracking-wider"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-muted"
                    >
                      {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-primary text-white font-semibold py-3 rounded-card flex items-center justify-center gap-2 hover:bg-[#0D0D12] transition-colors duration-200 disabled:opacity-70 text-sm"
                >
                  {loading ? "Processing..." : "Sign In"}
                  {!loading && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </form>
              {/* SOCIAL LOGINS */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-border" />
                  </div>
                  <span className="relative bg-white px-3 text-[9px] font-bold tracking-widest text-text-muted uppercase">
                    Or Continue With
                  </span>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSocialLogin}
                    className="flex w-full items-center justify-center gap-2 py-2.5 border border-brand-border rounded-card hover:bg-brand-bg/80 transition-colors duration-200"
                  >
                    <FcGoogle className="text-lg" />
                    <span className="text-xs font-bold text-text-main">Continue with Google</span>
                  </button>
                </div>
              </div>
              <p className="text-center mt-6 text-xs text-text-muted">
                Don't have an account?{' '}
                <button onClick={() => setView('signup')} className="font-bold text-primary hover:underline">
                  Sign up for free
                </button>
              </p>
            </>
          ) : (
            <>
              {/* SIGNUP HEADER */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-8 h-8 bg-brand-bg rounded-card flex items-center justify-center border border-brand-bg shadow-card">
                  <FaTrophy className="text-primary text-sm" />
                </div>
                <h2 className="text-[22px] font-bold text-[#0D0D12]">Join CollegeShip</h2>
              </div>
              <p className="text-[11px] text-text-muted text-center mb-6 leading-relaxed px-4">
                Create your student account to unlock reviews, save favorites, and apply.
              </p>
              {/* SIGNUP FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-text-main mb-1.5">
                      First Name <span className="text-[#B3261E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-text-muted text-xs" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        required
                        maxLength={FIELD_LIMITS.firstName}
                        value={formData.firstName}
                        onChange={handleNameChange}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-brand-border rounded-card text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-main mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-text-muted text-xs" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        maxLength={FIELD_LIMITS.lastName}
                        value={formData.lastName}
                        onChange={handleNameChange}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-brand-border rounded-card text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-text-main mb-1.5">
                    Email Address <span className="text-[#B3261E]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-text-muted text-xs" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      maxLength={FIELD_LIMITS.email}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-brand-border rounded-card text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-bold text-text-main mb-1.5">
                    Phone Number <span className="text-[#B3261E]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-brand-bg border border-brand-border rounded-card px-3 py-2 text-xs font-bold text-text-main shrink-0 select-none">
                      🇮🇳 +91
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhoneAlt className="text-text-muted text-xs" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-brand-border rounded-card text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                </div>
                {/* Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-text-main mb-1.5">
                      Password <span className="text-[#B3261E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-text-muted text-xs" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        maxLength={FIELD_LIMITS.password}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-8 pr-8 py-2 bg-white border border-brand-border rounded-card text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400 tracking-widest"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-muted"
                      >
                        {showPassword ? <FaEyeSlash className="text-[10px]" /> : <FaEye className="text-[10px]" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-main mb-1.5">
                      Confirm <span className="text-[#B3261E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-text-muted text-xs" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        maxLength={FIELD_LIMITS.password}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-8 pr-8 py-2 bg-white border border-brand-border rounded-card text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition placeholder-gray-400 tracking-widest"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-muted"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-[10px]" /> : <FaEye className="text-[10px]" />}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Dropdowns */}
                <div>
                  <label className="block text-[11px] font-bold text-text-main mb-1.5">
                    Current Education Level <span className="text-[#B3261E]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="educationLevel"
                      required
                      value={formData.educationLevel}
                      onChange={handleChange}
                      className="w-full appearance-none bg-white border border-brand-border rounded-card py-2.5 pl-3 pr-8 text-xs text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>
                        Select your current level
                      </option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-main mb-1.5">
                    Academic Interest <span className="text-[#B3261E]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="academicInterest"
                      required
                      value={formData.academicInterest}
                      onChange={handleChange}
                      className="w-full appearance-none bg-white border border-brand-border rounded-card py-2.5 pl-3 pr-8 text-xs text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>
                        Select your interests
                      </option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medical">Medical</option>
                      <option value="Business">Business</option>
                      <option value="Arts">Arts</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px] pointer-events-none" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-primary text-white font-bold py-3 rounded-card flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-70 text-xs"
                >
                  {loading ? "Processing..." : "Create Account"}
                  {!loading && <FaUserPlus className="text-[13px]" />}
                </button>
              </form>
              <p className="text-center mt-5 text-[11px] text-text-muted">
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="font-bold text-primary hover:underline">
                  Sign in here
                </button>
              </p>
            </>
          )}
        </div>
        {/* Footer Area */}
        <div className="bg-[#F8F9FB] border-t border-border-subtle p-5 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="user" />
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="user" />
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="user" />
            </div>
            <span className="text-[9px] font-bold tracking-widest text-text-muted uppercase">
              {view === "login" ? "Join 10k+ Learners" : "Join 10k+ Students"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="text-accent text-xs" />
            <span className="text-xs font-bold text-[#0D0D12]">4.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}

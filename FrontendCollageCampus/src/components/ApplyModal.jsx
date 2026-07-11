import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaUniversity,
  FaTimes,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { openAuthModal } from "./AuthModal";
import { apiUrl } from "../lib/api";
import { FIELD_LIMITS } from "../lib/fieldLimits";
export default function ApplyModal() {
  const {
    isApplyModalOpen,
    closeApplyModal,
    selectedCollegeForApply,
    showToast,
  } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    course: "",
  });
  useEffect(() => {
    if (isApplyModalOpen) {
      const user = auth.currentUser;
      const initialCourse = selectedCollegeForApply?.courses?.[0];
      const initialCourseName =
        typeof initialCourse === "string"
          ? initialCourse
          : initialCourse?.name || "";
      const nameParts = (user?.displayName || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: user?.email || "",
        phone: "",
        age: "",
        course: initialCourseName || "General Inquiry",
      });
    }
  }, [isApplyModalOpen, selectedCollegeForApply]);
  if (!isApplyModalOpen) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === "firstName" || name === "lastName") {
      /* Only letters and spaces allowed, max 12 chars */ sanitizedValue = value
        .replace(/[^a-zA-Z\s]/g, "")
        .slice(0, 12);
    } else if (name === "phone") {
      /* Only up to 10 digits allowed */ sanitizedValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    } else if (name === "age") {
      /* Only up to 2 digits allowed */ sanitizedValue = value
        .replace(/\D/g, "")
        .slice(0, 2);
    }
    setFormData({ ...formData, [name]: sanitizedValue });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      showToast("Please login to apply", "error");
      closeApplyModal();
      openAuthModal("login");
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(apiUrl("/api/applications/apply"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          userName: `${formData.firstName} ${formData.lastName}`.trim(),
          userEmail: formData.email,
          userPhone: `+91 ${formData.phone}`,
          userAge: formData.age,
          course: formData.course,
          universityId: selectedCollegeForApply?._id || "manual",
          universityName: selectedCollegeForApply?.name || "N/A",
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast(
          data.emailSent
            ? "Application submitted successfully! Check your email."
            : "Application submitted successfully!",
          "success",
        );
        closeApplyModal();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      showToast(err.message || "Failed to submit application", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-start sm:items-center justify-center glass-overlay p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-brand-border rounded-card shadow-glass-lg w-full max-w-lg max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-300 my-4 sm:my-auto">
        <div className="bg-primary p-5 sm:p-8 text-white relative">
          <button
            onClick={closeApplyModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close apply form"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="flex items-center gap-4 mb-2 pr-12">
            <div className="w-12 h-12 shrink-0 bg-white/20 rounded-card flex items-center justify-center backdrop-blur-md">
              <FaUniversity className="text-2xl" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold">Apply Now</h2>
              <p className="text-[#f0f5fc] text-sm opacity-90 truncate">
                {selectedCollegeForApply?.name}
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
          {" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {" "}
            {/* First Name */}{" "}
            <div>
              {" "}
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                First Name
              </label>{" "}
              <div className="relative">
                {" "}
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />{" "}
                <input
                  type="text"
                  name="firstName"
                  required
                  maxLength={12}
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="First name"
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Last Name */}{" "}
            <div>
              {" "}
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Last Name
              </label>{" "}
              <div className="relative">
                {" "}
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />{" "}
                <input
                  type="text"
                  name="lastName"
                  required
                  maxLength={12}
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                  placeholder="Last name"
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {" "}
            {/* Email */}{" "}
            <div>
              {" "}
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Email Address
              </label>{" "}
              <div className="relative">
                {" "}
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />{" "}
                <input
                  type="email"
                  name="email"
                  required
                  readOnly
                  value={formData.email}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm text-text-muted cursor-not-allowed outline-none"
                  placeholder="email@example.com"
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Age */}{" "}
            <div>
              {" "}
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Age
              </label>{" "}
              <div className="relative">
                {" "}
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />{" "}
                <input
                  type="text"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                  placeholder="Your age"
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {" "}
            {/* Phone */}{" "}
            <div>
              {" "}
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Phone Number
              </label>{" "}
              <div className="relative flex">
                {" "}
                <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-border-subtle bg-white text-text-muted sm:text-sm font-bold">
                  {" "}
                  +91{" "}
                </span>{" "}
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 bg-white border border-border-subtle rounded-r-2xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                  placeholder="10-digit number"
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Course Selection */}{" "}
            <div>
              {" "}
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Select Course
              </label>{" "}
              <select
                name="course"
                required
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none"
              >
                {" "}
                <option value="" disabled>
                  Select a course
                </option>{" "}
                {selectedCollegeForApply?.courses &&
                selectedCollegeForApply.courses.length > 0 ? (
                  selectedCollegeForApply.courses.map((course, idx) => {
                    const courseName =
                      typeof course === "string" ? course : course?.name || "";
                    const courseSpec =
                      typeof course === "string"
                        ? ""
                        : course?.specialization
                          ? ` (${course.specialization})`
                          : "";
                    const displayText = `${courseName}${courseSpec}`;
                    return (
                      <option key={idx} value={courseName}>
                        {" "}
                        {displayText}{" "}
                      </option>
                    );
                  })
                ) : (
                  <option value="General Inquiry">General Inquiry</option>
                )}{" "}
              </select>{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-card shadow-card shadow-brand-bg hover:shadow-brand-bg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
          >
            {" "}
            {loading ? "Submitting..." : "Submit Application"}{" "}
          </button>{" "}
        </form>{" "}
        <div className="p-6 bg-white border-t border-border-subtle text-center">
          {" "}
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
            {" "}
            By submitting, you agree to our terms & conditions{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

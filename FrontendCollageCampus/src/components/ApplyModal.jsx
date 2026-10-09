import { useState, useEffect, useMemo } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaUniversity,
  FaTimes,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useUser } from "../context/UserContext";
import { auth, googleProvider } from "../firebase";
import { openAuthModal } from "./AuthModal";
import { apiUrl } from "../lib/api";
import { FIELD_LIMITS } from "../lib/fieldLimits";
import ExpandableTextField from "./ExpandableTextField";

const STUDY_MODES = [
  { value: "online", label: "Online / Distance Learning" },
  { value: "offline", label: "Offline / Regular" },
];

const emptyForm = () => ({
  firstName: "",
  lastName: "",
  fatherFirstName: "",
  fatherLastName: "",
  email: "",
  phone: "",
  age: "",
  studentAddress: "",
  course: "",
  preferredCourse: "",
  studyMode: "",
});

const authErrorMessage = (err) => {
  const msgMap = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/unauthorized-domain":
      "This site domain is not authorized for Google sign-in yet.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup.",
  };
  return msgMap[err.code] || err.message;
};

export default function ApplyModal() {
  const {
    isApplyModalOpen,
    closeApplyModal,
    hideApplyModalForAuth,
    selectedCollegeForApply,
    showToast,
    user,
  } = useUser();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [signInPassword, setSignInPassword] = useState("");
  const [formData, setFormData] = useState(emptyForm());
  const isGuest = !user;

  const offeredStudyModes = useMemo(() => {
    const modes = selectedCollegeForApply?.studyModes;
    const options = STUDY_MODES.filter((mode) => {
      if (!modes) return true;
      if (mode.value === "online") return modes.online !== false;
      if (mode.value === "offline") return modes.offline !== false;
      return true;
    });
    return options.length ? options : STUDY_MODES;
  }, [selectedCollegeForApply]);

  useEffect(() => {
    if (!isApplyModalOpen) return;
    const initialCourse = selectedCollegeForApply?.courses?.[0];
    const initialCourseName =
      typeof initialCourse === "string"
        ? initialCourse
        : initialCourse?.name || "";
    const nameParts = (user?.displayName || "").split(" ");
    const defaultStudyMode = offeredStudyModes[0]?.value || "offline";

    setSignInPassword("");
    setFormData({
      ...emptyForm(),
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user?.email || "",
      course: initialCourseName || "General Inquiry",
      studyMode: defaultStudyMode,
    });
  }, [isApplyModalOpen, selectedCollegeForApply, offeredStudyModes, user]);

  if (!isApplyModalOpen) return null;

  const sanitizePreferredCourse = (value) =>
    value.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, FIELD_LIMITS.preferredCourse);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;

    if (
      name === "firstName" ||
      name === "lastName" ||
      name === "fatherFirstName" ||
      name === "fatherLastName"
    ) {
      const limit =
        name === "firstName" || name === "lastName"
          ? FIELD_LIMITS.applyFirstName
          : FIELD_LIMITS.fatherFirstName;
      next = value.replace(/[^a-zA-Z\s]/g, "").slice(0, limit);
    } else if (name === "phone") {
      next = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "age") {
      next = value.replace(/\D/g, "").slice(0, 2);
    } else if (name === "studentAddress") {
      next = value.slice(0, FIELD_LIMITS.studentAddress);
    } else if (name === "preferredCourse") {
      next = sanitizePreferredCourse(value);
    }

    setFormData((prev) => ({ ...prev, [name]: next }));
  };

  const applyProfileFromUser = async (signedInUser) => {
    const nameParts = (signedInUser.displayName || "").split(" ");
    setFormData((prev) => ({
      ...prev,
      email: signedInUser.email || prev.email,
      firstName: prev.firstName || nameParts[0] || "",
      lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
    }));
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await applyProfileFromUser(cred.user);
      window.dispatchEvent(new Event("auth-change"));
      showToast("Signed in with Google", "success");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        showToast(authErrorMessage(err), "error");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!formData.email.trim()) {
      showToast("Enter your email address above", "error");
      return;
    }
    if (!signInPassword) {
      showToast("Enter your password", "error");
      return;
    }
    setAuthLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        signInPassword,
      );
      await applyProfileFromUser(cred.user);
      window.dispatchEvent(new Event("auth-change"));
      showToast("Signed in successfully", "success");
      setSignInPassword("");
    } catch (err) {
      showToast(authErrorMessage(err), "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const submitApplication = async (signedInUser) => {
    const token = await signedInUser.getIdToken();
    const fatherName =
      `${formData.fatherFirstName} ${formData.fatherLastName}`.trim();
    const courseLabel = formData.preferredCourse.trim()
      ? `${formData.course} (${formData.preferredCourse.trim()})`
      : formData.course;

    const response = await fetch(apiUrl("/api/applications/apply"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: signedInUser.uid,
        userName: `${formData.firstName} ${formData.lastName}`.trim(),
        userEmail: signedInUser.email,
        userPhone: `+91 ${formData.phone}`,
        userAge: formData.age,
        course: courseLabel,
        selectedCourse: formData.course,
        preferredCourse: formData.preferredCourse.trim() || null,
        studyMode: formData.studyMode,
        fatherName,
        studentAddress: formData.studentAddress.trim(),
        universityId: selectedCollegeForApply?._id || "manual",
        universityName: selectedCollegeForApply?.name || "N/A",
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message);

    showToast(
      data.emailSent
        ? "Application submitted! Check your email."
        : "Application submitted successfully!",
      "success",
    );
    closeApplyModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studyMode) {
      showToast("Please select a study mode", "error");
      return;
    }

    if (!formData.fatherFirstName.trim()) {
      showToast("Father's first name is required", "error");
      return;
    }

    if (!formData.studentAddress.trim()) {
      showToast("Student address is required", "error");
      return;
    }

    setLoading(true);
    try {
      const signedInUser = auth.currentUser;
      if (!signedInUser) {
        showToast("Please sign in with Google or email to continue", "error");
        return;
      }

      const displayName = `${formData.firstName} ${formData.lastName}`.trim();
      if (displayName && displayName !== signedInUser.displayName) {
        await updateProfile(signedInUser, { displayName });
      }

      await submitApplication(signedInUser);
    } catch (err) {
      console.error("Error submitting application:", err);
      const msg =
        err.code === "auth/email-already-in-use"
          ? "This email is already registered. Sign in and apply again."
          : err.message || "Failed to submit application";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const switchToSignIn = () => {
    hideApplyModalForAuth();
    openAuthModal("login", { resumeApply: true });
  };

  const switchToSignUp = () => {
    hideApplyModalForAuth();
    openAuthModal("signup", { resumeApply: true });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start sm:items-center justify-center glass-overlay p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-brand-border rounded-card shadow-glass-lg w-full max-w-lg max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-300 my-4 sm:my-auto">
        <div className="bg-primary p-5 sm:p-8 text-white relative">
          <button
            onClick={closeApplyModal}
            type="button"
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
          {isGuest && (
            <p className="mt-3 text-xs text-white/85 leading-relaxed">
              Sign in with Google or your email to apply. New here?{" "}
              <button
                type="button"
                onClick={switchToSignUp}
                className="font-bold underline hover:text-accent"
              >
                Create account
              </button>
            </p>
          )}
          {!isGuest && user?.email && (
            <p className="mt-3 flex items-center gap-2 text-xs text-white/90">
              <FaCheckCircle className="text-accent shrink-0" />
              Signed in as {user.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
              Study Mode *
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {offeredStudyModes.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-card border px-3 py-3 text-sm transition ${
                    formData.studyMode === mode.value
                      ? "border-primary bg-brand-bg font-semibold text-primary"
                      : "border-border-subtle hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="studyMode"
                    value={mode.value}
                    checked={formData.studyMode === mode.value}
                    onChange={handleChange}
                    className="accent-primary"
                    required
                  />
                  <span className="leading-snug">{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                First Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <input
                  type="text"
                  name="firstName"
                  required
                  maxLength={FIELD_LIMITS.applyFirstName}
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="First name"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Last Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <input
                  type="text"
                  name="lastName"
                  required
                  maxLength={FIELD_LIMITS.applyLastName}
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Father&apos;s First Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <input
                  type="text"
                  name="fatherFirstName"
                  required
                  maxLength={FIELD_LIMITS.fatherFirstName}
                  value={formData.fatherFirstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Father's first name"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Father&apos;s Last Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <input
                  type="text"
                  name="fatherLastName"
                  maxLength={FIELD_LIMITS.fatherLastName}
                  value={formData.fatherLastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="Father's last name"
                />
              </div>
            </div>
          </div>

          <ExpandableTextField
            label="Student Address"
            name="studentAddress"
            value={formData.studentAddress}
            onChange={handleChange}
            maxLength={FIELD_LIMITS.studentAddress}
            required
            multiline
            previewLength={32}
            dialogTitle="Student Address"
            placeholder="House no., street, city, state"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Email Address *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <input
                  type="email"
                  name="email"
                  required
                  readOnly={!isGuest}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border border-border-subtle rounded-card text-sm outline-none ${
                    isGuest
                      ? "bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      : "bg-white text-text-muted cursor-not-allowed"
                  }`}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Age *
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <input
                  type="text"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="Your age"
                />
              </div>
            </div>
          </div>

          {isGuest && (
            <div className="rounded-card border border-brand-border bg-brand-bg/30 p-4 space-y-4">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                Sign in to submit
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2 rounded-card border border-border-subtle bg-white py-3 text-sm font-bold text-text-main transition hover:bg-brand-bg/80 disabled:opacity-70"
              >
                <FcGoogle className="text-lg" />
                Continue with Google
              </button>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-subtle" />
                </div>
                <span className="relative bg-brand-bg/30 px-3 text-[9px] font-bold uppercase tracking-widest text-text-muted">
                  Or email
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    maxLength={FIELD_LIMITS.password}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Your account password"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEmailSignIn}
                  disabled={authLoading}
                  className="mt-3 w-full rounded-card border border-primary bg-white py-2.5 text-sm font-bold text-primary transition hover:bg-brand-bg disabled:opacity-70"
                >
                  {authLoading ? "Signing in..." : "Sign in with Email"}
                </button>
              </div>
              <p className="text-center text-xs text-text-muted">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={switchToSignIn}
                  className="font-bold text-primary hover:underline"
                >
                  Sign in here
                </button>
                {" · "}
                New user?{" "}
                <button
                  type="button"
                  onClick={switchToSignUp}
                  className="font-bold text-primary hover:underline"
                >
                  Create account
                </button>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Phone Number *
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-border-subtle bg-white text-text-muted sm:text-sm font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 bg-white border border-border-subtle rounded-r-2xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                  placeholder="10-digit number"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">
                Select Course *
              </label>
              <select
                name="course"
                required
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-border-subtle rounded-card text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none appearance-none"
              >
                <option value="" disabled>
                  Select a course
                </option>
                {selectedCollegeForApply?.courses?.length > 0 ? (
                  selectedCollegeForApply.courses.map((course, idx) => {
                    const courseName =
                      typeof course === "string" ? course : course?.name || "";
                    const courseSpec =
                      typeof course === "string"
                        ? ""
                        : course?.specialization
                          ? ` (${course.specialization})`
                          : "";
                    return (
                      <option key={idx} value={courseName}>
                        {courseName}
                        {courseSpec}
                      </option>
                    );
                  })
                ) : (
                  <option value="General Inquiry">General Inquiry</option>
                )}
              </select>
            </div>
          </div>

          <ExpandableTextField
            label="Preferred Course (if not listed)"
            name="preferredCourse"
            value={formData.preferredCourse}
            onChange={handleChange}
            maxLength={FIELD_LIMITS.preferredCourse}
            optional
            previewLength={22}
            dialogTitle="Preferred Course"
            placeholder="Letters and numbers only"
            sanitize={sanitizePreferredCourse}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-card shadow-card hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 mt-2"
          >
            {loading
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>

        <div className="p-6 bg-white border-t border-border-subtle text-center">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
            By submitting, you agree to our terms &amp; conditions
          </p>
        </div>
      </div>
    </div>
  );
}

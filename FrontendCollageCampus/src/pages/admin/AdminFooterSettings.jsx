import React, { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { FIELD_LIMITS } from "../../lib/fieldLimits";
import {
  extractIndiaMobileNumber,
  formatIndiaPhoneStorage,
} from "../../lib/indiaPhone";
import { invalidateCachedDoc } from "../../lib/siteSettingsCache";
const defaultSettings = {
  twitter: "",
  linkedin: "",
  instagram: "",
  whatsapp: "",
  address: "123 Education St, Learning City, 12345",
  phone: "+919501583376",
  email: "info@collageship.com",
};
const linkFields = [
  {
    key: "twitter",
    label: "Twitter URL",
    icon: FaTwitter,
    placeholder: "https://twitter.com/your-profile",
  },
  {
    key: "linkedin",
    label: "LinkedIn URL",
    icon: FaLinkedinIn,
    placeholder: "https://www.linkedin.com/company/your-page",
  },
  {
    key: "instagram",
    label: "Instagram URL",
    icon: FaInstagram,
    placeholder: "https://www.instagram.com/your-profile",
  },
  {
    key: "whatsapp",
    label: "WhatsApp URL",
    icon: FaWhatsapp,
    placeholder: "https://wa.me/919999999999",
  },
];
export default function AdminFooterSettings() {
  const [formData, setFormData] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "siteSettings", "footer"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...defaultSettings,
            ...data,
            phone: extractIndiaMobileNumber(
              data.phone || defaultSettings.phone,
            ),
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading footer settings:", error);
        setFeedbackMsg(
          error.code === "permission-denied"
            ? "Could not load footer settings. Firestore rules may need to be deployed."
            : "Could not load footer settings.",
        );
        setFeedbackType("error");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);
  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const updatePhoneField = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, FIELD_LIMITS.footerPhone);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedbackMsg("");
    setFeedbackType("");
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== FIELD_LIMITS.footerPhone) {
      setFeedbackMsg(
        `Phone number must be exactly ${FIELD_LIMITS.footerPhone} digits.`,
      );
      setFeedbackType("error");
      setSaving(false);
      return;
    }
    try {
      const payload = {
        twitter: formData.twitter.trim(),
        linkedin: formData.linkedin.trim(),
        instagram: formData.instagram.trim(),
        whatsapp: formData.whatsapp.trim(),
        address: formData.address.trim(),
        phone: formatIndiaPhoneStorage(phoneDigits),
        email: formData.email.trim(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "siteSettings", "footer"), payload, { merge: true });
      invalidateCachedDoc("siteSettings", "footer");
      setFeedbackMsg("Footer settings saved successfully.");
      setFeedbackType("success");
    } catch (error) {
      console.error("Error saving footer settings:", error);
      setFeedbackMsg(
        error.code === "permission-denied"
          ? "Permission denied. Deploy Firestore rules or verify your admin account."
          : `Error saving footer settings: ${error.message}`,
      );
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        {" "}
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>{" "}
      </div>
    );
  }
  return (
    <div className="p-1 md:p-4 max-w-5xl mx-auto">
      {" "}
      <div className="mb-8">
        {" "}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D0D12] tracking-tight">
          Footer Settings
        </h1>{" "}
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {" "}
          Update footer social links and contact details shown across the public
          site.{" "}
        </p>{" "}
      </div>{" "}
      <form
        onSubmit={handleSubmit}
        className="glass-card p-6 md:p-8 space-y-8"
      >
        {" "}
        <section>
          {" "}
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
            Social Media Links
          </h2>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {" "}
            {linkFields.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                {" "}
                <label className="block text-xs font-bold text-text-muted mb-1">
                  {label}
                </label>{" "}
                <div className="relative">
                  {" "}
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />{" "}
                  <input
                    type="text"
                    inputMode="url"
                    maxLength={FIELD_LIMITS.url}
                    value={formData[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-3 border border-brand-border rounded-card text-sm focus:outline-none focus:border-primary"
                  />{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </section>{" "}
        <section>
          {" "}
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
            Contact Information
          </h2>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {" "}
            <div className="md:col-span-2">
              {" "}
              <label className="block text-xs font-bold text-text-muted mb-1">
                Address
              </label>{" "}
              <div className="relative">
                {" "}
                <FaMapMarkerAlt className="absolute left-4 top-4 text-text-muted" />{" "}
                <textarea
                  rows="3"
                  required
                  maxLength={FIELD_LIMITS.footerAddress}
                  value={formData.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  className="w-full pl-11 pr-4 py-3 border border-brand-border rounded-card text-sm focus:outline-none focus:border-primary"
                  placeholder="Office address"
                />{" "}
                <p className="mt-1 text-right text-xs text-text-muted">
                  {formData.address.length}/{FIELD_LIMITS.footerAddress}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-xs font-bold text-text-muted mb-1">
                Phone Number (India)
              </label>{" "}
              <div className="flex">
                {" "}
                <span className="inline-flex items-center gap-2 rounded-l-card border border-r-0 border-brand-border bg-brand-bg px-4 py-3 text-sm font-bold text-primary">
                  <FaPhone className="text-text-muted" />
                  +91
                </span>{" "}
                <div className="flex-1">
                  {" "}
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={FIELD_LIMITS.footerPhone}
                    value={formData.phone}
                    onChange={(event) => updatePhoneField(event.target.value)}
                    className="w-full rounded-r-card border border-brand-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    placeholder="9501583376"
                  />{" "}
                  <p className="mt-1 text-right text-xs text-text-muted">
                    {formData.phone.length}/{FIELD_LIMITS.footerPhone} digits after +91
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-xs font-bold text-text-muted mb-1">
                Email Address
              </label>{" "}
              <div className="relative">
                {" "}
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />{" "}
                <input
                  required
                  type="email"
                  maxLength={FIELD_LIMITS.footerEmail}
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-brand-border rounded-card text-sm focus:outline-none focus:border-primary"
                  placeholder="info@collageship.com"
                />{" "}
                <p className="mt-1 text-right text-xs text-text-muted">
                  {formData.email.length}/{FIELD_LIMITS.footerEmail}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-card font-bold transition-all hover:bg-[#0D0D12] transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
        >
          {" "}
          <FaSave /> {saving ? "Saving..." : "Save Footer Settings"}{" "}
        </button>{" "}
        {feedbackMsg && (
          <p
            className={`text-sm font-bold ${feedbackType === "error" ? "text-error" : "text-success"}`}
          >
            {feedbackMsg}
          </p>
        )}{" "}
      </form>{" "}
    </div>
  );
}

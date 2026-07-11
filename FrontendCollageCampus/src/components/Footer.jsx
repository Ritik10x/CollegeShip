import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assets/logo.png";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import FooterContactDialog from "./FooterContactDialog";
import {
  formatIndiaPhoneDisplay,
  formatIndiaPhoneTel,
} from "../lib/indiaPhone";
import {
  shouldTruncateFooterPreview,
  truncateFooterPreview,
} from "../lib/footerContact";

const ADDRESS_PREVIEW_LIMIT = 34;
const EMAIL_PREVIEW_LIMIT = 28;

const defaultFooterSettings = {
  twitter: "#",
  instagram: "#",
  whatsapp: "#",
  address: "Mohali, Punjab (IN)",
  phone: "+919501583376",
  email: "collageship007@gmail.com",
};

const socialLinks = [
  { key: "twitter", label: "X", icon: FaXTwitter },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
];

export default function Footer() {
  const [settings, setSettings] = useState(defaultFooterSettings);
  const [contactDialog, setContactDialog] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "siteSettings", "footer"),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...defaultFooterSettings, ...snap.data() });
        }
      },
      (error) => console.error("Error loading footer settings:", error),
    );

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-[#081229] text-white pt-16 sm:pt-24 pb-9">
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.35fr_1fr_1fr_1.1fr] md:gap-16 lg:gap-24">
          <div>
            <Link to="/" className="inline-flex items-center gap-4 group">
              <span className="flex h-[70px] w-[70px] items-center justify-center bg-white">
                <img
                  src={logo}
                  alt="CollegeShip Logo"
                  className="h-[62px] w-[62px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </span>
              <span>
                <span className="block text-[24px] font-black leading-none tracking-tight text-white">
                  CollegeShip
                </span>
                <span className="mt-2 block text-[12px] font-extrabold tracking-[0.12em] text-[#5AA2FF]">
                  Find Your Dream College
                </span>
              </span>
            </Link>

            <div className="mt-8 flex items-center gap-4">
              {socialLinks.map(({ key, label, icon: Icon }) => {
                const href = settings[key] || "#";
                return (
                  <a
                    key={key}
                    href={href}
                    target={href === "#" ? undefined : "_blank"}
                    rel={href === "#" ? undefined : "noreferrer"}
                    aria-label={label}
                    className="flex h-[45px] w-[45px] items-center justify-center rounded-[13px] bg-[#19223C] text-base text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:bg-[#223057] hover:text-[#5AA2FF]"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-[17px] font-extrabold uppercase leading-none text-white">
              Quick Links
            </h2>
            <ul className="mt-8 space-y-5 text-base sm:text-[17px] text-[#A9B7CF]">
              <li>
                <Link to="/#hero" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white">
                  Browse Colleges
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[17px] font-extrabold uppercase leading-none text-white">
              Services
            </h2>
            <ul className="mt-8 space-y-5 text-base sm:text-[17px] text-[#A9B7CF]">
              <li>
                <Link to="/services/career-counseling" className="hover:text-white">
                  Career Counseling
                </Link>
              </li>
              <li>
                <Link to="/services/college-reviews" className="hover:text-white">
                  College Reviews
                </Link>
              </li>
              <li>
                <Link to="/services/application-support" className="hover:text-white">
                  Application Support
                </Link>
              </li>
              <li>
                <Link to="/services/resources" className="hover:text-white">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[17px] font-extrabold uppercase leading-none text-white">
              Contact
            </h2>
            <div className="mt-8 space-y-5 text-[16px] text-[#A9B7CF]">
              <button
                type="button"
                onClick={() =>
                  setContactDialog({
                    title: "Office Address",
                    value: settings.address,
                  })
                }
                className="group flex w-full min-w-0 items-start gap-3 text-left transition hover:text-white"
                aria-label="View full office address"
              >
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[#A9B7CF] group-hover:text-[#5AA2FF]" />
                <span className="min-w-0 flex-1 truncate">
                  {truncateFooterPreview(
                    settings.address,
                    ADDRESS_PREVIEW_LIMIT,
                  )}
                </span>
                {shouldTruncateFooterPreview(
                  settings.address,
                  ADDRESS_PREVIEW_LIMIT,
                ) && (
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#5AA2FF]">
                    View
                  </span>
                )}
              </button>
              <a
                href={`tel:${formatIndiaPhoneTel(settings.phone)}`}
                className="flex items-center gap-3 hover:text-white"
              >
                <FaPhoneAlt className="shrink-0 text-[#A9B7CF]" />
                <span>{formatIndiaPhoneDisplay(settings.phone)}</span>
              </a>
              <button
                type="button"
                onClick={() =>
                  setContactDialog({
                    title: "Email Address",
                    value: settings.email,
                  })
                }
                className="group flex w-full min-w-0 items-start gap-3 text-left transition hover:text-white"
                aria-label="View full email address"
              >
                <FaEnvelope className="mt-0.5 shrink-0 text-[#A9B7CF] group-hover:text-[#5AA2FF]" />
                <span className="min-w-0 flex-1 truncate">
                  {truncateFooterPreview(settings.email, EMAIL_PREVIEW_LIMIT)}
                </span>
                {shouldTruncateFooterPreview(
                  settings.email,
                  EMAIL_PREVIEW_LIMIT,
                ) && (
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#5AA2FF]">
                    View
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-11 border-t border-[#344055] pt-7">
          <div className="flex flex-col gap-5 text-[16px] text-[#A9B7CF] md:flex-row md:items-center md:justify-between">
            <p>© 2026 CollegeShip. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <Link to="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-white">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FooterContactDialog
        open={Boolean(contactDialog)}
        title={contactDialog?.title || ""}
        value={contactDialog?.value || ""}
        onClose={() => setContactDialog(null)}
      />
    </footer>
  );
}
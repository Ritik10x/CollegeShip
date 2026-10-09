import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaTrophy,
  FaStar,
  FaRegEdit,
  FaDownload,
  FaGlobe,
  FaEnvelope,
  FaPhoneAlt,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { openAuthModal } from "../components/AuthModal";
import { useUser } from "../context/UserContext";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { resolveAssetUrl } from "../lib/api";
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsOpenUrl,
  getCollegeDisplayAddress,
} from "../lib/collegeMaps";
import WriteReviewModal from "../components/WriteReviewModal";
import ReviewCard from "../components/ReviewCard";
import { useColleges } from "../context/CollegesContext";
import LazyImage from "../components/LazyImage";
import { COLLEGE_IMAGE_FALLBACK } from "../lib/assets";
import PageSEO from "../components/PageSEO";
import { buildCollegeSeo } from "../lib/seo";
import {
  formatIndiaPhoneDisplay,
  formatIndiaPhoneTel,
} from "../lib/indiaPhone";
export default function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openApplyModal, isAdmin } = useUser();
  const { getCollegeById, loading: collegesLoading } = useColleges();
  const cachedCollege = getCollegeById(id);
  const [college, setCollege] = useState(cachedCollege);
  const [loading, setLoading] = useState(!cachedCollege);
  const [activeTab, setActiveTab] = useState("Overview");
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(null);
  /*  */ const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  useEffect(() => {
    const cached = getCollegeById(id);
    if (cached) {
      setCollege(cached);
      setLoading(false);
      return;
    }
    if (collegesLoading) return;
    getDoc(doc(db, "colleges", id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          setCollege({ _id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching college:", err);
        setLoading(false);
      });
  }, [id, getCollegeById, collegesLoading]);
  useEffect(() => {
    const cached = getCollegeById(id);
    if (cached) setCollege(cached);
  }, [id, getCollegeById]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, "collegeReviews"),
          where("collegeId", "==", id),
        );
        const snapshot = await getDocs(q);
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({ id: docSnap.id, ...docSnap.data() }),
        );
        items.sort(
          (a, b) =>
            (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
        );
        setReviews(items);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-[50vh] pt-[65px] sm:pt-24 pb-12 flex justify-center items-center text-text-muted">
        Loading college details...
      </div>
    );
  }
  if (!college) {
    return (
      <>
        {" "}
        <PageSEO
          title="College Not Found | CollegeShip"
          description="The requested college profile could not be found on CollegeShip."
          noindex
        />{" "}
        <div className="min-h-[50vh] pt-[65px] sm:pt-24 pb-12 flex justify-center items-center text-text-muted">
          College not found.
        </div>{" "}
      </>
    );
  }
  /*  */ const displayFee = (feeVal) => {
    if (auth.currentUser) return feeVal || "N/A";
  };
  const handleWriteReview = () => {
    if (!auth.currentUser) {
      openAuthModal("login");
      return;
    }
    setIsReviewModalOpen(true);
  };
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteDoc(doc(db, "collegeReviews", reviewId));
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };
  const SHOW_LIMIT = 10;
  /*  */ const CollapsibleTagList = ({
    items,
    sectionKey,
    renderItem,
    emptyText = "N/A",
    wrapperClass = "flex flex-wrap gap-3",
  }) => {
    const isExpanded = expandedSections[sectionKey];
    const hasMore = items.length > SHOW_LIMIT;
    const displayed = isExpanded ? items : items.slice(0, SHOW_LIMIT);
    const hiddenCount = items.length - SHOW_LIMIT;
    return (
      <div>
        {" "}
        <div className={wrapperClass}>
          {" "}
          {items.length > 0 ? (
            displayed.map((item, idx) => renderItem(item, idx))
          ) : (
            <p className="text-xs text-text-muted font-bold">{emptyText}</p>
          )}{" "}
        </div>{" "}
        {hasMore && (
          <button
            onClick={() => toggleSection(sectionKey)}
            className="mt-4 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-primary hover:text-accent transition-colors duration-200 transition-colors group"
          >
            {" "}
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black transition-colors ${isExpanded ? "bg-accent" : "bg-primary group-hover:bg-accent"}`}
            >
              {" "}
              {isExpanded ? "−" : "+"}{" "}
            </span>{" "}
            {isExpanded ? `Show less` : `+${hiddenCount} more`}{" "}
          </button>
        )}{" "}
      </div>
    );
  };
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";
  const currentUserId = auth.currentUser?.uid;
  const myReview = currentUserId
    ? reviews.find((review) => review.userId === currentUserId)
    : null;
  const googleMapsOpenUrl = getGoogleMapsOpenUrl(college.location);
  const googleMapsEmbedUrl = getGoogleMapsEmbedUrl(college.location);
  const collegeRating =
    college.averageReview != null && college.averageReview !== ""
      ? Number(college.averageReview).toFixed(1)
      : null;
  const displayAddress = getCollegeDisplayAddress(college.location);
  const studentReviewLabel =
    reviews.length === 0
      ? "No student reviews yet"
      : `${avgRating} average from ${reviews.length} student review${reviews.length === 1 ? "" : "s"}`;
  return (
    <>
      {" "}
      <PageSEO {...buildCollegeSeo(college, id)} />{" "}
      <div className="bg-background min-h-screen pb-20 pt-[65px] sm:pt-24">
        {" "}
        {/* HEADER BANNER */}{" "}
        <div className="relative w-full h-[220px] sm:h-[300px] md:h-[400px] bg-[#EAE6E0]">
          {" "}
          {/* Banner Image */}{" "}
          {college.thumbnail ? (
            <img
              src={resolveAssetUrl(college.thumbnail)}
              alt={college.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted font-bold uppercase tracking-widest text-xs md:text-sm">
              {" "}
              no picture (Banner Image NA){" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className="max-w-6xl mx-auto px-6 -mt-14 md:-mt-20 relative z-10 pb-2">
          {" "}
          <div className="bg-white border border-border-subtle rounded-card p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 md:gap-6 shadow-glass-lg">
            {" "}
            {/* Logo */}{" "}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-card shadow-card overflow-hidden shrink-0 border border-border-subtle flex items-center justify-center text-center">
              {" "}
              {college.logo ? (
                <img
                  src={resolveAssetUrl(college.logo)}
                  alt={`${college.name} logo`}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML =
                      '<span class="text-xs font-bold text-text-muted uppercase tracking-widest leading-none">no picture</span>';
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest leading-none">
                  no picture
                </span>
              )}{" "}
            </div>{" "}
            {/* Title & Info */}{" "}
            <div className="mb-2 flex-1 w-full">
              {" "}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {" "}
                <div>
                  {" "}
                  <h1 className="text-2xl md:text-[42px] font-bold leading-tight mb-2">
                    {college.name}
                  </h1>{" "}
                  <div className="flex flex-wrap justify-center sm:justify-start items-center text-xs md:text-base font-medium text-text-muted gap-y-1">
                    {" "}
                    <span className="flex items-center">
                      {" "}
                      <FaMapMarkerAlt className="mr-1.5 text-[#5B5B63]/60" />{" "}
                      <span>
                        {college.location?.city || "Unknown City"}
                      </span>{" "}
                    </span>{" "}
                    <span className="mx-2">•</span>{" "}
                    <span>{college.type || "N/A"}</span>{" "}
                    <span className="mx-2">•</span>{" "}
                    <span>
                      Established{" "}
                      {college.establishedDate
                        ? new Date(college.establishedDate).getFullYear()
                        : "N/A"}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Edit Button for Admin Users */}{" "}
                {isAdmin && (
                  <button
                    onClick={() =>
                      navigate(`/admin/colleges?edit=${college._id}`)
                    }
                    className="shrink-0 bg-accent text-white font-bold py-2.5 px-6 rounded-card hover:bg-[#A8813E] transition-colors duration-200 transition flex items-center gap-2 shadow-card shadow-primary/10"
                  >
                    {" "}
                    <FaRegEdit /> Edit College{" "}
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* GALLERY LIGHTBOX */}{" "}
        {lightboxImageIndex !== null &&
          Array.isArray(college.photos) &&
          college.photos.length > 0 && (
            <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center backdrop-blur-sm">
              {" "}
              <button
                onClick={() => setLightboxImageIndex(null)}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[1001]"
                aria-label="Close"
              >
                {" "}
                <FaTimes size={28} />{" "}
              </button>{" "}
              <button
                onClick={() =>
                  setLightboxImageIndex((prev) =>
                    prev > 0 ? prev - 1 : college.photos.length - 1,
                  )
                }
                className="absolute left-2 sm:left-12 text-white/50 hover:text-white p-4 z-[1001]"
                aria-label="Previous image"
              >
                {" "}
                <FaChevronLeft size={36} />{" "}
              </button>{" "}
              <img
                src={resolveAssetUrl(college.photos[lightboxImageIndex])}
                alt="Gallery preview"
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-card"
              />{" "}
              <button
                onClick={() =>
                  setLightboxImageIndex((prev) =>
                    prev < college.photos.length - 1 ? prev + 1 : 0,
                  )
                }
                className="absolute right-2 sm:right-12 text-white/50 hover:text-white p-4 z-[1001]"
                aria-label="Next image"
              >
                {" "}
                <FaChevronRight size={36} />{" "}
              </button>{" "}
            </div>
          )}{" "}
        {/* TABS NAVIGATION */}{" "}
        <div className="bg-white border-b border-brand-border sticky top-[65px] sm:top-24 z-10">
          {" "}
          <div className="max-w-6xl mx-auto px-6">
            {" "}
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {" "}
              {[
                "Overview",
                "Courses & Fees",
                "Reviews",
                "Facilities",
                "Gallery",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-[#0D0D12]"}`}
                >
                  {" "}
                  {tab}{" "}
                  {tab === "Reviews" && reviews.length > 0 && (
                    <span className="rounded-full bg-brand-bg px-2 py-0.5 text-[10px] font-extrabold text-primary">
                      {" "}
                      {reviews.length}{" "}
                    </span>
                  )}{" "}
                </button>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* MAIN CONTENT AREA */}{" "}
        <div className="max-w-6xl mx-auto px-6 pt-10 flex flex-col lg:flex-row gap-8 items-start">
          {" "}
          {/* LEFT COLUMN */}{" "}
          <div className="flex-1 w-full">
            {" "}
            {/* OVERVIEW TAB */}{" "}
            {activeTab === "Overview" && (
              <div className="space-y-12">
                {" "}
                {/* About Section */}{" "}
                <section>
                  {" "}
                  <h2 className="text-2xl font-bold text-[#0D0D12] mb-4">
                    About the College
                  </h2>{" "}
                  <p className="text-text-muted text-sm leading-relaxed mb-8 break-words whitespace-pre-wrap">
                    {" "}
                    {college.description || "N/A"}{" "}
                  </p>{" "}
                  {/* Quick Info Grid */}{" "}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                      {" "}
                      <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                        Students
                      </p>{" "}
                      <p className="text-xl font-bold text-primary">
                        {" "}
                        {college.studentCount
                          ? `${Number(college.studentCount).toLocaleString()}+`
                          : "N/A"}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                      {" "}
                      <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                        Type
                      </p>{" "}
                      <p className="text-xl font-bold text-primary">
                        {college.type || "N/A"}
                      </p>{" "}
                    </div>{" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                      {" "}
                      <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                        Established
                      </p>{" "}
                      <p className="text-xl font-bold text-primary">
                        {" "}
                        {college.establishedDate
                          ? new Date(college.establishedDate).getFullYear()
                          : "N/A"}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                      {" "}
                      <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                        College Rating
                      </p>{" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <FaStar className="text-accent text-lg shrink-0" />{" "}
                        <p className="text-xl font-bold text-primary">
                          {" "}
                          {collegeRating || "N/A"}{" "}
                        </p>{" "}
                        {collegeRating && (
                          <span className="text-xs font-semibold text-text-muted">
                            / 5
                          </span>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {(college.studyModes?.online !== false ||
                    college.studyModes?.offline !== false ||
                    !college.studyModes) && (
                    <div className="mb-8">
                      <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-2">
                        Study Modes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(college.studyModes?.online !== false ||
                          !college.studyModes) && (
                          <span className="rounded-full bg-brand-bg px-3 py-1 text-xs font-semibold text-primary">
                            Online / Distance Learning
                          </span>
                        )}
                        {(college.studyModes?.offline !== false ||
                          !college.studyModes) && (
                          <span className="rounded-full bg-brand-bg px-3 py-1 text-xs font-semibold text-primary">
                            Offline / Regular
                          </span>
                        )}
                      </div>
                    </div>
                  )}{" "}
                  {/* Contact Information */}{" "}
                  <div>
                    {" "}
                    <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-2">
                      Get In Touch
                    </p>{" "}
                    <h3 className="text-lg font-bold text-[#0D0D12] mb-4">
                      Contact Information
                    </h3>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {" "}
                      <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                        {" "}
                        <div className="flex items-center gap-2 mb-2">
                          {" "}
                          <FaMapMarkerAlt className="text-primary" />{" "}
                          <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                            Address
                          </p>{" "}
                        </div>{" "}
                        {displayAddress ? (
                          <p className="text-sm font-semibold text-primary leading-relaxed break-words break-all">
                            {" "}
                            {displayAddress}{" "}
                          </p>
                        ) : (
                          <p className="text-sm font-semibold text-text-muted">
                            N/A
                          </p>
                        )}{" "}
                      </div>{" "}
                      <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                        {" "}
                        <div className="flex items-center gap-2 mb-2">
                          {" "}
                          <FaGlobe className="text-primary" />{" "}
                          <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                            Website
                          </p>{" "}
                        </div>{" "}
                        {college.website ? (
                          <a
                            href={
                              college.website.startsWith("http")
                                ? college.website
                                : `https://${college.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-primary break-all hover:underline"
                          >
                            {" "}
                            {college.website}{" "}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-text-muted">
                            N/A
                          </p>
                        )}{" "}
                      </div>{" "}
                      <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                        {" "}
                        <div className="flex items-center gap-2 mb-2">
                          {" "}
                          <FaEnvelope className="text-primary" />{" "}
                          <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                            Email
                          </p>{" "}
                        </div>{" "}
                        {college.contactEmail ? (
                          <a
                            href={`mailto:${college.contactEmail}`}
                            className="text-sm font-semibold text-primary break-all hover:underline"
                          >
                            {" "}
                            {college.contactEmail}{" "}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-text-muted">
                            N/A
                          </p>
                        )}{" "}
                      </div>{" "}
                      <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                        {" "}
                        <div className="flex items-center gap-2 mb-2">
                          {" "}
                          <FaPhoneAlt className="text-primary" />{" "}
                          <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                            Phone
                          </p>{" "}
                        </div>{" "}
                        {college.contactPhone ? (
                          <a
                            href={`tel:${formatIndiaPhoneTel(college.contactPhone)}`}
                            className="text-sm font-semibold text-primary hover:underline break-all"
                          >
                            {" "}
                            {formatIndiaPhoneDisplay(college.contactPhone)}{" "}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-text-muted">
                            N/A
                          </p>
                        )}{" "}
                      </div>{" "}
                      {college.contactPhoneAlt && (
                        <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                          {" "}
                          <div className="flex items-center gap-2 mb-2">
                            {" "}
                            <FaPhoneAlt className="text-primary" />{" "}
                            <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                              Alternative Phone
                            </p>{" "}
                          </div>{" "}
                          <a
                            href={`tel:${formatIndiaPhoneTel(college.contactPhoneAlt)}`}
                            className="text-sm font-semibold text-primary hover:underline break-all"
                          >
                            {" "}
                            {formatIndiaPhoneDisplay(
                              college.contactPhoneAlt,
                            )}{" "}
                          </a>
                        </div>
                      )}
                      {(college.socialInstagram || college.socialFacebook || college.socialX || college.socialYoutube) && (
                        <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                          {" "}
                          <div className="flex items-center gap-2 mb-3">
                            {" "}
                            <FaGlobe className="text-primary" />{" "}
                            <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                              Social Links
                            </p>{" "}
                          </div>{" "}
                          <div className="flex items-center gap-4">
                            {college.socialInstagram && (
                              <a href={college.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#E1306C] transition-colors duration-200 text-xl" aria-label="Instagram">
                                <FaInstagram />
                              </a>
                            )}
                            {college.socialFacebook && (
                              <a href={college.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#1877F2] transition-colors duration-200 text-xl" aria-label="Facebook">
                                <FaFacebook />
                              </a>
                            )}
                            {college.socialX && (
                              <a href={college.socialX} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#1DA1F2] transition-colors duration-200 text-xl" aria-label="X (Twitter)">
                                <FaTwitter />
                              </a>
                            )}
                            {college.socialYoutube && (
                              <a href={college.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#FF0000] transition-colors duration-200 text-xl" aria-label="YouTube">
                                <FaYoutube />
                              </a>
                            )}
                          </div>
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>{" "}
                </section>{" "}
                {/* Highlights/Key Facts */}{" "}
                {Array.isArray(college.highlights) &&
                  college.highlights.length > 0 && (
                    <section>
                      {" "}
                      <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-2">
                        Highlights
                      </p>{" "}
                      <h2 className="text-2xl font-bold text-[#0D0D12] mb-5">
                        At a Glance
                      </h2>{" "}
                      <CollapsibleTagList
                        items={college.highlights}
                        sectionKey="highlights"
                        wrapperClass="grid grid-cols-2 md:grid-cols-3 gap-4"
                        renderItem={(highlight, idx) => (
                          <div
                            key={idx}
                            className="bg-primary text-white p-4 rounded-card shadow-card flex flex-col justify-center overflow-hidden"
                          >
                            {" "}
                            <p className="text-xs font-bold tracking-wide leading-snug break-words hyphens-auto">
                              {highlight}
                            </p>{" "}
                          </div>
                        )}
                      />{" "}
                    </section>
                  )}{" "}
                {/* Rankings & Accolades */}{" "}
                <section>
                  {" "}
                  <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-2">
                    Recognition
                  </p>{" "}
                  <h2 className="text-2xl font-bold text-[#0D0D12] mb-6">
                    Rankings & Accolades
                  </h2>{" "}
                  <CollapsibleTagList
                    items={
                      Array.isArray(college.rankings) ? college.rankings : []
                    }
                    sectionKey="rankings"
                    wrapperClass="flex flex-wrap gap-4"
                    emptyText="N/A"
                    renderItem={(ranking, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white border border-border-subtle shadow-xs px-4 py-3 rounded-card"
                      >
                        {" "}
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          {" "}
                          <FaTrophy className="text-white text-xs" />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-sm font-bold text-[#0D0D12] leading-tight break-all break-words">
                            {ranking}
                          </p>{" "}
                          <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-1">
                            National Rank
                          </p>{" "}
                        </div>{" "}
                      </div>
                    )}
                  />{" "}
                </section>{" "}
                {/* Your Review */}{" "}
                <section>
                  {" "}
                  <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-2">
                    Campus Voice
                  </p>{" "}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
                    {" "}
                    <h2 className="text-2xl font-bold text-[#0D0D12]">
                      Your Review
                    </h2>{" "}
                    <button
                      onClick={handleWriteReview}
                      className="flex items-center gap-2 border border-brand-border text-primary font-bold text-xs px-4 py-2 rounded-card hover:bg-brand-bg/80 transition-colors duration-200 transition"
                    >
                      {" "}
                      <FaRegEdit />{" "}
                      {myReview
                        ? "WRITE ANOTHER REVIEW"
                        : "WRITE A REVIEW"}{" "}
                    </button>{" "}
                  </div>{" "}
                  <p className="text-sm text-text-muted mb-6">
                    {" "}
                    {myReview
                      ? "This is your review for this college. All student reviews are available in the Reviews tab."
                      : currentUserId
                        ? "You have not reviewed this college yet."
                        : "Sign in to write and view your review here."}{" "}
                  </p>{" "}
                  <div className="mt-4">
                    {" "}
                    {myReview ? (
                      <div className="space-y-4">
                        {" "}
                        <ReviewCard
                          review={myReview}
                          compact
                          showDelete
                          currentUserId={currentUserId}
                          onDelete={handleDeleteReview}
                        />{" "}
                        {reviews.length > 1 && (
                          <button
                            onClick={() => setActiveTab("Reviews")}
                            className="text-primary text-sm font-bold w-full text-center hover:underline"
                          >
                            {" "}
                            View all {reviews.length} student reviews{" "}
                          </button>
                        )}{" "}
                      </div>
                    ) : (
                      <div className="bg-white border border-border-subtle rounded-card p-12 text-center shadow-xs">
                        {" "}
                        <div className="w-12 h-12 mx-auto mb-3 bg-brand-bg rounded-full flex items-center justify-center">
                          {" "}
                          <svg
                            className="w-6 h-6 text-accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {" "}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />{" "}
                          </svg>{" "}
                        </div>{" "}
                        <p className="text-text-muted text-sm font-medium mb-4">
                          {" "}
                          {currentUserId
                            ? "You have not shared your experience for this college yet."
                            : "Sign in to write your review and see it here."}{" "}
                        </p>{" "}
                        <button
                          onClick={handleWriteReview}
                          className="bg-brand-bg text-text-muted font-semibold py-2 px-6 rounded-card text-xs hover:bg-gray-200 transition-colors"
                        >
                          {" "}
                          {currentUserId
                            ? "Write a Review"
                            : "Sign In To Review"}{" "}
                        </button>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </section>{" "}
              </div>
            )}{" "}
            {/* COURSES & FEES TAB */}{" "}
            {activeTab === "Courses & Fees" && (
              <div className="space-y-8">
                {" "}
                <section>
                  {" "}
                  <div className="flex justify-between items-center mb-6">
                    {" "}
                    <div>
                      {" "}
                      <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
                        Academic Programs
                      </p>{" "}
                      <h2 className="text-2xl font-bold text-[#0D0D12]">
                        Courses & Fees
                      </h2>{" "}
                    </div>{" "}
                    <div className="bg-brand-bg text-primary text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                      {" "}
                      {Array.isArray(college.courses)
                        ? `${college.courses.length} Course${college.courses.length !== 1 ? "s" : ""} Available`
                        : "N/A"}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs flex justify-between items-center">
                      {" "}
                      <div>
                        {" "}
                        <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                          Total Courses
                        </p>{" "}
                        <p className="text-xl font-bold text-[#0D0D12]">
                          {Array.isArray(college.courses)
                            ? college.courses.length
                            : 0}
                        </p>{" "}
                      </div>{" "}
                      <div className="bg-brand-bg text-primary text-[10px] px-2 py-1 rounded-lg font-bold">
                        ~ Active
                      </div>{" "}
                    </div>{" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                      {" "}
                      <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                        Active Departments
                      </p>{" "}
                      <p className="text-xl font-bold text-primary">
                        {" "}
                        {Array.isArray(college.courses)
                          ? Math.max(1, Math.round(college.courses.length / 2))
                          : 0}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="border border-border-subtle rounded-card p-5 bg-white shadow-xs">
                      {" "}
                      <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1">
                        Avg. Annual Fee
                      </p>{" "}
                      <p className="text-xl font-bold text-[#0D0D12]">
                        {" "}
                        {displayFee(
                          Array.isArray(college.courses) &&
                            college.courses.length > 0 &&
                            typeof college.courses[0] === "object"
                            ? college.courses[0].total
                            : "₹5,18,398",
                        )}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <p className="mb-2 text-xs text-text-muted sm:hidden">
                    Swipe table to see all columns
                  </p>
                  <div className="overflow-x-auto glass-card mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {" "}
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      {" "}
                      <thead>
                        {" "}
                        <tr className="border-b border-border-subtle bg-brand-bg/50">
                          {" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Name & Specialization
                          </th>{" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Duration & Mode
                          </th>{" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Tuition Fees
                          </th>{" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Term Fees & Structure
                          </th>{" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Registration
                          </th>{" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Total
                          </th>{" "}
                          <th className="py-4 px-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Seats
                          </th>{" "}
                        </tr>{" "}
                      </thead>{" "}
                      <tbody>
                        {" "}
                        {Array.isArray(college.courses) &&
                        college.courses.length > 0 ? (
                          college.courses.map((course, idx) => {
                            const isString = typeof course === "string";
                            return (
                              <tr
                                key={idx}
                                className="border-b border-gray-50 hover:bg-brand-bg/80 transition-colors duration-200/30"
                              >
                                {" "}
                                <td className="py-4 px-6">
                                  {" "}
                                  <p className="font-bold text-[#0D0D12] text-sm">
                                    {" "}
                                    {isString
                                      ? course.split(" (")[0]
                                      : course.name || "N/A"}{" "}
                                  </p>{" "}
                                  <p className="text-[10px] text-primary font-semibold uppercase">
                                    {" "}
                                    {isString
                                      ? course.includes("(")
                                        ? course.split("(")[1].replace(")", "")
                                        : "General"
                                      : course.specialization || "General"}{" "}
                                  </p>{" "}
                                </td>{" "}
                                <td className="py-4 px-6">
                                  {" "}
                                  <p className="text-sm text-[#0D0D12]">
                                    {isString
                                      ? "4 Years"
                                      : course.duration || "N/A"}
                                  </p>{" "}
                                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                    {isString
                                      ? "Full Time"
                                      : course.mode || "Full Time"}
                                  </p>{" "}
                                </td>{" "}
                                <td className="py-4 px-6 text-text-muted text-sm">
                                  {isString
                                    ? "****"
                                    : displayFee(course.tuitionFees)}
                                </td>{" "}
                                <td className="py-4 px-6">
                                  {" "}
                                  <p className="text-sm text-text-muted">
                                    {isString
                                      ? "****"
                                      : displayFee(course.termFees)}
                                  </p>{" "}
                                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                    {isString
                                      ? "Yearly"
                                      : course.termStructure || "Yearly"}
                                  </p>{" "}
                                </td>{" "}
                                <td className="py-4 px-6 text-text-muted text-sm">
                                  {isString
                                    ? "****"
                                    : displayFee(course.registration)}
                                </td>{" "}
                                <td className="py-4 px-6 text-text-muted text-sm font-semibold">
                                  {isString ? "****" : displayFee(course.total)}
                                </td>{" "}
                                <td className="py-4 px-6 text-gray-950 font-bold text-sm">
                                  {isString ? "60" : course.seats || "N/A"}
                                </td>{" "}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            {" "}
                            <td
                              colSpan="7"
                              className="py-8 text-center text-sm text-text-muted font-medium"
                            >
                              N/A (No courses listed)
                            </td>{" "}
                          </tr>
                        )}{" "}
                      </tbody>{" "}
                    </table>{" "}
                  </div>{" "}
                  {!auth.currentUser && (
                    <div className="bg-brand-bg/50 rounded-card border border-brand-bg p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      {" "}
                      <div>
                        {" "}
                        <h3 className="font-bold text-[#0D0D12] mb-1">
                          Unlock Full Fee Details & More Courses
                        </h3>{" "}
                        <p className="text-xs text-text-muted">
                          Sign in or create a free account to view detailed fee
                          structures, download brochures, and apply.
                        </p>{" "}
                      </div>{" "}
                      <button
                        onClick={() => openAuthModal("login")}
                        className="shrink-0 bg-primary text-white font-semibold py-2.5 px-6 rounded-card text-sm hover:bg-[#0D0D12] transition-colors duration-200 transition-colors"
                      >
                        {" "}
                        Sign In To View ↗{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                </section>{" "}
              </div>
            )}{" "}
            {/* REVIEWS TAB */}{" "}
            {activeTab === "Reviews" && (
              <div className="space-y-8">
                {" "}
                <section>
                  {" "}
                  <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-2">
                    Campus Voice
                  </p>{" "}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
                    {" "}
                    <h2 className="text-2xl font-bold text-[#0D0D12]">
                      All Student Reviews
                    </h2>{" "}
                    <button
                      onClick={handleWriteReview}
                      className="flex items-center gap-2 border border-brand-border text-primary font-bold text-xs px-4 py-2 rounded-card hover:bg-brand-bg/80 transition-colors duration-200 transition"
                    >
                      {" "}
                      <FaRegEdit /> WRITE A REVIEW{" "}
                    </button>{" "}
                  </div>{" "}
                  <p className="text-sm text-text-muted mb-6">
                    {studentReviewLabel}
                  </p>{" "}
                  {reviews.length > 0 ? (
                    <div className="rounded-card border border-border-subtle bg-white shadow-xs overflow-hidden">
                      {" "}
                      <div className="flex items-center justify-between border-b border-border-subtle bg-background px-5 py-3">
                        {" "}
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                          {" "}
                          {reviews.length} review
                          {reviews.length === 1 ? "" : "s"}{" "}
                        </p>{" "}
                        <p className="text-xs text-text-muted">
                          Longer reviews open in a popup
                        </p>{" "}
                      </div>{" "}
                      <div className="max-h-[480px] overflow-y-auto p-4 custom-scrollbar">
                        {" "}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {" "}
                          {reviews.map((review) => (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              showDelete
                              currentUserId={currentUserId}
                              onDelete={handleDeleteReview}
                            />
                          ))}{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  ) : (
                    <div className="bg-white border border-border-subtle rounded-card p-16 text-center shadow-xs flex flex-col items-center">
                      {" "}
                      <div className="w-16 h-16 mb-4 bg-brand-bg rounded-full flex items-center justify-center border border-border-subtle">
                        {" "}
                        <svg
                          className="w-8 h-8 text-[#5B5B63]/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {" "}
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />{" "}
                        </svg>{" "}
                      </div>{" "}
                      <p className="text-text-muted text-sm font-medium mb-6">
                        No reviews yet. Be the first to share your experience!
                      </p>{" "}
                      <button
                        onClick={handleWriteReview}
                        className="bg-primary text-white font-semibold py-2.5 px-8 rounded-card text-sm hover:bg-accent transition-colors"
                      >
                        {" "}
                        Write a Review{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                </section>{" "}
              </div>
            )}{" "}
            {/* FACILITIES TAB */}{" "}
            {activeTab === "Facilities" && (
              <div className="space-y-6">
                {" "}
                {/* Accreditation */}{" "}
                <section className="bg-white border border-border-subtle rounded-card p-6 shadow-xs">
                  {" "}
                  <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1">
                    Accreditation
                  </h3>{" "}
                  <p className="text-lg font-bold text-[#0D0D12] mb-5">
                    Certifications
                  </p>{" "}
                  <CollapsibleTagList
                    items={
                      Array.isArray(college.accreditation)
                        ? college.accreditation
                        : []
                    }
                    sectionKey="accreditation"
                    wrapperClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    renderItem={(acc, idx) => (
                      <div
                        key={idx}
                        title={acc}
                        className="flex items-center gap-3 bg-brand-bg border border-[#f0deb0] rounded-card px-4 py-3 hover:border-accent/60 hover:shadow-card transition-all group min-w-0 h-full"
                      >
                        {" "}
                        <div className="w-7 h-7 rounded-card bg-accent/15 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent transition-colors">
                          {" "}
                          <span className="text-[10px] font-black text-[#8A6A10] group-hover:text-white transition-colors">
                            {idx + 1}
                          </span>{" "}
                        </div>{" "}
                        <span className="text-xs font-bold text-[#0D0D12] leading-tight break-words break-all whitespace-normal">
                          {acc}
                        </span>{" "}
                      </div>
                    )}
                  />{" "}
                </section>{" "}
                {/* Key Features */}{" "}
                <section className="bg-white border border-border-subtle rounded-card p-6 shadow-xs">
                  {" "}
                  <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1">
                    Key Features
                  </h3>{" "}
                  <p className="text-lg font-bold text-[#0D0D12] mb-5">
                    What Sets Us Apart
                  </p>{" "}
                  <CollapsibleTagList
                    items={
                      Array.isArray(college.features) ? college.features : []
                    }
                    sectionKey="features"
                    wrapperClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    renderItem={(feature, idx) => (
                      <div
                        key={idx}
                        title={feature}
                        className="flex items-center gap-3 bg-[#2D8A56]/5 border border-green-100 rounded-card px-4 py-3 hover:border-green-300 hover:shadow-card transition-all group min-w-0 h-full"
                      >
                        {" "}
                        <div className="w-7 h-7 rounded-card bg-[#2D8A56]/20 flex items-center justify-center shrink-0 border border-[#2D8A56]/30 group-hover:bg-[#2D8A56] transition-colors">
                          {" "}
                          <svg
                            className="w-3.5 h-3.5 text-[#2D8A56] group-hover:text-white transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            {" "}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />{" "}
                          </svg>{" "}
                        </div>{" "}
                        <span className="text-xs font-bold text-[#0D0D12] leading-tight break-words break-all whitespace-normal">
                          {feature}
                        </span>{" "}
                      </div>
                    )}
                  />{" "}
                </section>{" "}
              </div>
            )}{" "}
            {/* CAMPUS FACILITIES sub-section — rendered separately below */}{" "}
            {activeTab === "Facilities" && (
              <div className="space-y-6 mt-6">
                {" "}
                <section className="bg-white border border-border-subtle rounded-card p-6 shadow-xs">
                  {" "}
                  <h3 className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1">
                    Campus Facilities
                  </h3>{" "}
                  <p className="text-lg font-bold text-[#0D0D12] mb-5">
                    Infrastructure &amp; Amenities
                  </p>{" "}
                  <CollapsibleTagList
                    items={
                      Array.isArray(college.facilities)
                        ? college.facilities
                        : []
                    }
                    sectionKey="facilities"
                    wrapperClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    renderItem={(facility, idx) => (
                      <div
                        key={idx}
                        title={facility}
                        className="flex items-center gap-3 border border-border-subtle rounded-card p-4 bg-brand-bg/50 hover:bg-brand-bg/80 transition-colors duration-200 hover:border-brand-bg transition-colors group min-w-0 h-full"
                      >
                        {" "}
                        <div className="w-7 h-7 rounded-full bg-[#2D8A56]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0D0D12] transition-colors duration-200 transition-colors">
                          {" "}
                          <span className="text-[#2D8A56] text-sm group-hover:text-white transition-colors">
                            ⊛
                          </span>{" "}
                        </div>{" "}
                        <span className="text-xs font-bold text-[#0D0D12] leading-tight break-words break-all whitespace-normal">
                          {facility}
                        </span>{" "}
                      </div>
                    )}
                  />{" "}
                </section>{" "}
              </div>
            )}{" "}
            {/* GALLERY TAB */}{" "}
            {activeTab === "Gallery" && (
              <div className="space-y-8">
                {" "}
                {Array.isArray(college.photos) && college.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {" "}
                    {college.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="h-48 rounded-card overflow-hidden border border-border-subtle bg-brand-bg shadow-xs cursor-pointer"
                        onClick={() => setLightboxImageIndex(idx)}
                      >
                        {" "}
                        <img
                          src={resolveAssetUrl(photo)}
                          alt={`${college.name} gallery ${idx + 1}`}
                          className="w-full h-full object-cover hover:-translate-y-[1px] active:scale-[0.97] transition duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1541339907198-e08756dedf3f";
                          }}
                        />{" "}
                      </div>
                    ))}{" "}
                  </div>
                ) : (
                  <div className="bg-transparent rounded-card p-16 text-center flex flex-col items-center mt-8">
                    {" "}
                    <div className="w-12 h-12 mb-4 text-[#5B5B63]/60">
                      {" "}
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {" "}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />{" "}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />{" "}
                      </svg>{" "}
                    </div>{" "}
                    <p className="text-[#0D0D12] text-lg font-bold mb-1">
                      No Picture
                    </p>{" "}
                  </div>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* RIGHT COLUMN (SIDEBAR) */}{" "}
          <div className="w-full lg:w-[320px] shrink-0">
            {" "}
            <div className="sticky top-28 space-y-6 z-[1]">
              {" "}
              {/* Admission Inquiry */}{" "}
              <div className="bg-white border border-border-subtle rounded-card p-6 shadow-card">
                {" "}
                <h3 className="text-lg font-bold text-[#0D0D12] mb-2">
                  Admission Inquiry
                </h3>{" "}
                <p className="text-xs text-text-muted mb-6 leading-relaxed">
                  {" "}
                  Get detailed information about admission dates and fee
                  structures.{" "}
                </p>{" "}
                <button
                  onClick={() => openApplyModal(college)}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-card mb-3 hover:bg-[#0D0D12] transition-colors duration-200 transition-colors shadow-card shadow-brand-bg"
                >
                  {" "}
                  Apply Now{" "}
                </button>{" "}
                {college.brochure ? (
                  <a
                    href={college.brochure}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-brand-bg text-primary font-semibold py-3 rounded-card flex items-center justify-center gap-2 hover:bg-[#f8eeda] transition-colors border border-border-subtle text-sm"
                  >
                    {" "}
                    <FaDownload className="text-sm" /> Download Brochure{" "}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full bg-brand-bg text-text-muted font-semibold py-3 rounded-card flex items-center justify-center gap-2 cursor-not-allowed text-sm"
                  >
                    {" "}
                    <FaDownload className="text-sm" /> Brochure N/A{" "}
                  </button>
                )}{" "}
              </div>{" "}
              {/* Map View */}{" "}
              <div className="bg-white border border-border-subtle rounded-card p-3 shadow-card">
                {" "}
                {googleMapsEmbedUrl && googleMapsOpenUrl ? (
                  <a
                    href={googleMapsOpenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                    aria-label="Open location in Google Maps"
                  >
                    {" "}
                    <div className="relative w-full h-[150px] overflow-hidden rounded-card mb-3">
                      {" "}
                      <iframe
                        title={`${college.name} location map`}
                        src={googleMapsEmbedUrl}
                        className="h-full w-full border-0 pointer-events-none"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />{" "}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                        {" "}
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-primary shadow-card opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {" "}
                          Open in Google Maps{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </a>
                ) : (
                  <div className="w-full h-[150px] bg-brand-bg rounded-card flex items-center justify-center mb-3">
                    {" "}
                    <div className="flex items-center gap-2 text-text-muted font-medium text-sm">
                      {" "}
                      <FaMapMarkerAlt /> Map View{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                <p className="text-[10px] text-text-muted text-center leading-relaxed px-2 pb-2 break-words break-all">
                  {" "}
                  {displayAddress || "N/A"}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-white/95 backdrop-blur-md p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden shadow-glass-lg">
          {" "}
          <button
            type="button"
            onClick={() => openApplyModal(college)}
            className="w-full bg-primary text-white font-semibold py-3.5 min-h-[48px] rounded-card hover:bg-[#0D0D12] transition-colors shadow-card"
          >
            {" "}
            Apply Now{" "}
          </button>{" "}
        </div>{" "}
        <WriteReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          collegeId={college._id}
          collegeName={college.name}
        />{" "}
      </div>{" "}
    </>
  );
}

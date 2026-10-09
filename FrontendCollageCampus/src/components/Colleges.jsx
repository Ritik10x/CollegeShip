import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import { useColleges } from "../context/CollegesContext";
import { useUser } from "../context/UserContext";
import { resolveAssetUrl } from "../lib/api";
import { COLLEGE_IMAGE_FALLBACK } from "../lib/assets";
import { getCollegeDisplayAddress } from "../lib/collegeMaps";
import LazyImage from "./LazyImage";
import Reveal from "./Reveal";
function getCardsPerView(width) {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}
export default function Colleges() {
  const { openApplyModal } = useUser();
  const { featuredColleges: colleges, loading } = useColleges();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(() =>
    typeof window !== "undefined" ? getCardsPerView(window.innerWidth) : 1,
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [colleges.length]);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView(window.innerWidth));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const maxIndex = Math.max(0, colleges.length - cardsPerView);
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex, cardsPerView]);
  useEffect(() => {
    if (colleges.length <= cardsPerView || isHovered || loading) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [colleges.length, cardsPerView, maxIndex, isHovered, loading]);
  const goNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };
  const goPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };
  const slideWidth = useMemo(() => 100 / cardsPerView, [cardsPerView]);
  if (!loading && colleges.length === 0) {
    return null;
  }
  return (
    <div className="py-12 sm:py-16 glass-section">
      {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {" "}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
          <Reveal from="left">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0D0D12] mb-2">
                <span className="text-accent">Top</span> Rated Campuses
              </h2>
              <p className="text-sm sm:text-base text-text-muted max-w-xl">
                Discover highly-rated institutions consistently praised by
                students.
              </p>
            </div>
          </Reveal>
          <Reveal from="right" delay={100}>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {" "}
            {colleges.length > cardsPerView && (
              <div className="flex gap-2">
                {" "}
                <button
                  onClick={goPrev}
                  className="w-11 h-11 rounded-full glass-chip border border-brand-border flex items-center justify-center text-text-muted hover:text-accent transition-colors duration-200 hover:border-primary transition-colors duration-200 transition-all duration-200 shadow-card hover:shadow-card"
                  aria-label="Previous colleges"
                >
                  {" "}
                  <FaChevronLeft size={14} />{" "}
                </button>{" "}
                <button
                  onClick={goNext}
                  className="w-11 h-11 rounded-full glass-chip border border-brand-border flex items-center justify-center text-text-muted hover:text-accent transition-colors duration-200 hover:border-primary transition-colors duration-200 transition-all duration-200 shadow-card hover:shadow-card"
                  aria-label="Next colleges"
                >
                  {" "}
                  <FaChevronRight size={14} />{" "}
                </button>{" "}
              </div>
            )}{" "}
            <Link
              to="/explore"
              className="inline-flex items-center px-4 sm:px-5 py-2.5 text-sm font-medium text-text-main glass-chip border border-brand-border rounded-lg hover:bg-brand-bg/80 transition-colors duration-200 hover:text-accent transition-colors duration-200 transition-colors duration-200"
            >
              {" "}
              View All →{" "}
            </Link>
          </div>
          </Reveal>
        </div>
        <Reveal from="up" delay={140}>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {" "}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {" "}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="glass-card overflow-hidden animate-pulse"
                >
                  {" "}
                  <div className="h-44 sm:h-48 bg-gray-200"></div>{" "}
                  <div className="p-5">
                    {" "}
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>{" "}
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>{" "}
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          ) : (
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * slideWidth}%)`,
              }}
            >
              {" "}
              {colleges.map((college) => {
                const accreditation = Array.isArray(college.accreditation)
                  ? college.accreditation[0]
                  : college.accreditation;
                return (
                  <div
                    key={college._id}
                    className="shrink-0 px-2 sm:px-3"
                    style={{ width: `${slideWidth}%` }}
                  >
                    {" "}
                    <div className="glass-card glass-card-hover overflow-hidden transition-all duration-150 ease-in-out group h-full">
                      {" "}
                      <div className="relative overflow-hidden h-44 sm:h-48">
                        <LazyImage
                          src={
                            college.thumbnail
                              ? resolveAssetUrl(college.thumbnail)
                              : COLLEGE_IMAGE_FALLBACK
                          }
                          alt={college.name}
                          className="w-full h-full object-cover group-hover:-translate-y-[1px] active:scale-[0.97] transition-transform duration-300"
                          fallback={COLLEGE_IMAGE_FALLBACK}
                        />
                        <div className="absolute inset-0 bg-transparent"></div>{" "}
                        <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 text-xs font-medium rounded-full">
                          {" "}
                          {college.type || "Campus"}{" "}
                        </span>{" "}
                        <div className="absolute top-3 right-3 glass-chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-sm shadow-card">
                          {" "}
                          <FaStar className="text-accent" size={12} />{" "}
                          <span className="text-xs font-medium">
                            {" "}
                            {college.averageReview
                              ? Number(college.averageReview).toFixed(1)
                              : "N/A"}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="p-4 sm:p-5">
                        {" "}
                        <h3 className="font-semibold text-base sm:text-lg text-[#0D0D12] line-clamp-2 mb-2 leading-tight break-all break-words">
                          {" "}
                          {college.name}{" "}
                        </h3>{" "}
                        <div className="flex items-center text-text-muted text-sm mb-4">
                          {" "}
                          <FaMapMarkerAlt
                            size={12}
                            className="mr-2 text-text-muted shrink-0"
                          />{" "}
                          <span className="line-clamp-1 break-all break-words">
                            {" "}
                            {getCollegeDisplayAddress(college.location) ||
                              "Location N/A"}{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="mb-5">
                          {" "}
                          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-1">
                            {" "}
                            Accreditation{" "}
                          </p>{" "}
                          <p className="text-sm font-semibold text-text-main break-all break-words line-clamp-1">
                            {accreditation || "N/A"}
                          </p>{" "}
                        </div>{" "}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {" "}
                          <button
                            onClick={() => openApplyModal(college)}
                            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-[#001f4d] transition-colors duration-200 min-h-11"
                          >
                            {" "}
                            Apply Now{" "}
                          </button>{" "}
                          <Link
                            to={`/college/${college._id}`}
                            className="flex-1 border border-primary text-primary py-3 px-4 rounded-lg font-medium text-sm hover:bg-background transition-colors duration-200 text-center min-h-11 flex items-center justify-center"
                          >
                            {" "}
                            Details{" "}
                          </Link>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>
                );
              })}{" "}
            </div>
          )}{" "}
          {colleges.length > cardsPerView && (
            <div className="flex justify-center mt-8 gap-2">
              {" "}
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-200 min-w-2 ${index === currentIndex ? "bg-primary w-6" : "bg-gray-300 hover:bg-gray-400 w-2"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}{" "}
            </div>
          )}{" "}
        </div>
        </Reveal>
      </div>{" "}
    </div>
  );
}

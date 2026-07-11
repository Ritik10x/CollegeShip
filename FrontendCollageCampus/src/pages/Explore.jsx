import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaChevronDown,
  FaUniversity,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { openAuthModal } from "../components/AuthModal";
import { auth } from "../firebase";
import { resolveAssetUrl } from "../lib/api";
import { COLLEGE_IMAGE_FALLBACK } from "../lib/assets";
import { getCollegeDisplayAddress } from "../lib/collegeMaps";
import { FIELD_LIMITS } from "../lib/fieldLimits";
import { useColleges } from "../context/CollegesContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import LazyImage from "../components/LazyImage";
import PageSEO from "../components/PageSEO";
import Reveal from "../components/Reveal";
import CollegeShipLoader from "../components/CollegeShipLoader";
import { ROUTE_SEO, formatPageTitle, absoluteUrl } from "../lib/seo";

const cleanCourseName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

const isEquivalentCourse = (courseA, courseB) => {
  const cleanA = cleanCourseName(courseA);
  const cleanB = cleanCourseName(courseB);
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;
  const getParts = (str) => {
    const parts = [str];
    const parenMatch = str.match(/\(([^)]+)\)/);
    if (parenMatch) {
      parts.push(parenMatch[1]);
      parts.push(str.replace(/\([^)]+\)/, "").trim());
    }
    return parts.map(cleanCourseName).filter(Boolean);
  };
  const partsA = getParts(courseA);
  const partsB = getParts(courseB);
  return partsA.some((pA) => partsB.includes(pA));
};

export default function Explore() {
  const { colleges, loading } = useColleges();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [collegeType, setCollegeType] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef(null);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const { favorites, toggleFavorite, openApplyModal } = useUser();

  useEffect(() => {
    function handleClickOutside(event) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dynamicCourses = React.useMemo(() => {
    const courseMap = new Map();
    colleges.forEach(college => {
      if (Array.isArray(college.courses)) {
        college.courses.forEach(course => {
          let name = "";
          if (typeof course === 'string') {
            name = course.trim();
          } else if (course && typeof course === 'object' && course.name) {
            name = course.name.trim();
          }
          if (name) {
            const normalized = cleanCourseName(name);
            if (normalized) {
              if (!courseMap.has(normalized)) {
                courseMap.set(normalized, name);
              } else {
                const existing = courseMap.get(normalized);
                if (name !== existing) {
                  const newHasParens = name.includes('(');
                  const existingHasParens = existing.includes('(');
                  if (newHasParens && !existingHasParens) {
                    courseMap.set(normalized, name);
                  } else if (!newHasParens && existingHasParens) {
                  } else if (name.length > existing.length) {
                    courseMap.set(normalized, name);
                  }
                }
              }
            }
          }
        });
      }
    });
    return Array.from(courseMap.values()).sort((a, b) => a.localeCompare(b));
  }, [colleges]);

  const filteredColleges = useMemo(() => colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) || (college.location?.city && college.location.city.toLowerCase().includes(searchQuery.toLowerCase())) || (college.courses && college.courses.some(course => {
      const courseName = typeof course === 'string' ? course : (course?.name || "");
      const courseSpec = typeof course === 'string' ? "" : (course?.specialization || "");
      const normQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normName = courseName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normSpec = courseSpec.toLowerCase().replace(/[^a-z0-9]/g, "");
      return courseName.toLowerCase().includes(searchQuery.toLowerCase()) || courseSpec.toLowerCase().includes(searchQuery.toLowerCase()) || (normQuery && (normName.includes(normQuery) || normSpec.includes(normQuery)));
    }));
    const matchesCourse = selectedCourse === "" || (college.courses && college.courses.some(course => {
      const courseName = typeof course === 'string' ? course : (course?.name || "");
      return isEquivalentCourse(courseName, selectedCourse);
    }));
    const matchesLocation = selectedLocation === "" || college.location?.city?.toLowerCase().includes(selectedLocation.toLowerCase()) || getCollegeDisplayAddress(college.location).toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = collegeType === "" || college.type === collegeType;
    return matchesSearch && matchesCourse && matchesLocation && matchesType;
  }), [colleges, searchQuery, selectedCourse, selectedLocation, collegeType]);

  const filterKey = `${searchQuery}|${selectedCourse}|${selectedLocation}|${collegeType}`;
  const { visibleCount, sentinelRef, hasMore } = useInfiniteScroll(
    filteredColleges.length,
    { pageSize: 12, resetKey: filterKey },
  );
  const visibleColleges = filteredColleges.slice(0, visibleCount);
  const exploreSeo = ROUTE_SEO["/explore"];
  const seoTitle = searchQuery.trim()
    ? formatPageTitle(`Colleges & Programs for "${searchQuery.trim()}"`)
    : formatPageTitle(exploreSeo.title);
  const seoDescription = searchQuery.trim()
    ? `Find colleges and university programs matching "${searchQuery.trim()}" in India. Compare courses, fees, admissions, reviews, and apply online on CollegeShip.`
    : exploreSeo.description;
  const seoKeywords = [searchQuery.trim(), selectedCourse, selectedLocation, collegeType, exploreSeo.keywords]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageSEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={absoluteUrl("/explore")}
        ogImage={exploreSeo.ogImage}
        jsonLd={exploreSeo.jsonLd}
      />
    <div className={`${isDashboard ? 'px-4 sm:px-6' : 'glass-section min-h-screen pt-24 pb-12'}`}>
      <div className={`${isDashboard ? '' : 'max-w-7xl mx-auto px-4 sm:px-6'}`}>
        <Reveal className={isDashboard ? "mb-8" : "mb-8 mt-6"}>
          <h1 className="text-2xl sm:text-[40px] font-bold text-[#0D0D12] leading-tight">Explore Top Colleges</h1>
          <p className="text-sm text-text-muted mt-2">Find the perfect institution for your future career.</p>
        </Reveal>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <div className="glass-card p-5 sm:p-6 lg:sticky lg:top-28">
              <div className="flex justify-between items-center cursor-pointer lg:cursor-default" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
                <h2 className="font-bold text-lg">Advanced Filters</h2>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setIsMobileFiltersOpen(!isMobileFiltersOpen); }} className="lg:hidden text-primary text-xs font-bold bg-brand-bg hover:bg-brand-bg/80 transition-colors duration-200 px-3 py-2.5 min-h-[44px] rounded-full transition-all flex items-center gap-1">
                  {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
                  <span className={`transition-transform duration-200 ${isMobileFiltersOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>
              <div className={`space-y-6 lg:block transition-all duration-150 ease-in-out ${isMobileFiltersOpen ? 'block mt-6' : 'hidden lg:mt-6'}`}>
                <div>
                  <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest">Location</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" placeholder="Search location..." value={selectedLocation} maxLength={FIELD_LIMITS.location} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border-subtle bg-brand-bg/50 focus:bg-white focus:outline-none focus:border-primary transition-all text-sm" />
                  </div>
                </div>
                <div className="relative" ref={courseDropdownRef}>
                  <label className="block text-[10px] font-extrabold text-text-muted mb-2 uppercase tracking-[0.15em]">Course Type</label>
                  <div onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)} className={`flex items-center justify-between w-full px-4 py-2.5 rounded-full border transition-all cursor-pointer glass-input ${isCourseDropdownOpen ? 'border-accent ring-1 ring-accent/20' : 'border-accent hover:bg-white/70 transition-colors duration-200'}`}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FaUniversity className="text-accent/70 shrink-0 text-sm" />
                      <span className={`text-sm truncate ${selectedCourse ? 'text-[#0D0D12] font-medium' : 'text-text-muted'}`}>{selectedCourse || "Select course"}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <div className="h-5 w-[1px] bg-gray-200"></div>
                      <FaChevronDown className={`text-text-muted text-[10px] transition-transform duration-200 ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  {isCourseDropdownOpen && (
                    <div className="absolute z-[100] w-full mt-1.5 glass-card overflow-hidden">
                      <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                        <div className={`px-5 py-3 text-sm cursor-pointer transition-colors hover:bg-brand-bg/80 transition-colors duration-200 ${selectedCourse === "" ? 'text-primary bg-brand-bg font-semibold' : 'text-text-muted'}`} onClick={() => { setSelectedCourse(""); setIsCourseDropdownOpen(false); }}>All Courses</div>
                        {dynamicCourses.map((course, idx) => (
                          <div key={idx} className={`px-5 py-3.5 text-[13px] border-b border-gray-50 last:border-0 cursor-pointer transition-colors hover:bg-brand-bg/80 transition-colors duration-200 ${selectedCourse === course ? 'text-primary bg-brand-bg font-semibold' : 'text-[#0D0D12]'}`} onClick={() => { setSelectedCourse(course); setIsCourseDropdownOpen(false); }}>{course}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted mb-2 uppercase tracking-widest">College Type</label>
                  <div className="relative">
                    <select value={collegeType} onChange={(e) => setCollegeType(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-card border border-border-subtle bg-brand-bg/50 focus:bg-white focus:outline-none focus:border-accent transition-all text-sm appearance-none cursor-pointer">
                      <option value="">All Types</option>
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                      <option value="Government">Government</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">🏛️</div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setSelectedCourse(""); setSearchQuery(""); setSelectedLocation(""); setCollegeType(""); }} className="w-full py-2 text-xs font-bold text-primary hover:text-accent transition-colors duration-200 uppercase tracking-widest">Clear All Filters</button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-3/4">
            <div className="glass-card p-2 mb-8 flex items-center transition-all focus-within:shadow-card">
              <FaSearch className="text-text-muted ml-4 mr-3" />
              <input type="text" placeholder="Search colleges by name, city or specialty..." value={searchQuery} maxLength={FIELD_LIMITS.search} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-2.5 focus:outline-none text-[#0D0D12] bg-transparent" />
            </div>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-text-muted font-medium">Showing <span className="text-[#0D0D12] font-bold">{filteredColleges.length}</span> colleges {selectedCourse && <span> for <span className="text-primary font-bold">{selectedCourse}</span></span>}</p>
            </div>
            {loading ? (
              <CollegeShipLoader label="Finding colleges for you…" />
            ) : filteredColleges.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-[#0D0D12] mb-2">No colleges found</h3>
                <p className="text-text-muted">Try adjusting your filters or search terms.</p>
                <button onClick={() => { setSelectedCourse(""); setSearchQuery(""); setSelectedLocation(""); }} className="mt-6 px-6 py-2 bg-primary text-white rounded-card font-semibold hover:bg-[#0D0D12] transition-colors duration-200">Reset Filters</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {visibleColleges.map((college, index) => (
                  <Reveal
                    key={college._id}
                    from={index % 2 === 0 ? "left" : "right"}
                    delay={(index % 4) * 70}
                    className="h-full"
                  >
                  <div className="glass-card overflow-hidden flex flex-col h-full hover:-translate-y-[1px] transition-all duration-150 ease-in-out">
                    <div className="relative h-48 w-full bg-brand-bg">
                      {college.thumbnail ? (
                        <LazyImage
                          src={resolveAssetUrl(college.thumbnail)}
                          alt={college.name}
                          className="w-full h-full object-cover"
                          fallback={COLLEGE_IMAGE_FALLBACK}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#EAE6E0] flex flex-col items-center justify-center text-text-muted font-bold uppercase tracking-widest text-xs select-none p-4 text-center">
                          <span>no picture</span>
                          <span className="text-[9px] text-[#5B5B63]/60 font-medium normal-case">(Thumbnail N/A)</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/5"></div>
                      <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-card shadow-accent/20">{college.type || "N/A"}</div>
                      <button onClick={(e) => { e.preventDefault(); toggleFavorite(college); }} className="absolute top-4 right-4 flex min-w-[44px] min-h-[44px] items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:scale-110 active:scale-[0.98]" aria-label="Toggle favorite">
                        {favorites.some((f) => (f._id || f.id) === college._id) ? (
                          <FaHeart className="text-2xl text-[#B3261E] fill-[#B3261E] drop-shadow-card" />
                        ) : (
                          <FaHeart className="text-2xl text-white fill-white drop-shadow-card" />
                        )}
                      </button>
                      <div className="absolute bottom-4 right-4 glass-chip text-[#0D0D12] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-card">
                        <FaStar className="text-[#C9A227] text-[10px]" />
                        {college.averageReview ? Number(college.averageReview).toFixed(1) : "N/A"}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-[18px] font-bold text-[#0D0D12] mb-1.5 leading-tight line-clamp-2 min-h-[44px] break-words">{college.name}</h3>
                      <div className="flex items-start gap-1.5 text-text-muted text-xs mb-4">
                        <FaMapMarkerAlt className="mt-0.5 shrink-0 text-text-muted" />
                        <span className="line-clamp-1 break-all break-words">{getCollegeDisplayAddress(college.location) || "N/A"}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {Array.isArray(college.courses) && college.courses.slice(0, 3).map((course, idx) => {
                          const isString = typeof course === 'string';
                          const displayName = isString ? course.split(' (')[0] : (course.name || "N/A");
                          return (
                            <span key={idx} className="bg-brand-bg text-[10px] font-semibold text-text-muted px-2 py-0.5 rounded-full border border-border-subtle">{displayName}</span>
                          );
                        })}
                        {Array.isArray(college.courses) && college.courses.length > 3 && (
                          <span className="text-[10px] font-semibold text-primary py-0.5">+{college.courses.length - 3} more</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                        <Link to={`/college/${college._id}`} className="flex-1 bg-brand-bg text-primary px-3 py-2.5 rounded-card font-bold text-[13px] text-center hover:bg-brand-bg/80 transition-colors duration-200">Details</Link>
                        <button onClick={() => { if (!auth.currentUser) { openAuthModal('signup'); return; } openApplyModal(college); }} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-card font-bold text-[13px] text-center hover:bg-[#0D0D12] transition-colors duration-200 hover:shadow-card">Apply Now</button>
                      </div>
                    </div>
                  </div>
                  </Reveal>
                ))}
                {hasMore && (
                  <div ref={sentinelRef} className="col-span-full py-8 text-center text-sm text-text-muted">
                    Loading more colleges...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

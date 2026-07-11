import React, { useMemo, useState } from "react";
import {
  FaHeart,
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaTrashAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { resolveAssetUrl } from "../lib/api";
import { COLLEGE_IMAGE_FALLBACK } from "../lib/assets";
import { getCollegeDisplayAddress } from "../lib/collegeMaps";
import { FIELD_LIMITS } from "../lib/fieldLimits";
import LazyImage from "../components/LazyImage";

const getCollegeId = (college) => college?._id || college?.id || college?.collegeId;

export default function Favorites() {
  const context = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  if (!context) {
    return <div className="p-8">Error: User context not available</div>;
  }

  const { favorites = [], toggleFavorite, user, isAuthLoading } = context;
  const safeFavorites = Array.isArray(favorites) ? favorites.filter(Boolean) : [];

  const filteredFavorites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return safeFavorites;

    return safeFavorites.filter((college) => {
      const courseText = Array.isArray(college.courses)
        ? college.courses
            .map((course) =>
              typeof course === "string"
                ? course
                : `${course?.name || ""} ${course?.specialization || ""}`,
            )
            .join(" ")
        : "";

      return [
        college.name,
        college.type,
        college.location?.city,
        getCollegeDisplayAddress(college.location),
        courseText,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [safeFavorites, searchQuery]);

  if (isAuthLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="glass-card p-16 sm:p-24 flex flex-col items-center justify-center text-center space-y-6 shadow-card">
          <p className="text-text-muted font-medium text-lg">
            Loading your favorites...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="glass-card p-16 sm:p-24 flex flex-col items-center justify-center text-center space-y-8 shadow-card">
          <div className="w-24 h-24 bg-brand-bg rounded-full flex items-center justify-center text-primary">
            <FaHeart className="text-4xl opacity-25" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-[#0D0D12]">
              Please login first
            </h3>
            <p className="text-text-muted font-medium max-w-sm mx-auto leading-relaxed">
              Login to view and save your favorite colleges.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0D0D12] leading-tight">
            Your Collection
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            Keep track of the institutions that inspire you the most.
          </p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search in favorites..."
              maxLength={FIELD_LIMITS.search}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-11 pr-4 py-3 glass-input border border-border-subtle rounded-card focus:border-accent focus:outline-none transition-all text-sm font-medium shadow-card"
            />
          </div>
        </div>
      </div>

      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredFavorites.map((college, index) => {
            const collegeId = getCollegeId(college);
            const detailPath = collegeId ? `/college/${collegeId}` : "/explore";
            const displayAddress =
              getCollegeDisplayAddress(college.location) ||
              college.location?.city ||
              "Location N/A";

            return (
              <div
                key={collegeId || `${college.name || "favorite"}-${index}`}
                className="glass-card overflow-hidden hover:shadow-card transition-all duration-300 group flex flex-col h-full hover:-translate-y-[3px]"
              >
                <div className="relative h-48 w-full bg-brand-bg">
                  <LazyImage
                    src={college.thumbnail ? resolveAssetUrl(college.thumbnail) : COLLEGE_IMAGE_FALLBACK}
                    alt={college.name || "Favorite college"}
                    className="w-full h-full object-cover"
                    fallback={COLLEGE_IMAGE_FALLBACK}
                  />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-card shadow-accent/20">
                    {college.type || "N/A"}
                  </div>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      toggleFavorite(college);
                    }}
                    className="absolute top-4 right-4 transition-all duration-150 ease-in-out hover:scale-110 active:scale-90"
                    title="Remove from favorites"
                  >
                    <FaHeart className="text-2xl text-[#B3261E] fill-[#B3261E] drop-shadow-card" />
                  </button>
                  <div className="absolute bottom-4 right-4 glass-chip text-[#0D0D12] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-card">
                    <FaStar className="text-accent text-[10px]" />
                    {college.averageReview ? Number(college.averageReview).toFixed(1) : "N/A"}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#0D0D12] line-clamp-2 group-hover:text-accent transition-colors duration-200 mb-1 break-words">
                      {college.name || "Unnamed College"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
                      <FaMapMarkerAlt className="text-[10px] shrink-0" />
                      <span className="line-clamp-1 break-words">{displayAddress}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(college.courses) && college.courses.length > 0 ? (
                        college.courses.slice(0, 3).map((course, idx) => (
                          <span
                            key={idx}
                            className="bg-brand-bg text-[10px] font-bold text-text-muted px-2.5 py-1 rounded-lg border border-border-subtle"
                          >
                            {typeof course === "string"
                              ? course.split(" (")[0]
                              : course?.name || "Course"}
                          </span>
                        ))
                      ) : (
                        <span className="bg-brand-bg text-[10px] font-bold text-text-muted px-2.5 py-1 rounded-lg border border-border-subtle">
                          Courses N/A
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Link
                      to={detailPath}
                      className="flex-1 bg-primary text-white py-3 rounded-card font-bold text-sm text-center hover:bg-[#0D0D12] transition-all shadow-card shadow-brand-bg active:scale-[0.98]"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => toggleFavorite(college)}
                      className="p-3 status-danger rounded-card hover:bg-[#B3261E]/15 transition-all shadow-card active:scale-[0.98]"
                      title="Remove from favorites"
                    >
                      <FaTrashAlt className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-16 sm:p-24 flex flex-col items-center justify-center text-center space-y-8 shadow-card">
          <div className="w-24 h-24 bg-brand-bg rounded-full flex items-center justify-center text-primary">
            <FaHeart className="text-4xl opacity-25" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-[#0D0D12]">
              {safeFavorites.length > 0 ? "No matching favorites" : "Your collection is empty"}
            </h3>
            <p className="text-text-muted font-medium max-w-sm mx-auto leading-relaxed">
              {safeFavorites.length > 0
                ? "Try a different search term."
                : "Start exploring colleges and click the heart icon to save the institutions you're interested in."}
            </p>
          </div>
          <Link
            to="/explore"
            className="bg-primary text-white px-10 py-4 rounded-card font-bold hover:bg-[#0D0D12] transition-all shadow-card shadow-brand-bg hover:-translate-y-[1px] active:scale-[0.98]"
          >
            Start Exploring
          </Link>
        </div>
      )}
    </div>
  );
}
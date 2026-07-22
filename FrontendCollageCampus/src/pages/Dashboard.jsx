import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaClipboardList,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { resolveAssetUrl } from "../lib/api";
export default function Dashboard() {
  const { favorites } = useUser();
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  useEffect(() => {
    const fetchApplications = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingApps(false);
        return;
      }
      try {
        const cacheKey = `collegeship_apps_${user.uid}`;
        const cacheTimeKey = `collegeship_apps_time_${user.uid}`;
        const now = new Date().getTime();
        const ttl = 5 * 60 * 1000; // 5 minutes

        const cachedData = sessionStorage.getItem(cacheKey);
        const cachedTime = sessionStorage.getItem(cacheTimeKey);

        if (cachedData && cachedTime && now - parseInt(cachedTime, 10) < ttl) {
          setApplications(JSON.parse(cachedData));
          setLoadingApps(false);
          return;
        }

        const q = query(
          collection(db, "applications"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null,
        }));
        
        sessionStorage.setItem(cacheKey, JSON.stringify(apps));
        sessionStorage.setItem(cacheTimeKey, now.toString());
        
        setApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApplications();
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {" "}
      <div>
        {" "}
        <h1 className="text-2xl sm:text-[32px] font-bold text-[#0D0D12] leading-tight">
          Student Dashboard
        </h1>{" "}
        <p className="text-sm text-text-muted mt-1 font-medium">
          Welcome back! Here's your college application progress.
        </p>{" "}
      </div>{" "}
      <div className="space-y-8">
        {" "}
        {/* Main Content */}{" "}
        <div className="space-y-8">
          {" "}
          {/* Recommended Colleges Section */}{" "}
          <section>
            {" "}
            <div className="flex justify-between items-center mb-4">
              {" "}
              <h3 className="text-lg font-bold text-[#0D0D12]">
                Recommended Colleges
              </h3>{" "}
              <Link
                to="/dashboard/explore"
                className="text-sm font-bold text-primary hover:text-accent transition-colors duration-200 uppercase tracking-wider"
              >
                View all
              </Link>{" "}
            </div>{" "}
            <p className="text-sm text-text-muted mb-6 font-medium">
              Recommendations personalized for you based on your academic
              interests, budget, and location.
            </p>{" "}
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {" "}
                {favorites.slice(0, 4).map((college) => (
                  <Link
                    key={college._id}
                    to={`/college/${college._id}`}
                    className="glass-card p-4 shadow-card hover:shadow-card transition-all group border-l-4 border-l-accent"
                  >
                    {" "}
                    <div className="flex flex-col gap-3">
                      {" "}
                      <div className="w-full h-24 rounded-card overflow-hidden shrink-0 bg-brand-bg">
                        {" "}
                        <img
                          src={resolveAssetUrl(college.thumbnail)}
                          className="w-full h-full object-cover"
                          alt=""
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="min-w-0">
                        {" "}
                        <h4 className="font-bold text-[#0D0D12] text-sm truncate group-hover:text-accent transition-colors duration-200 transition-colors">
                          {college.name}
                        </h4>{" "}
                        <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1">
                          {" "}
                          <FaMapMarkerAlt className="text-[8px]" />{" "}
                          <span className="truncate">
                            {college.location?.city}
                          </span>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-3 mt-2">
                          {" "}
                          <div className="flex items-center gap-1">
                            {" "}
                            <FaStar className="text-accent text-[10px]" />{" "}
                            <span className="text-[10px] font-bold text-text-main">
                              {college.averageReview
                                ? Number(college.averageReview).toFixed(1)
                                : "N/A"}
                            </span>{" "}
                          </div>{" "}
                          <span className="text-[9px] font-bold text-accent bg-brand-bg px-2 py-0.5 rounded uppercase">
                            {college.type}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </Link>
                ))}{" "}
              </div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-card shadow-gray-100">
                {" "}
                <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-[#5B5B63]/60">
                  {" "}
                  <FaSearch className="text-2xl" />{" "}
                </div>{" "}
                <p className="text-text-muted font-medium italic">
                  No recommendations available at this time.
                </p>{" "}
              </div>
            )}{" "}
          </section>{" "}
          {/* Favorites College Section */}{" "}
          <section>
            {" "}
            <div className="flex justify-between items-center mb-4">
              {" "}
              <h3 className="text-lg font-bold text-[#0D0D12]">
                Favorites College
              </h3>{" "}
              <Link
                to="/dashboard/favorites"
                className="text-sm font-bold text-primary hover:text-accent transition-colors duration-200 uppercase tracking-wider"
              >
                View all
              </Link>{" "}
            </div>{" "}
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {" "}
                {favorites.slice(0, 2).map((college) => (
                  <Link
                    key={college._id}
                    to={`/college/${college._id}`}
                    className="glass-card p-4 shadow-card hover:shadow-card transition-all group border-l-4 border-l-accent"
                  >
                    {" "}
                    <div className="flex gap-4">
                      {" "}
                      <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 bg-brand-bg">
                        {" "}
                        <img
                          src={resolveAssetUrl(college.thumbnail)}
                          className="w-full h-full object-cover"
                          alt=""
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop";
                          }}
                        />{" "}
                      </div>{" "}
                      <div className="min-w-0">
                        {" "}
                        <h4 className="font-bold text-[#0D0D12] text-sm truncate group-hover:text-accent transition-colors duration-200 transition-colors">
                          {college.name}
                        </h4>{" "}
                        <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1">
                          {" "}
                          <FaMapMarkerAlt className="text-[8px]" />{" "}
                          <span className="truncate">
                            {college.location?.city}
                          </span>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-3 mt-2">
                          {" "}
                          <div className="flex items-center gap-1">
                            {" "}
                            <FaStar className="text-accent text-[10px]" />{" "}
                            <span className="text-[10px] font-bold text-text-main">
                              {college.averageReview
                                ? Number(college.averageReview).toFixed(1)
                                : "N/A"}
                            </span>{" "}
                          </div>{" "}
                          <span className="text-[9px] font-bold text-accent bg-brand-bg px-2 py-0.5 rounded uppercase">
                            {college.type}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                  </Link>
                ))}{" "}
              </div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-card shadow-gray-100 relative overflow-hidden group">
                {" "}
                <div className="absolute top-0 left-0 w-full h-1 bg-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>{" "}
                <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-brand-bg">
                  {" "}
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />{" "}
                  </svg>{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <p className="text-[#0D0D12] font-bold">
                    No college saved yet.
                  </p>{" "}
                  <Link
                    to="/dashboard/explore"
                    className="text-primary font-bold hover:underline"
                  >
                    Explore Colleges
                  </Link>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </section>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

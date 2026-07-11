import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaUniversity,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "applications"),
      where("userId", "==", auth.currentUser.uid),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const apps = [];
        snap.forEach((d) => apps.push({ id: d.id, ...d.data() }));
        apps.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching user applications:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);
  const filtered = applications.filter((app) => {
    const qStr = search.toLowerCase();
    const matchesSearch =
      !qStr ||
      app.universityName?.toLowerCase().includes(qStr) ||
      app.course?.toLowerCase().includes(qStr);
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const getStatusDisplay = (status) => {
    switch (status) {
      case "Accepted":
        return {
          label: "Accepted",
          icon: FaCheckCircle,
          colors: "bg-[#2D8A56]/10 text-green-700 border-[#2D8A56]/30",
        };
      case "Rejected":
        return {
          label: "Rejected",
          icon: FaTimesCircle,
          colors: "status-danger border",
        };
      default:
        return {
          label: "Pending Processing",
          icon: FaClock,
          colors: "status-pending border",
        };
    }
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl sm:text-4xl font-bold text-[#0D0D12] leading-tight">
            My Applications
          </h1>{" "}
          <p className="text-text-muted mt-2 font-medium">
            Track and manage all your college applications in one place.
          </p>{" "}
        </div>{" "}
        <div className="flex gap-4 flex-wrap">
          {" "}
          <div className="relative group flex-1 sm:flex-none">
            {" "}
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />{" "}
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-auto pl-11 pr-4 py-3 bg-white border border-border-subtle rounded-card focus:border-accent focus:outline-none transition-all text-sm font-medium shadow-card"
            />{" "}
          </div>{" "}
          <div className="flex glass-card overflow-x-auto max-w-full">
            {" "}
            {["All", "Applied", "Accepted", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`shrink-0 px-4 py-3 min-h-[44px] text-xs font-bold transition-colors ${filterStatus === s ? "bg-primary text-white" : "text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"}`}
              >
                {" "}
                {s}{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          {" "}
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />{" "}
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-6 shadow-card">
          {" "}
          <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-brand-bg">
            {" "}
            <FaFileAlt className="text-3xl" />{" "}
          </div>{" "}
          <div className="space-y-2">
            {" "}
            <h3 className="text-xl font-bold text-[#0D0D12]">
              No applications yet
            </h3>{" "}
            <p className="text-text-muted text-sm max-w-xs mx-auto leading-relaxed font-medium">
              {" "}
              You haven't started any applications. Explore colleges and click
              "Apply Now" to get started.{" "}
            </p>{" "}
          </div>{" "}
          <Link
            to="/colleges"
            className="bg-primary text-white px-8 py-3 rounded-card font-bold hover:bg-[#0D0D12] transition-colors duration-200 transition-all shadow-card shadow-brand-bg"
          >
            {" "}
            Find Colleges{" "}
          </Link>{" "}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          {" "}
          <p className="text-text-muted font-medium">
            No applications match your search.
          </p>{" "}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {" "}
          {filtered.map((app) => {
            const statusConfig = getStatusDisplay(app.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={app.id}
                className="glass-card overflow-hidden hover:shadow-card transition-shadow group flex flex-col"
              >
                {" "}
                <div className="p-6 flex-1 space-y-4">
                  {" "}
                  <div className="flex justify-between items-start gap-4">
                    {" "}
                    <div className="w-12 h-12 rounded-card bg-brand-bg text-primary flex items-center justify-center shrink-0">
                      {" "}
                      <FaUniversity className="text-xl" />{" "}
                    </div>{" "}
                    <div
                      className={`px-3 py-1.5 rounded-card border flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${statusConfig.colors}`}
                    >
                      {" "}
                      <StatusIcon /> <span>{statusConfig.label}</span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-[#0D0D12] text-lg leading-tight mb-1">
                      {app.universityName || "College"}
                    </h3>{" "}
                    <p className="text-accent font-semibold text-sm">
                      {app.course || "Course"}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="bg-brand-bg p-5 border-t border-border-subtle flex justify-between items-center text-xs font-medium text-text-muted">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <FaCalendarAlt className="text-text-muted" />{" "}
                    <span>Applied on {formatDate(app.createdAt)}</span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>
      )}{" "}
    </div>
  );
}

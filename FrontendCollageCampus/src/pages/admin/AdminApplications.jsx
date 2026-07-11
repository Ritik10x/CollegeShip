import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaFileExcel,
  FaFilter,
  FaGraduationCap,
  FaPhone,
  FaSearch,
  FaTimesCircle,
  FaTrashAlt,
  FaUniversity,
  FaUser,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { auth, db } from "../../firebase";
import { apiUrl } from "../../lib/api";
import { FIELD_LIMITS } from "../../lib/fieldLimits";

const toDate = (ts) => {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  const date = new Date(ts);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (ts) => {
  const date = toDate(ts);
  if (!date) return "N/A";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const matchesDateFilter = (createdAt, dateFilter, selectedDate) => {
  if (dateFilter === "All") return true;

  const appliedAt = toDate(createdAt);
  if (!appliedAt) return false;

  const now = new Date();

  if (dateFilter === "Today") {
    return isSameDay(appliedAt, now);
  }

  if (dateFilter === "Week") {
    const weekStart = startOfDay(now);
    weekStart.setDate(weekStart.getDate() - 6);
    return appliedAt >= weekStart && appliedAt <= endOfDay(now);
  }

  if (dateFilter === "Month") {
    return (
      appliedAt.getFullYear() === now.getFullYear() &&
      appliedAt.getMonth() === now.getMonth()
    );
  }

  if (dateFilter === "Date") {
    if (!selectedDate) return true;
    const pickedDate = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(pickedDate.getTime()) || pickedDate > endOfDay(now)) {
      return false;
    }
    return isSameDay(appliedAt, pickedDate);
  }

  return true;
};

const dateFilterLabels = {
  All: "All dates",
  Today: "Today",
  Week: "Last 7 days",
  Month: "This month",
  Date: "Specific day",
};

const statusColors = {
  Applied: "status-pending border",
  Accepted: "status-success border",
  Rejected: "status-danger border",
};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const todayInputValue = formatInputDate(new Date());

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "applications"),
      (snap) => {
        const apps = [];
        snap.forEach((d) => apps.push({ id: d.id, ...d.data() }));
        apps.sort((a, b) => {
          const aTime = toDate(a.createdAt) || new Date(0);
          const bTime = toDate(b.createdAt) || new Date(0);
          return bTime - aTime;
        });
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching applications:", err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    setActionLoading(id + status);

    try {
      if (!auth.currentUser) throw new Error("Not logged in");

      const token = await auth.currentUser.getIdToken();
      const res = await fetch(apiUrl(`/api/admin/applications/${id}/status`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );

      if (data.emailSent) {
        console.log("Email sent successfully");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update status: " + err.message);
    }

    setActionLoading(null);
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Delete this application? This cannot be undone."))
      return;

    setActionLoading(id + "del");

    try {
      await deleteDoc(doc(db, "applications", id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete: " + err.message);
    }

    setActionLoading(null);
  };

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      app.userName?.toLowerCase().includes(q) ||
      app.userEmail?.toLowerCase().includes(q) ||
      app.universityName?.toLowerCase().includes(q) ||
      app.course?.toLowerCase().includes(q) ||
      app.userPhone?.includes(q);
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    const matchesDate = matchesDateFilter(app.createdAt, dateFilter, selectedDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportExcel = () => {
    const rows = filtered.map((app) => ({
      "Student Name": app.userName || "N/A",
      Email: app.userEmail || "N/A",
      Phone: app.userPhone || "N/A",
      Age: app.userAge || "N/A",
      College: app.universityName || "N/A",
      Course: app.course || "N/A",
      Status: app.status || "Applied",
      "Applied On": formatDate(app.createdAt),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, `CollegeShip_Applications_${Date.now()}.xlsx`);
  };

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("All");
    setDateFilter("All");
    setSelectedDate("");
  };

  const total = applications.length;
  const accepted = applications.filter((a) => a.status === "Accepted").length;
  const pending = applications.filter((a) => a.status === "Applied").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D0D12] tracking-tight">
            Applications
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review, accept or remove college applications from students.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-success hover:bg-[#246F45] text-white text-xs font-bold px-4 py-2.5 rounded-card shadow transition"
          >
            <FaFileExcel /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applied", value: total, color: "bg-primary" },
          { label: "Accepted", value: accepted, color: "bg-success" },
          { label: "Pending", value: pending, color: "bg-accent" },
          { label: "Rejected", value: rejected, color: "bg-error" },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.color} text-white rounded-card p-5 shadow-card`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">
              {s.label}
            </p>
            <p className="text-3xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              placeholder="Search by name, email, college or course..."
              value={search}
              maxLength={FIELD_LIMITS.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-card text-sm focus:outline-none focus:border-primary glass-input"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FaFilter className="text-text-muted text-xs" />
            {["All", "Applied", "Accepted", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs font-bold px-4 py-2 rounded-card transition ${
                  filterStatus === s
                    ? "bg-primary text-white shadow"
                    : "bg-white border border-brand-border text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
              <FaCalendarAlt className="text-primary" /> Applied Date
            </label>
            <select
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                if (event.target.value !== "Date") setSelectedDate("");
              }}
              className="min-w-45 rounded-card border border-brand-border glass-input px-3 py-2 text-sm font-semibold text-[#0D0D12] focus:outline-none focus:border-primary"
            >
              <option value="All">All dates</option>
              <option value="Today">Today</option>
              <option value="Week">Last 7 days</option>
              <option value="Month">This month</option>
              <option value="Date">Specific day</option>
            </select>
            {dateFilter === "Date" && (
              <input
                type="date"
                value={selectedDate}
                max={todayInputValue}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  if (!nextDate || nextDate <= todayInputValue) {
                    setSelectedDate(nextDate);
                  }
                }}
                className="rounded-card border border-brand-border glass-input px-3 py-2 text-sm font-semibold text-[#0D0D12] focus:outline-none focus:border-primary"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-text-muted">
              Filter: <span className="text-primary">{dateFilterLabels[dateFilter]}</span>
            </p>
            <button
              onClick={resetFilters}
              className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:text-accent"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <FaGraduationCap className="text-5xl text-gray-200 mx-auto mb-4" />
          <p className="text-text-muted font-medium text-sm">
            No applications found.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 text-xs text-primary font-bold underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              actionLoading={actionLoading}
              onAccept={() => updateStatus(app.id, "Accepted")}
              onReject={() => updateStatus(app.id, "Rejected")}
              onDelete={() => deleteApplication(app.id)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-[10px] text-[#5B5B63]/60 font-bold uppercase tracking-widest mt-10">
        Showing {filtered.length} of {total} applications
      </p>
    </div>
  );
}

function ApplicationCard({ app, actionLoading, onAccept, onReject, onDelete }) {
  const isLoadingAccept = actionLoading === app.id + "Accepted";
  const isLoadingReject = actionLoading === app.id + "Rejected";
  const isLoadingDelete = actionLoading === app.id + "del";
  const isAccepted = app.status === "Accepted";
  const isRejected = app.status === "Rejected";

  return (
    <div className="glass-card overflow-hidden hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="bg-primary p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-white/15 flex items-center justify-center shrink-0">
              <FaUser className="text-white text-base" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                {app.userName || "Unknown User"}
              </p>
              <p className="text-white/75 text-[10px] font-medium mt-0.5">
                Age: {app.userAge || "N/A"}
              </p>
            </div>
          </div>
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              statusColors[app.status] || statusColors.Applied
            } shrink-0`}
          >
            {app.status || "Applied"}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3">
        <InfoRow
          icon={<FaUniversity className="text-primary" />}
          label="College"
          value={app.universityName || "N/A"}
        />
        <InfoRow
          icon={<FaGraduationCap className="text-accent" />}
          label="Course"
          value={app.course || "N/A"}
        />
        <InfoRow
          icon={<FaEnvelope className="text-text-muted" />}
          label="Email"
          value={app.userEmail || "N/A"}
          small
        />
        <InfoRow
          icon={<FaPhone className="text-text-muted" />}
          label="Phone"
          value={app.userPhone || "N/A"}
        />
        <InfoRow
          icon={<FaCalendarAlt className="text-text-muted" />}
          label="Applied On"
          value={formatDate(app.createdAt)}
          small
        />
      </div>

      <div className="px-5 pb-5 grid grid-cols-3 gap-2">
        <button
          onClick={onAccept}
          disabled={isAccepted || isLoadingAccept}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-card text-xs font-bold transition ${
            isAccepted
              ? "status-success border opacity-55 cursor-not-allowed saturate-75"
              : isRejected
                ? "bg-white text-success border border-success/40 hover:bg-success/10 hover:shadow-card active:scale-[0.98]"
                : "status-success border hover:bg-[#2D8A56]/15 active:scale-[0.98]"
          }`}
          title={isAccepted ? "Already accepted" : "Accept application"}
        >
          {isLoadingAccept ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <FaCheckCircle className="text-sm" /> {isAccepted ? "Accepted" : "Accept"}
            </>
          )}
        </button>
        <button
          onClick={onReject}
          disabled={isRejected || isLoadingReject}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-card text-xs font-bold transition ${
            isRejected
              ? "status-danger border opacity-55 cursor-not-allowed saturate-75"
              : isAccepted
                ? "bg-white text-error border border-error/40 hover:bg-error/10 hover:shadow-card active:scale-[0.98]"
                : "status-danger border hover:bg-[#B3261E]/15 active:scale-[0.98]"
          }`}
          title={isRejected ? "Already rejected" : "Reject application"}
        >
          {isLoadingReject ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <FaTimesCircle className="text-sm" /> {isRejected ? "Rejected" : "Reject"}
            </>
          )}
        </button>
        <button
          onClick={onDelete}
          disabled={isLoadingDelete}
          className="flex items-center justify-center gap-1.5 py-2 rounded-card text-xs font-bold status-danger border hover:bg-[#B3261E]/15 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoadingDelete ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <FaTrashAlt className="text-sm" /> Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, small }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-sm">{icon}</div>
      <div>
        <p className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p
          className={`font-semibold text-[#0D0D12] leading-snug ${small ? "text-xs break-all" : "text-sm"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
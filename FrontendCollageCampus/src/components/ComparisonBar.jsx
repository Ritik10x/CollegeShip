import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaChevronRight, FaPlus } from "react-icons/fa";
import { useUser } from "../context/UserContext";
export default function ComparisonBar() {
  const { selectedColleges, toggleCollege, clearSelection } = useUser();
  const navigate = useNavigate();
  if (selectedColleges.length === 0) return null;
  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-bottom-8 duration-500 w-[calc(100vw-32px)] sm:w-auto px-0">
      {" "}
      <div className="bg-[#1a1c23] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-card sm:rounded-card shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-4 sm:gap-8 w-full sm:min-w-[300px]">
        {" "}
        {/* Avatars */}{" "}
        <div className="flex items-center -space-x-3 sm:-space-x-4">
          {" "}
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="relative group">
              {" "}
              {selectedColleges[idx] ? (
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-[#1a1c23] overflow-hidden bg-white shadow-card transform transition-transform group-hover:-translate-y-1">
                  {" "}
                  <img
                    src={
                      selectedColleges[idx].image ||
                      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=100"
                    }
                    alt="college"
                    className="w-full h-full object-cover"
                  />{" "}
                  <button
                    onClick={() => toggleCollege(selectedColleges[idx])}
                    className="absolute -top-1 -right-1 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {" "}
                    <svg
                      className="w-2 h-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 18L18 6M6 6l12 12" strokeWidth="3" />
                    </svg>{" "}
                  </button>{" "}
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-[#1a1c23] bg-gray-800/50 border-dashed border-gray-600 flex items-center justify-center text-text-muted">
                  {" "}
                  <FaPlus className="text-xs" />{" "}
                </div>
              )}{" "}
            </div>
          ))}{" "}
        </div>{" "}
        {/* Text info */}{" "}
        <div className="flex-1 min-w-0">
          {" "}
          <h4 className="font-bold text-xs sm:text-sm leading-tight truncate">
            {" "}
            {selectedColleges.length}{" "}
            {selectedColleges.length === 1 ? "college" : "colleges"}{" "}
            selected{" "}
          </h4>{" "}
          <p className="text-[10px] sm:text-[11px] text-text-muted font-medium mt-0.5">
            {" "}
            {selectedColleges.length < 3
              ? `Add ${3 - selectedColleges.length} more`
              : "Maximum reached"}{" "}
          </p>{" "}
        </div>{" "}
        {/* Actions */}{" "}
        <div className="flex items-center gap-2 sm:gap-4">
          {" "}
          <button
            onClick={clearSelection}
            className="p-2 sm:p-3 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white"
          >
            {" "}
            <FaTrashAlt className="text-xs sm:text-sm" />{" "}
          </button>{" "}
          <button
            onClick={() => navigate("/dashboard/compare")}
            className="bg-white text-[#0D0D12] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:bg-brand-bg/80 transition-colors duration-200 transition-colors whitespace-nowrap"
          >
            {" "}
            Compare <FaChevronRight className="text-[10px]" />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

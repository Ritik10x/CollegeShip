import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaUniversity,
  FaCalendarAlt,
  FaStar,
  FaTrophy,
  FaAward,
  FaBookOpen,
  FaMoneyBillWave,
  FaReceipt,
  FaTrashAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { getCollegeDisplayAddress } from "../lib/collegeMaps";
export default function Compare() {
  const { selectedColleges, toggleCollege } = useUser();
  const navigate = useNavigate();
  if (selectedColleges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        {" "}
        <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-brand-bg">
          {" "}
          <FaExchangeAlt className="text-3xl" />{" "}
        </div>{" "}
        <div className="space-y-2">
          {" "}
          <h3 className="text-xl font-bold text-[#0D0D12]">
            No colleges to compare
          </h3>{" "}
          <p className="text-text-muted font-medium">
            Select up to 3 colleges to compare their features side-by-side.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => navigate("/dashboard/explore")}
          className="bg-primary text-white px-8 py-3 rounded-card font-bold hover:bg-[#0D0D12] transition-colors duration-200 transition-all shadow-card shadow-brand-bg"
        >
          {" "}
          Go to Explore{" "}
        </button>{" "}
      </div>
    );
  }
  const comparisonData = [
    {
      category: "BASIC INFORMATION",
      rows: [
        {
          icon: <FaMapMarkerAlt />,
          label: "Location",
          key: (c) => getCollegeDisplayAddress(c.location) || c.location?.city,
        },
        {
          icon: <FaCalendarAlt />,
          label: "Established",
          key: (c) => c.established || "N/A",
        },
        {
          icon: <FaUniversity />,
          label: "Institution Type",
          key: (c) => (
            <span className="bg-brand-bg text-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              {c.type}
            </span>
          ),
        },
      ],
    },
    {
      category: "ACADEMICS & REPUTATION",
      rows: [
        {
          icon: <FaStar />,
          label: "Student Rating",
          key: (c) => (
            <div className="flex items-center gap-1 font-bold text-[#0D0D12]">
              {c.averageReview?.toFixed(1) || "0.0"}{" "}
              <FaStar className="text-accent text-xs" />{" "}
              <span className="text-[#5B5B63]/60 font-normal ml-1">/ 5.0</span>
            </div>
          ),
        },
        {
          icon: <FaTrophy />,
          label: "National Rankings",
          key: (c) => (
            <div className="flex flex-wrap gap-2">
              {" "}
              {c.rankings?.map((r, i) => (
                <span
                  key={i}
                  className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-100"
                >
                  {" "}
                  {r}{" "}
                </span>
              )) || "N/A"}{" "}
            </div>
          ),
        },
        {
          icon: <FaAward />,
          label: "Accreditations",
          key: (c) => (
            <div className="flex flex-wrap gap-2">
              {" "}
              {c.accreditation?.map((a, i) => (
                <span
                  key={i}
                  className="bg-brand-bg text-primary px-3 py-1 rounded-lg text-[10px] font-bold border border-brand-bg"
                >
                  {" "}
                  {a}{" "}
                </span>
              )) || "N/A"}{" "}
            </div>
          ),
        },
      ],
    },
    {
      category: "COST & FEES (BASED ON YOUR INTEREST)",
      rows: [
        {
          icon: <FaBookOpen />,
          label: "Courses & Fees",
          key: (c) => (
            <span className="text-text-muted font-medium italic text-sm">
              No courses available
            </span>
          ),
        },
        {
          icon: <FaMoneyBillWave />,
          label: "Tuition Range",
          key: (c) => <span className="text-[#5B5B63]/60">—</span>,
        },
        {
          icon: <FaReceipt />,
          label: "Registration Fee (Avg)",
          key: (c) => <span className="text-[#5B5B63]/60">—</span>,
        },
      ],
    },
  ];
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {" "}
      {/* Header */}{" "}
      <div className="flex flex-col gap-1">
        {" "}
        <h1 className="text-4xl font-bold text-[#0D0D12] leading-tight">
          Compare Your Top Choices
        </h1>{" "}
        <p className="text-text-muted font-medium max-w-2xl mt-2">
          {" "}
          Expertly curated side-by-side comparison of your top institutional
          choices to help you find your perfect academic home.{" "}
        </p>{" "}
        <div className="mt-4 flex items-center gap-3">
          {" "}
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Cost & Fees Profile:
          </span>{" "}
          <span className="bg-brand-bg text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            M.E.
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Comparison Grid */}{" "}
      <div className="overflow-x-auto glass-card shadow-gray-100 custom-scrollbar">
        {" "}
        <table className="w-full border-collapse min-w-[900px]">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-gray-50">
              {" "}
              <th className="w-1/4 p-8 text-left bg-brand-bg/30">
                {" "}
                <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest">
                  Criteria
                </p>{" "}
              </th>{" "}
              {selectedColleges.map((college) => (
                <th
                  key={college._id}
                  className="p-8 w-1/4 border-l border-gray-50 align-top group"
                >
                  {" "}
                  <div className="space-y-4 relative">
                    {" "}
                    <button
                      onClick={() => toggleCollege(college)}
                      className="absolute -top-4 -right-4 bg-brand-bg text-text-muted p-2 rounded-full hover:bg-[#B3261E]/10 hover:text-[#B3261E] transition-all opacity-0 group-hover:opacity-100"
                    >
                      {" "}
                      <FaTrashAlt className="text-xs" />{" "}
                    </button>{" "}
                    <div className="relative h-24 w-full rounded-card overflow-hidden shadow-card">
                      {" "}
                      <img
                        src={college.thumbnail || college.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />{" "}
                      <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                        RECOMMENDED
                      </div>{" "}
                    </div>{" "}
                    <div className="text-left">
                      {" "}
                      <h3 className="font-bold text-[#0D0D12] leading-snug line-clamp-1">
                        {college.name}
                      </h3>{" "}
                      <p className="text-[10px] text-text-muted font-medium mt-1 line-clamp-1">
                        {getCollegeDisplayAddress(college.location) ||
                          college.location?.city}
                      </p>{" "}
                    </div>{" "}
                    <button className="w-full bg-primary text-white py-2 rounded-card text-xs font-bold hover:bg-[#0D0D12] transition-colors duration-200 transition-colors">
                      {" "}
                      View Details{" "}
                    </button>{" "}
                  </div>{" "}
                </th>
              ))}{" "}
              {/* Fill remaining slots up to 3 */}{" "}
              {Array.from({ length: 3 - selectedColleges.length }).map(
                (_, i) => (
                  <th
                    key={`empty-${i}`}
                    className="p-8 w-1/4 border-l border-gray-50 bg-brand-bg/10"
                  >
                    {" "}
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                      {" "}
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-brand-border flex items-center justify-center text-[#5B5B63]/60">
                        {" "}
                        <FaPlus className="text-sm" />{" "}
                      </div>{" "}
                      <p className="text-[10px] font-bold text-[#5B5B63]/60 uppercase tracking-widest">
                        Add College
                      </p>{" "}
                    </div>{" "}
                  </th>
                ),
              )}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {comparisonData.map((category, catIdx) => (
              <React.Fragment key={catIdx}>
                {" "}
                {/* Category Header */}{" "}
                <tr className="bg-brand-bg/50">
                  {" "}
                  <td colSpan="4" className="px-8 py-4">
                    {" "}
                    <span className="text-[10px] font-extrabold text-accent uppercase tracking-[0.2em]">
                      {" "}
                      {category.category}{" "}
                    </span>{" "}
                  </td>{" "}
                </tr>{" "}
                {/* Category Rows */}{" "}
                {category.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-50 last:border-0 hover:bg-brand-bg/80 transition-colors duration-200/20 transition-colors"
                  >
                    {" "}
                    <td className="p-8">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="text-accent text-sm">
                          {row.icon}
                        </div>{" "}
                        <span className="text-sm font-bold text-[#0D0D12]">
                          {row.label}
                        </span>{" "}
                      </div>{" "}
                    </td>{" "}
                    {selectedColleges.map((college) => (
                      <td
                        key={college._id}
                        className="p-8 border-l border-gray-50"
                      >
                        {" "}
                        <div className="text-sm text-text-muted font-medium leading-relaxed">
                          {" "}
                          {row.key(college)}{" "}
                        </div>{" "}
                      </td>
                    ))}{" "}
                    {/* Empty slots cells */}{" "}
                    {Array.from({ length: 3 - selectedColleges.length }).map(
                      (_, i) => (
                        <td
                          key={`empty-cell-${i}`}
                          className="p-8 border-l border-gray-50 bg-brand-bg/5"
                        ></td>
                      ),
                    )}{" "}
                  </tr>
                ))}{" "}
              </React.Fragment>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>{" "}
    </div>
  );
}
function FaExchangeAlt({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {" "}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />{" "}
    </svg>
  );
}
function FaPlus({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {" "}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4v16m8-8H4"
      />{" "}
    </svg>
  );
}

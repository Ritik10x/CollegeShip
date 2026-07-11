import React from "react";
export default function AdminDashboard() {
  return (
    <div>
      {" "}
      <h1 className="text-3xl font-bold text-[#0D0D12] mb-6">Admin Dashboard</h1>{" "}
      <div className="bg-white p-8 rounded-card shadow-card border border-border-subtle max-w-2xl">
        {" "}
        <h2 className="font-extrabold text-2xl text-primary mb-3">
          Welcome Admin
        </h2>{" "}
        <p className="text-text-muted text-sm leading-relaxed">
          {" "}
          Use the sidebar to navigate to the College listings administration
          panel, visit the home page, or explore colleges.{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}

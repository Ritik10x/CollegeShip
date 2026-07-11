import React from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaDesktop,
  FaTrashAlt,
  FaBan,
} from "react-icons/fa";
import { FIELD_LIMITS } from "../lib/fieldLimits";
export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {" "}
      <div>
        {" "}
        <h1 className="text-3xl font-bold text-[#0D0D12] leading-tight">
          Account Settings
        </h1>{" "}
        <p className="text-text-muted mt-1 font-medium">
          Manage your profile information and how we can reach you.
        </p>{" "}
      </div>{" "}
      <div className="grid lg:grid-cols-2 gap-8">
        {" "}
        {/* Email Address */}{" "}
        <section className="glass-card p-8 shadow-card space-y-6">
          {" "}
          <div className="flex items-center gap-3 text-primary">
            {" "}
            <div className="p-2 bg-brand-bg rounded-lg">
              {" "}
              <FaEnvelope className="text-sm" />{" "}
            </div>{" "}
            <h3 className="font-bold text-[#0D0D12]">Email Address</h3>{" "}
          </div>{" "}
          <div className="space-y-6">
            {" "}
            <div className="relative group">
              {" "}
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />{" "}
              <input
                type="email"
                value="rickysn10x@gmail.com"
                readOnly
                className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-border-subtle rounded-card text-sm font-bold text-[#0D0D12] focus:outline-none"
              />{" "}
            </div>{" "}
            <div className="flex justify-end">
              {" "}
              <button className="bg-primary text-white px-6 py-2.5 rounded-card text-xs font-bold hover:bg-[#0D0D12] transition-colors duration-200 transition-all shadow-card shadow-brand-bg">
                {" "}
                Update Email{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* Phone Number */}{" "}
        <section className="glass-card p-8 shadow-card space-y-6">
          {" "}
          <div className="flex items-center gap-3 text-primary">
            {" "}
            <div className="p-2 bg-brand-bg rounded-lg">
              {" "}
              <FaPhoneAlt className="text-sm" />{" "}
            </div>{" "}
            <h3 className="font-bold text-[#0D0D12]">Phone Number</h3>{" "}
          </div>{" "}
          <div className="space-y-6">
            {" "}
            <div className="flex gap-4">
              {" "}
              <div className="w-24 relative group">
                {" "}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {" "}
                  <span className="text-lg">🇮🇳</span>{" "}
                  <span className="text-xs font-bold text-[#0D0D12]">+91</span>{" "}
                </div>{" "}
                <div className="w-full h-full absolute inset-0 rounded-card bg-brand-bg/50 border border-border-subtle pointer-events-none"></div>{" "}
              </div>{" "}
              <div className="flex-1 relative group">
                {" "}
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />{" "}
                <input
                  type="text"
                  value="6230918137"
                  readOnly
                  className="w-full pl-11 pr-4 py-3 bg-brand-bg/50 border border-border-subtle rounded-card text-sm font-bold text-[#0D0D12] focus:outline-none"
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex justify-end">
              {" "}
              <button className="bg-primary text-white px-6 py-2.5 rounded-card text-xs font-bold hover:bg-[#0D0D12] transition-colors duration-200 transition-all shadow-card shadow-brand-bg">
                {" "}
                Update Phone{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
      {/* Security Section */}{" "}
      <section className="glass-card p-8 shadow-card space-y-8">
        {" "}
        <div className="flex items-center gap-3 text-primary">
          {" "}
          <div className="p-2 bg-brand-bg rounded-lg">
            {" "}
            <FaLock className="text-sm" />{" "}
          </div>{" "}
          <h3 className="font-bold text-[#0D0D12]">Security</h3>{" "}
        </div>{" "}
        <div className="grid lg:grid-cols-3 gap-6">
          {" "}
          <div className="space-y-2">
            {" "}
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest">
              Current Password
            </label>{" "}
            <input
              type="password"
              value="********"
              readOnly
              className="w-full bg-brand-bg/50 border border-border-subtle rounded-card px-4 py-3 text-sm font-bold text-[#0D0D12] focus:outline-none"
            />{" "}
          </div>{" "}
          <div className="space-y-2">
            {" "}
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest">
              New Password
            </label>{" "}
            <input
              type="password"
              placeholder="New password"
              maxLength={FIELD_LIMITS.password}
              className="w-full glass-input border border-border-subtle rounded-card px-4 py-3 text-sm font-bold text-[#0D0D12] focus:outline-none focus:border-accent"
            />{" "}
          </div>{" "}
          <div className="space-y-2">
            {" "}
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest">
              Confirm Password
            </label>{" "}
            <input
              type="password"
              placeholder="Confirm password"
              maxLength={FIELD_LIMITS.password}
              className="w-full glass-input border border-border-subtle rounded-card px-4 py-3 text-sm font-bold text-[#0D0D12] focus:outline-none focus:border-accent"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex justify-between items-center border-t border-gray-50 pt-6">
          {" "}
          <p className="text-xs text-text-muted font-medium">
            Password must be at least 8 characters long with symbols.
          </p>{" "}
          <button className="bg-primary text-white px-8 py-2.5 rounded-card text-sm font-bold hover:bg-[#0D0D12] transition-colors duration-200 transition-all shadow-card shadow-brand-bg">
            {" "}
            Update Password{" "}
          </button>{" "}
        </div>{" "}
      </section>{" "}
      {/* Active Sessions */}{" "}
      <section className="glass-card p-8 shadow-card space-y-6">
        {" "}
        <div className="flex items-center gap-3 text-primary">
          {" "}
          <div className="p-2 bg-brand-bg rounded-lg text-primary">
            {" "}
            <FaDesktop className="text-sm" />{" "}
          </div>{" "}
          <h3 className="font-bold text-[#0D0D12]">Active Sessions</h3>{" "}
        </div>{" "}
        <div className="bg-brand-bg/30 border border-border-subtle rounded-card p-4 flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-4">
            {" "}
            <div className="w-12 h-12 bg-primary rounded-card flex items-center justify-center text-white text-xl">
              {" "}
              <FaDesktop />{" "}
            </div>{" "}
            <div>
              {" "}
              <h4 className="font-bold text-[#0D0D12]">desktop</h4>{" "}
              <p className="text-xs text-text-muted font-medium">
                Mohali, India • Active now
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <span className="bg-brand-bg text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
            {" "}
            Current{" "}
          </span>{" "}
        </div>{" "}
      </section>{" "}
      {/* Danger Zone */}{" "}
      <div className="grid lg:grid-cols-2 gap-8 pt-8">
        {" "}
        <div className="space-y-2">
          {" "}
          <h4 className="text-sm font-bold text-[#B3261E] uppercase tracking-widest">
            Delete Account
          </h4>{" "}
          <p className="text-xs text-text-muted font-medium">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>{" "}
          <button className="mt-4 bg-red-50 text-[#B3261E] border border-[#B3261E] px-6 py-2.5 rounded-card text-xs font-bold hover:bg-error hover:text-white transition-all flex items-center gap-2 group">
            {" "}
            <FaTrashAlt className="group-hover:scale-110 transition-transform" />{" "}
            Delete Account{" "}
          </button>{" "}
        </div>{" "}
        <div className="flex flex-col items-end justify-end space-y-4">
          {" "}
          <button className="bg-error text-white px-8 py-3 rounded-card font-bold hover:bg-error transition-all shadow-card shadow-red-100 flex items-center gap-2 group">
            {" "}
            <FaBan className="group-hover:rotate-12 transition-transform" />{" "}
            Deactivate Account{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

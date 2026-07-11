import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { openAuthModal } from "./AuthModal";
import { useIntroMotion } from "../hooks/useIntroMotion";

export default function Hero() {
  const introMotion = useIntroMotion();

  return (
    <div
      id="hero"
      className={`scroll-mt-24 pt-28 pb-20 glass-section ${introMotion ? "motion-hero-enter" : ""}`}
    >
      {" "}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4 sm:px-6 lg:px-8">
        {" "}
        {/* LEFT */}{" "}
        <div>
          {" "}
          <span className="glass-chip text-primary px-4 py-1 rounded-full text-sm font-semibold hero-rise">
            {" "}
            THE FUTURE OF EDUCATION{" "}
          </span>{" "}
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[64px] font-bold leading-tight mt-6 hero-rise hero-rise-delay-1">
            {" "}
            <span className="text-primary">Your Path to</span> <br />{" "}
            <span className="text-accent">Excellence</span>{" "}
          </h1>{" "}
          <p className="text-text-muted mt-6 text-lg max-w-xl hero-rise hero-rise-delay-2">
            {" "}
            Experience a revolutionary way to discover verified institutions,
            compare with data, and decide with confidence.{" "}
          </p>{" "}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 hero-rise hero-rise-delay-3">
            {" "}
            <Link
              to="/explore"
              className="bg-primary text-white px-6 py-3 rounded-card flex items-center justify-center gap-2 shadow-card hover:-translate-y-[1px] active:scale-[0.97] transition"
            >
              {" "}
              Explore Now <FaArrowRight />{" "}
            </Link>{" "}
            <button
              onClick={() => openAuthModal("signup")}
              className="border-2 border-primary/30 glass-chip text-primary px-6 py-3 rounded-card font-medium hover:bg-accent hover:border-accent hover:text-white transition-all duration-150 ease-in-out flex items-center justify-center gap-2 hover:-translate-y-[1px] active:scale-[0.97] shadow-card"
            >
              {" "}
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />{" "}
              </svg>{" "}
              Join Platform{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* RIGHT IMAGE */}{" "}
        <div className="relative mt-8 md:mt-0 hero-rise hero-rise-delay-4">
          {" "}
          {/* MAIN IMAGE */}{" "}
          <img
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b"
            className="rounded-card shadow-glass-lg float-slow w-full object-cover ring-1 ring-white/40"
            alt="Hero college campus illustration"
          />{" "}
          {/* CARD 1 */}{" "}
          <div className="hidden sm:flex absolute top-4 right-4 glass-chip px-5 py-3 rounded-card shadow-glass-lg float-fast">
            <div>
              <p className="font-bold text-lg">14+</p>
              <span className="text-xs text-text-muted">COLLEGES</span>
            </div>
          </div>{" "}
          {/* CARD 2 */}{" "}
          <div className="hidden sm:flex absolute bottom-4 left-4 glass-chip px-5 py-3 rounded-card shadow-glass-lg float-medium">
            <div>
              <p className="font-bold text-lg">400+</p>
              <span className="text-xs text-text-muted">STUDENTS</span>
            </div>
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

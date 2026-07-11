import { openAuthModal } from "./AuthModal";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <div className="py-16 px-4 sm:px-6">
      <Reveal from="left" delay={0} className="max-w-7xl mx-auto">
        <div className="bg-primary rounded-card sm:rounded-card p-6 sm:p-12 text-white shadow-glass-float ring-1 ring-white/10">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Ready to Sculpt Your <br className="hidden sm:block" />{" "}
            <span className="text-accent italic">Future?</span>
          </h1>
          <p className="mt-6 max-w-lg text-white/80 text-sm sm:text-base">
            Join over half a million students who transformed their academic
            journey.
          </p>
          <div className="mt-8">
            <button
              onClick={() => openAuthModal("signup")}
              className="bg-accent text-white px-6 py-3 rounded-card font-semibold hover:bg-[#b8921f] transition-colors duration-200 shadow-card"
            >
              Join Now Free
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

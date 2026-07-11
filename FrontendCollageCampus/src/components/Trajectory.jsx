import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

export default function Trajectory() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.4 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      title: "Profile Setup",
      desc: "Securely build your academic preferences in under 60 seconds.",
      from: "left",
      delay: 0,
    },
    {
      title: "Deep Discovery",
      desc: "Sift through 14+ data-verified institutions with smart filters.",
      from: "up",
      delay: 120,
    },
    {
      title: "Smart Apply",
      desc: "Connect with experts and apply to your top choices with ease.",
      from: "right",
      delay: 240,
    },
  ];

  return (
    <div ref={ref} className="py-24 text-center px-6">
      <Reveal from="up">
        <h1 className="text-3xl md:text-4xl font-bold">Your Trajectory</h1>
        <p className="text-text-muted mt-2">
          Seamlessly navigating from discovery to enrollment.
        </p>
      </Reveal>

      <div className="relative mt-20 max-w-6xl mx-auto">
        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-200">
          <div
            className={`h-full bg-primary ${
              visible ? "progress-animate w-full" : "w-0"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          {steps.map((step, i) => (
            <Reveal
              key={step.title}
              from={step.from}
              delay={step.delay}
              className="group"
            >
              <div
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500 ease-in-out ${
                    hoveredStep === i
                      ? "bg-primary text-white scale-110 shadow-glass-lg"
                      : visible && i === 2 && hoveredStep === null
                        ? "bg-primary text-white scale-110 shadow-glass-lg"
                        : "bg-white text-primary border border-brand-border shadow-card"
                  }`}
                >
                  0{i + 1}
                </div>

                <h2 className="mt-6 font-semibold text-lg transition group-hover:text-accent">
                  {step.title}
                </h2>
                <p className="text-text-muted mt-2 text-sm max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useCountUp } from "../hooks/useCountUp";
import Reveal from "./Reveal";

function StatCard({
  value,
  suffix = "",
  decimals = 0,
  title,
  sub,
  from = "up",
  delay = 0,
}) {
  const { ref, formatted } = useCountUp(value, { decimals });

  return (
    <Reveal from={from} delay={delay} className="h-full">
      <div
        ref={ref}
        className="h-full py-5 px-4 rounded-card bg-white shadow-card border border-white/10 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-glass-lg hover:border-accent/30"
      >
        <h1 className="text-accent text-3xl md:text-4xl font-bold tabular-nums">
          {formatted}
          {suffix}
        </h1>
        <p className="text-[#0D0D12] mt-2 font-semibold text-sm md:text-base">
          {title}
        </p>
        <p className="text-text-muted text-xs md:text-sm mt-1">{sub}</p>
      </div>
    </Reveal>
  );
}

export default function Stats() {
  const data = [
    {
      value: 14,
      suffix: "+",
      title: "Verified Colleges",
      sub: "UPDATED WEEKLY",
      from: "left",
      delay: 0,
    },
    {
      value: 50,
      suffix: "+",
      title: "Student Reviews",
      sub: "HONEST INSIGHTS",
      from: "right",
      delay: 80,
    },
    {
      value: 6,
      suffix: "+",
      title: "Expert Mentors",
      sub: "PERSONAL GUIDANCE",
      from: "left",
      delay: 160,
    },
    {
      value: 4.9,
      suffix: "/5",
      decimals: 1,
      title: "Trust Score",
      sub: "HIGHLY RATED",
      from: "right",
      delay: 240,
    },
  ];

  return (
    <div className="bg-primary py-16 text-center">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 px-6">
        {data.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

import {
  FaSearch,
  FaChartBar,
  FaComments,
  FaBook,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";
import Reveal from "./Reveal";

export default function Features() {
  const data = [
    {
      icon: <FaSearch />,
      title: "Smart College Search",
      desc: "Find your ideal college from 14+ institutions using advanced filters like location, ranking, fees, and courses.",
      span: "md:col-span-2",
    },
    {
      icon: <FaChartBar />,
      title: "Compare Side-by-Side",
      desc: "Compare placements, fees, and infrastructure for up to 4 colleges simultaneously with AI-driven insights.",
      span: "md:col-span-1",
    },
    {
      icon: <FaComments />,
      title: "Real Student Truth",
      desc: "Read thousands of honest, verified reviews from current students and alumni.",
      span: "md:col-span-1",
    },
    {
      icon: <FaBook />,
      title: "Expert Counseling",
      desc: "Connect with seasoned educators for personalized mentorship throughout your application journey.",
      span: "md:col-span-2",
    },
    {
      icon: <FaUserGraduate />,
      title: "Course Explorer",
      desc: "Deep dive into curriculum, fee breakdowns, and scholarship opportunities available for your dream stream.",
      span: "md:col-span-2",
    },
    {
      icon: <FaUsers />,
      title: "Alumni Network",
      desc: "Get real-world career trajectory insights directly from the global alumni community.",
      span: "md:col-span-1",
    },
  ];

  return (
    <div className="py-20 glass-section">
      <Reveal from="up" className="text-center mb-16">
        <span className="glass-chip text-primary px-5 py-1 rounded-full text-xs font-semibold tracking-widest">
          PLATFORM CAPABILITIES
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mt-6 leading-tight">
          Everything Hub for <br className="hidden sm:block" />{" "}
          <span className="text-accent">Future Success</span>
        </h1>
      </Reveal>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 auto-rows-fr">
        {data.map((item, i) => (
          <Reveal
            key={item.title}
            from={i % 2 === 0 ? "left" : "right"}
            delay={(i % 3) * 90}
            className={`h-full ${item.span}`}
          >
            <div className="group relative glass-card glass-card-hover h-full p-8 transition-all duration-150 ease-in-out hover:shadow-glass-lg hover:scale-[1.02]">
              <div className="w-12 h-12 flex items-center justify-center rounded-card text-lg mb-5 bg-brand-bg text-primary transition-all duration-150 ease-in-out group-hover:bg-[#0D0D12] group-hover:text-white group-hover:scale-110">
                {item.icon}
              </div>
              <h2 className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-accent">
                {item.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                {item.desc}
              </p>
              <div className="absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none bg-accent/5" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

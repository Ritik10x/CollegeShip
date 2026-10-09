import {
  FaUserGraduate,
  FaUniversity,
  FaLaptop,
  FaBuilding,
  FaCogs,
  FaMicrochip,
  FaChalkboardTeacher,
  FaFlask,
  FaCheckCircle,
  FaNetworkWired,
  FaEye,
  FaBullseye,
} from "react-icons/fa";
import Reveal from "./Reveal";

const CORE_SERVICES = [
  {
    icon: FaUserGraduate,
    title: "Academic & Career Advisory",
    desc: "Professional counselling and academic planning designed to help students make informed educational and career decisions aligned with their aspirations and future goals.",
  },
  {
    icon: FaUniversity,
    title: "Admission Support Services",
    desc: "Comprehensive guidance for admissions through a wide network of recognized universities and educational institutions, ensuring a transparent, efficient, and student-centric process.",
  },
  {
    icon: FaLaptop,
    title: "Online & Distance Education Solutions",
    desc: "Expert assistance for flexible learning opportunities through recognized online and distance education programmes, supporting lifelong learning and career advancement.",
  },
  {
    icon: FaBuilding,
    title: "Institutional Consulting",
    desc: "Strategic consulting services for schools, colleges, universities, healthcare institutions, and educational organizations focused on academic growth, operational excellence, and long-term development.",
  },
  {
    icon: FaCogs,
    title: "Educational Infrastructure & Technology Solutions",
    desc: "End-to-end solutions for modern educational environments, including laboratory infrastructure, scientific and technical equipment, hospital education support systems, smart learning technologies, and institutional resource planning.",
  },
  {
    icon: FaMicrochip,
    title: "Robotics, STEM & Innovation Labs",
    desc: "Design, development, and implementation of future-ready Robotics, AI, Coding, and STEM laboratories that promote experiential learning, innovation, and technical competency.",
  },
  {
    icon: FaChalkboardTeacher,
    title: "Professional Development & Training",
    desc: "Customized training programmes for students, faculty, administrators, and corporate professionals to enhance leadership, communication, employability, digital competencies, and industry readiness.",
  },
  {
    icon: FaFlask,
    title: "Research & Academic Support",
    desc: "Comprehensive support for research initiatives, academic collaborations, institutional projects, and higher education development.",
  },
];

const WHY_CHOOSE = [
  "Student-Centric Approach",
  "Experienced Education Consultants",
  "Extensive Network of Leading Universities and Institutions",
  "Transparent, Ethical, and Professional Processes",
  "Personalized Guidance and Continuous Support",
  "Expertise in Online, Distance, and Higher Education",
  "Innovative Educational Technology Solutions",
  "Institutional Consultancy and Academic Development",
  "Strong Industry and Academic Collaborations",
  "Commitment to Quality, Excellence, and Long-Term Success",
];

const MISSION_POINTS = [
  "To simplify educational decision-making through professional guidance and ethical practices.",
  "To promote accessible, flexible, and quality learning opportunities.",
  "To strengthen educational institutions through innovative consulting and technology-driven solutions.",
  "To foster lifelong learning, professional growth, and research excellence.",
  "To build sustainable partnerships that contribute to the advancement of education and society.",
];

const SHELL = "max-w-7xl mx-auto px-6 w-full";
const bodyText = "text-[#4a4a55] text-sm leading-[1.65]";

function SectionEyebrow({ children }) {
  return (
    <span className="glass-chip text-primary px-4 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase inline-block">
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, accentWord, align = "left" }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignClass}`}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-[#0D0D12] leading-tight">
        {title}{" "}
        {accentWord && <span className="text-accent">{accentWord}</span>}
      </h2>
      {align === "left" && <div className="mt-5 h-1 w-14 rounded-full bg-accent" />}
    </div>
  );
}

export default function HomeAbout() {
  return (
    <div className="w-full">
      {/* Introduction */}
      <section className="py-16 glass-section">
        <div className={SHELL}>
          <Reveal from="up">
            <SectionHeader
              eyebrow="CollegeShip"
              title="Your Trusted Partner in Education, Career Development &"
              accentWord="Institutional Excellence"
            />
          </Reveal>

          <Reveal from="up" delay={60} className="mt-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-5">
              Introduction
            </p>
            <div className={`grid md:grid-cols-2 gap-x-10 gap-y-4 ${bodyText}`}>
              <p>
                At CollegeShip, we are dedicated to empowering students, professionals, and
                educational institutions by delivering comprehensive education, career, and
                institutional solutions. Our objective is to bridge the gap between aspirations
                and opportunities through expert guidance, strategic collaborations, and
                innovative educational services.
              </p>
              <p>
                With a strong network of reputed universities, colleges, and industry partners,
                CollegeShip provides reliable admission counselling, academic consulting, and
                institutional support across a diverse range of educational disciplines. We are
                committed to maintaining the highest standards of professionalism, transparency,
                and integrity, ensuring that every student and institution receives personalized
                and result-oriented solutions.
              </p>
              <p>
                Beyond admissions, CollegeShip serves as a strategic partner for educational
                institutions by offering consultancy, academic support, educational
                infrastructure solutions, technology integration, and professional development
                initiatives. We also facilitate UGC-recognized Online and Distance Education
                programmes, enabling students and working professionals to pursue quality
                education through flexible learning pathways across undergraduate, postgraduate,
                diploma, certificate, professional, and research programmes.
              </p>
              <p>
                Our approach combines educational expertise with innovative technology, helping
                institutions strengthen academic excellence while preparing learners for an
                evolving global environment.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-16 bg-white">
        <Reveal from="up" className={`${SHELL} text-center mb-10`}>
          <SectionHeader
            eyebrow="What We Offer"
            title="Our Core"
            accentWord="Services"
            align="center"
          />
        </Reveal>

        <div className={`${SHELL} grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr`}>
          {CORE_SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} from="up" delay={(i % 4) * 50} className="h-full">
                <article className="group flex h-full flex-col glass-card p-5 transition-all duration-200 hover:shadow-glass-lg hover:-translate-y-0.5">
                  <div className="w-10 h-10 flex shrink-0 items-center justify-center rounded-card bg-brand-bg text-primary text-base mb-4 transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon aria-hidden />
                  </div>
                  <h3 className="min-h-[2.75rem] text-[15px] font-semibold text-[#0D0D12] leading-snug mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className={`mt-auto ${bodyText}`}>{service.desc}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Why Choose + Network */}
      <section className="py-16 glass-section">
        <div className={SHELL}>
          <Reveal from="up" className="mb-10">
            <SectionHeader
              eyebrow="Our Strengths"
              title="Why Choose"
              accentWord="CollegeShip"
            />
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <Reveal from="left" className="h-full">
              <div className="glass-card h-full p-6 sm:p-7">
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 h-full content-start">
                  {WHY_CHOOSE.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-[#4a4a55] leading-snug"
                    >
                      <FaCheckCircle className="mt-0.5 shrink-0 text-accent text-[11px]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal from="right" className="h-full">
              <div className="glass-card h-full p-6 sm:p-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4 shrink-0">
                  <div className="w-10 h-10 rounded-card bg-primary flex items-center justify-center text-white text-lg shrink-0">
                    <FaNetworkWired />
                  </div>
                  <h3 className="text-lg font-bold text-primary leading-snug">
                    Our Institutional Network
                  </h3>
                </div>
                <div className={`space-y-3 ${bodyText}`}>
                  <p>
                    CollegeShip collaborates with a wide network of leading universities,
                    colleges, healthcare institutions, research organizations, and educational
                    partners across India. These strategic partnerships enable us to provide
                    students with quality educational opportunities while supporting
                    institutions through academic consultancy, technology integration, and
                    capacity-building initiatives.
                  </p>
                  <p>
                    Our continuously expanding network reflects our commitment to delivering
                    trusted, reliable, and future-focused educational solutions.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-primary text-white">
        <div className={`${SHELL} grid md:grid-cols-2 gap-6 items-stretch`}>
          <Reveal from="left" className="h-full">
            <div className="flex h-full flex-col rounded-card border border-white/10 bg-white/5 p-6 sm:p-7">
              <div className="flex items-center gap-2.5 mb-4 shrink-0">
                <FaEye className="text-accent text-lg shrink-0" />
                <h2 className="text-lg font-bold">Our Vision</h2>
              </div>
              <p className="text-sm text-white/90 leading-[1.65]">
                To become one of India&apos;s most trusted and respected education and
                institutional solutions organizations by creating meaningful opportunities for
                learners and empowering educational institutions through innovation, quality,
                and excellence.
              </p>
            </div>
          </Reveal>

          <Reveal from="right" className="h-full">
            <div className="flex h-full flex-col rounded-card border border-white/10 bg-white/5 p-6 sm:p-7">
              <div className="flex items-center gap-2.5 mb-4 shrink-0">
                <FaBullseye className="text-accent text-lg shrink-0" />
                <h2 className="text-lg font-bold">Our Mission</h2>
              </div>
              <ul className="space-y-2.5">
                {MISSION_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm text-white/90 leading-[1.65]"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing tagline */}
      <section className="py-12 border-y border-border-subtle bg-white">
        <Reveal from="up" className={`${SHELL} text-center`}>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
            CollegeShip
          </p>
          <h2 className="mt-3 text-lg sm:text-xl md:text-2xl font-bold text-primary max-w-3xl mx-auto">
            Guiding Dreams. Building Futures. Empowering Institutions.
          </h2>
          <p className={`mt-3 max-w-xl mx-auto ${bodyText}`}>
            A Comprehensive Partner for Education, Career Advancement, and Institutional
            Development.
          </p>
        </Reveal>
      </section>
    </div>
  );
}

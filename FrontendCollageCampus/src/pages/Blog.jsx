import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaRupeeSign,
  FaCalendarAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaChevronDown,
  FaUniversity,
  FaFileAlt,
  FaIdCard,
  FaLandmark,
  FaArrowRight,
  FaBookOpen,
  FaLightbulb,
} from "react-icons/fa";
import PageSEO from "../components/PageSEO";
import Reveal from "../components/Reveal";
import { ROUTE_SEO, formatPageTitle } from "../lib/seo";
import { openAuthModal } from "../components/AuthModal";

const HIGHLIGHTS = [
  { value: "80+", label: "Schemes on NSP", icon: FaLandmark },
  { value: "₹8K–₹25K", label: "Typical state awards", icon: FaRupeeSign },
  { value: "2026–27", label: "Active academic year", icon: FaCalendarAlt },
  { value: "DBT", label: "Direct bank transfer", icon: FaCheckCircle },
];

const STATE_PORTALS = [
  { state: "Bihar", portal: "MedhaSoft", url: "https://medhasoft.bihar.gov.in", note: "BSEB matric & inter pass students" },
  { state: "Uttar Pradesh", portal: "UP Scholarship", url: "https://scholarship.up.gov.in", note: "Class 9 to PG students" },
  { state: "Maharashtra", portal: "MahaDBT", url: "https://mahadbt.maharashtra.gov.in", note: "School & college schemes" },
  { state: "Karnataka", portal: "SSP Portal", url: "https://ssp.karnataka.gov.in", note: "Pre & post-matric aid" },
  { state: "West Bengal", portal: "WB Scholarship", url: "https://wbmdfcscholarship.in", note: "Minority & merit schemes" },
  { state: "Tamil Nadu", portal: "TN e-Scholarship", url: "https://www.tnesevai.tn.gov.in", note: "State merit programs" },
  { state: "Gujarat", portal: "Digital Gujarat", url: "https://digitalgujarat.gov.in", note: "UG & PG scholarships" },
  { state: "Rajasthan", portal: "Rajasthan SSO", url: "https://sso.rajasthan.gov.in", note: "Multiple state schemes" },
];

const BIHAR_SCHEMES = [
  {
    name: "Mukhyamantri Balak/Balika Protsahan (10th Pass)",
    amount: "₹8,000 – ₹10,000",
    eligibility: "BSEB matric 2026 pass, 1st/2nd division, Bihar resident, Aadhaar-linked bank account",
  },
  {
    name: "Mukhyamantri Balika Protsahan (12th Pass)",
    amount: "₹25,000",
    eligibility: "Unmarried Bihar girls who passed BSEB Inter 2026; part of Mukhyamantri Kanya Utthan Yojana",
  },
  {
    name: "Mukhyamantri Medhavriti Yojana (12th – SC/ST Girls)",
    amount: "₹10,000 – ₹15,000",
    eligibility: "SC/ST girl students, BSEB Inter 2026, 1st or 2nd division, valid caste certificate",
  },
  {
    name: "Mukhyamantri Balika Snatak Protsahan (Graduation)",
    amount: "Varies by scheme",
    eligibility: "Female graduates from recognized Bihar universities / affiliated colleges",
  },
];

const DOCUMENTS = [
  "Aadhaar card (linked to bank account)",
  "State board mark sheet & pass certificate",
  "Domicile / residence certificate",
  "Caste / category certificate (if applicable)",
  "Income certificate (for means-based schemes)",
  "Bank passbook or cancelled cheque",
  "Recent passport-size photograph",
  "Active mobile number & email ID",
];

const APPLY_STEPS = [
  { step: "01", title: "Confirm eligibility", text: "Check your state board result, category, income limits, and division requirements before you start." },
  { step: "02", title: "Complete OTR on NSP", text: "Register once on scholarships.gov.in with Aadhaar authentication — required for most central and many state-linked schemes." },
  { step: "03", title: "Visit your state portal", text: "State board scholarships (e.g. BSEB) are usually applied through the state education portal, not NSP alone." },
  { step: "04", title: "Upload documents", text: "Keep scanned copies ready in PDF/JPG under portal size limits. Names on documents must match your bank account." },
  { step: "05", title: "Track & verify", text: "After submission, your school/college may verify the application. Scholarship is credited via DBT to your bank account." },
];

const TIMELINE = [
  { date: "Jun 1, 2026", event: "NSP opens for academic year 2026–27 (fresh & renewal)" },
  { date: "May 25, 2026", event: "Bihar MedhaSoft portal opens for BSEB pass students" },
  { date: "Aug 31, 2026", event: "NSP pre-matric deadline (many schemes)" },
  { date: "Oct 31, 2026", event: "NSP post-matric & central sector deadline (most schemes)" },
  { date: "Nov 15, 2026", event: "Institute verification cutoff (NSP)" },
];

const FAQ = [
  {
    q: "What is a state board scholarship?",
    a: "State board scholarships are financial aid programs run by your state government for students who passed examinations from the state board (e.g. BSEB, UP Board, MSBSHSE). Amounts are usually transferred directly to your bank account through DBT.",
  },
  {
    q: "Can CBSE/ICSE students apply for state board schemes?",
    a: "Most state board-specific schemes require you to have passed from that state's board. For example, Bihar's MedhaSoft schemes are for BSEB pass students only. CBSE/ICSE students should check NSP central schemes or their state's general merit scholarships.",
  },
  {
    q: "Do I need to apply on both NSP and the state portal?",
    a: "Often yes — NSP handles central and many centrally sponsored schemes, while state boards use their own portals (like medhasoft.bihar.gov.in). Always verify on your state's official education department website.",
  },
  {
    q: "What is One-Time Registration (OTR) on NSP?",
    a: "OTR is a single registration on scholarships.gov.in that creates your student profile for the academic year. You need OTR before applying to individual schemes on the National Scholarship Portal.",
  },
  {
    q: "When will scholarship money be credited?",
    a: "After your application is verified by your institute and district/state authorities, the amount is sent via Direct Benefit Transfer (DBT). Timelines vary by scheme — typically weeks to a few months after the application window closes.",
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border border-border-subtle rounded-card overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-[#0D0D12] hover:bg-brand-bg/50 transition-colors"
      >
        <span className="text-sm sm:text-base">{item.q}</span>
        <FaChevronDown
          className={`shrink-0 text-accent transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-t border-border-subtle pt-3">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function Blog() {
  const seo = ROUTE_SEO["/blog"];
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <PageSEO
        title={formatPageTitle(seo.title)}
        description={seo.description}
        keywords={seo.keywords}
        jsonLd={seo.jsonLd}
      />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-28 pb-16 sm:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0d3a6b] to-[#081229]" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_80%,rgba(201,162,39,0.35),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal from="up">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
                CollegeShip Blog · Scholarships 2027
              </p>
              <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl">
                State Board Scholarship Schemes for Students{" "}
                <span className="text-accent italic">2026–27</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                Your complete guide to government scholarships for state board students — eligibility,
                award amounts, official portals, documents, and step-by-step application tips for
                the 2026–27 academic session.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#state-schemes"
                  className="inline-flex items-center gap-2 rounded-card bg-accent px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-[#b8921f] transition-colors"
                >
                  Explore Schemes <FaArrowRight className="text-xs" />
                </a>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-card border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  NSP Portal <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats strip */}
        <section className="relative -mt-8 z-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.label} from="up" delay={i * 80}>
                  <div className="glass-card p-5 sm:p-6 text-center shadow-glass-lg border border-white/60">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-bg text-primary">
                      <Icon className="text-lg" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-primary">{item.value}</p>
                    <p className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted">
                      {item.label}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Intro */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            <Reveal from="left" className="lg:col-span-2 lg:sticky lg:top-28">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
                Why it matters
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#0D0D12] leading-tight">
                Fund your education without the stress
              </h2>
              <p className="mt-4 text-text-muted leading-relaxed">
                Every year, central and state governments allocate crores for students who excel in
                state board examinations. From matric pass incentives to graduation support for girls,
                these schemes can cover books, coaching, and college fees — if you apply on time.
              </p>
              <div className="mt-6 rounded-card bg-primary p-5 text-white">
                <FaLightbulb className="text-accent text-xl mb-2" />
                <p className="text-sm font-semibold leading-relaxed">
                  Pro tip: State board scholarships are separate from college admission. Secure your
                  scholarship first, then use CollegeShip to find and apply to colleges.
                </p>
              </div>
            </Reveal>

            <Reveal from="right" className="lg:col-span-3 space-y-5">
              <article className="glass-card p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-card bg-brand-bg p-3 text-primary">
                    <FaBookOpen className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">National Scholarship Portal (NSP)</h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">
                      The NSP at{" "}
                      <a
                        href="https://scholarships.gov.in"
                        className="font-semibold text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        scholarships.gov.in
                      </a>{" "}
                      hosts 80+ central, UGC, AICTE, and state-linked schemes for Class 1 through
                      Ph.D. For AY 2026–27, the portal opened on{" "}
                      <strong className="text-[#0D0D12]">1 June 2026</strong>. Pre-matric deadlines
                      are typically <strong className="text-[#0D0D12]">31 August 2026</strong>; most
                      post-matric and central sector schemes close on{" "}
                      <strong className="text-[#0D0D12]">31 October 2026</strong>.
                    </p>
                  </div>
                </div>
              </article>

              <article className="glass-card p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-card bg-brand-bg p-3 text-primary">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">State board–specific schemes</h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">
                      If you passed from a state board (BSEB, UP Board, Maharashtra Board, etc.),
                      your state education department may offer dedicated scholarships beyond NSP.
                      These usually require a minimum division (1st or 2nd), domicile proof, and an
                      Aadhaar-linked bank account for Direct Benefit Transfer (DBT).
                    </p>
                  </div>
                </div>
              </article>

              <article className="glass-card p-6 sm:p-8 border-l-4 border-l-accent">
                <h3 className="text-lg font-bold text-primary">Who should apply?</h3>
                <ul className="mt-3 space-y-2 text-sm text-text-muted">
                  {[
                    "Students who passed Class 10 or 12 from a recognized state board in 2026",
                    "SC/ST/OBC/EBC/Minority and general category students (scheme-specific)",
                    "Girl students eligible for state girl-child incentive programs",
                    "Students with family income within scheme limits (for means-based aid)",
                    "Applicants with valid Aadhaar and bank account in their own name",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <FaCheckCircle className="mt-0.5 shrink-0 text-accent text-xs" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        </section>

        {/* Bihar spotlight — detailed state board example */}
        <section id="state-schemes" className="bg-brand-bg/60 py-16 sm:py-20 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal from="up">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent text-center">
                Featured · State Board Example
              </p>
              <h2 className="mt-3 text-2xl sm:text-4xl font-black text-[#0D0D12] text-center max-w-3xl mx-auto">
                Bihar (BSEB) Scholarship Schemes 2026–27
              </h2>
              <p className="mt-4 text-center text-text-muted max-w-2xl mx-auto leading-relaxed">
                Bihar is a leading example of state board scholarships. Applications for BSEB pass
                students open on{" "}
                <strong className="text-primary">25 May 2026</strong> via the official MedhaSoft
                portal.
              </p>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {BIHAR_SCHEMES.map((scheme, i) => (
                <Reveal key={scheme.name} from="up" delay={i * 60}>
                  <div className="glass-card p-6 h-full flex flex-col hover:shadow-glass-lg transition-shadow">
                    <p className="text-accent font-black text-lg">{scheme.amount}</p>
                    <h3 className="mt-2 font-bold text-primary text-base leading-snug">{scheme.name}</h3>
                    <p className="mt-3 text-sm text-text-muted leading-relaxed flex-1">{scheme.eligibility}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal from="up" className="mt-8 text-center">
              <a
                href="https://medhasoft.bihar.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-card bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-[#0D0D12] transition-colors"
              >
                Apply on MedhaSoft (Bihar) <FaExternalLinkAlt className="text-xs" />
              </a>
              <p className="mt-3 text-xs text-text-muted">
                Only for BSEB pass students · CBSE/ICSE not eligible for these schemes
              </p>
            </Reveal>
          </div>
        </section>

        {/* State portals grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Reveal from="up">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
              All India
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#0D0D12]">
              State scholarship portals
            </h2>
            <p className="mt-3 text-text-muted max-w-2xl">
              Every state runs its own portal. Always use official .gov.in links and verify
              notifications on your state education department website.
            </p>
          </Reveal>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATE_PORTALS.map((item, i) => (
              <Reveal key={item.state} from="up" delay={i * 50}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block glass-card p-5 h-full hover:-translate-y-0.5 hover:shadow-glass-lg transition-all"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">{item.state}</p>
                  <h3 className="mt-1 font-bold text-primary group-hover:text-accent transition-colors">
                    {item.portal}
                  </h3>
                  <p className="mt-2 text-xs text-text-muted">{item.note}</p>
                  <FaExternalLinkAlt className="mt-4 text-text-muted text-xs group-hover:text-accent transition-colors" />
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How to apply */}
        <section id="how-to-apply" className="bg-primary py-16 sm:py-20 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal from="up">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
                Step by step
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">
                How to apply for scholarships
              </h2>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {APPLY_STEPS.map((item, i) => (
                <Reveal key={item.step} from="up" delay={i * 70}>
                  <div className="rounded-card border border-white/15 bg-white/5 p-5 backdrop-blur-sm h-full">
                    <span className="text-3xl font-black text-accent/80">{item.step}</span>
                    <h3 className="mt-2 font-bold text-white text-sm">{item.title}</h3>
                    <p className="mt-2 text-xs text-white/70 leading-relaxed">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Documents + Timeline */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10">
            <Reveal from="left">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
                Checklist
              </p>
              <h2 className="mt-3 text-2xl font-black text-[#0D0D12]">Documents you&apos;ll need</h2>
              <ul className="mt-6 space-y-3">
                {DOCUMENTS.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-center gap-3 glass-card px-4 py-3 text-sm text-text-muted"
                  >
                    <FaFileAlt className="shrink-0 text-primary" />
                    {doc}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal from="right">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
                Key dates
              </p>
              <h2 className="mt-3 text-2xl font-black text-[#0D0D12]">2026–27 timeline</h2>
              <div className="mt-6 space-y-0">
                {TIMELINE.map((item, i) => (
                  <div key={item.date} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-accent shrink-0 mt-1.5" />
                      {i < TIMELINE.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border-subtle min-h-[2.5rem]" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-xs font-bold text-accent uppercase tracking-wider">{item.date}</p>
                      <p className="mt-1 text-sm text-text-muted">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">
                Dates are based on official NSP and state notifications. Always confirm on the live portal.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-brand-bg/60 py-16 sm:py-20 scroll-mt-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Reveal from="up">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent text-center">
                FAQ
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#0D0D12] text-center">
                Common questions
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {FAQ.map((item, i) => (
                <Reveal key={item.q} from="up" delay={i * 40}>
                  <FaqItem
                    item={item}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Reveal from="up">
            <div className="rounded-card bg-gradient-to-br from-primary to-[#081229] p-8 sm:p-12 text-white shadow-glass-float overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <FaUniversity className="text-accent text-3xl mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                    Got your scholarship plan?{" "}
                    <span className="text-accent italic">Find your college next.</span>
                  </h2>
                  <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed">
                    Explore campuses, compare courses, read student reviews, and apply online — all
                    on CollegeShip.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:justify-end">
                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center gap-2 rounded-card bg-accent px-6 py-3.5 text-sm font-bold text-white hover:bg-[#b8921f] transition-colors"
                  >
                    Explore Colleges <FaArrowRight />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="inline-flex items-center justify-center gap-2 rounded-card border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <FaIdCard /> Join CollegeShip Free
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}

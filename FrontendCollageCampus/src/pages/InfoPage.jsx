import { Link } from "react-router-dom";
const pageContent = {
  about: {
    title: "About CollegeShip",
    intro:
      "CollegeShip helps students compare colleges, understand programs, review fee structures, and start applications with better clarity.",
    sections: [
      {
        heading: "What We Do",
        body: "We bring college profiles, courses, fees, facilities, reviews, and application tools into one organized experience. Our goal is to reduce confusion during college selection and help students move from research to action with confidence.",
      },
      {
        heading: "How We Support Students",
        body: "Students can browse institutions, compare selected colleges, save favorites, review course details, and submit admission inquiries. We focus on practical decision points such as location, program fit, campus facilities, fee visibility, and application readiness.",
      },
      {
        heading: "Our Approach",
        body: "We aim to keep information clear, structured, and useful. College data may come from institutional submissions, publicly available details, admin curation, and student-facing application workflows, and we encourage students to verify final admission requirements directly with the institution.",
      },
    ],
  },
  careerCounseling: {
    title: "Career Counseling",
    intro:
      "Turn your interests, education goals, preferred location, and budget into a clearer college and course shortlist with CollegeShip.",
    sections: [
      {
        heading: "Start With the Right Questions",
        body: "Career planning begins with understanding the subjects you enjoy, the work you want to explore, your current qualifications, and practical constraints. CollegeShip helps you organize those priorities before comparing institutions, so the decision is based on fit rather than popularity alone.",
      },
      {
        heading: "Connect Courses to Colleges",
        body: "Explore available programs, specializations, duration, study mode, fees, seats, campus facilities, and location in one structured flow. Save promising colleges to Favorites and compare options side by side before deciding where to apply.",
      },
      {
        heading: "Make an Informed Decision",
        body: "Use college details and student-facing information as a starting point, then confirm eligibility, entrance requirements, career outcomes, and final fees directly with the institution. CollegeShip supports your research and application journey but does not replace a licensed counselor or guarantee admission outcomes.",
      },
    ],
    cta: { label: "Explore Colleges", to: "/explore" },
  },
  collegeReviews: {
    title: "College Reviews",
    intro:
      "Learn from student experiences and evaluate colleges with more context before adding them to your shortlist.",
    sections: [
      {
        heading: "Understand the Student Experience",
        body: "Reviews can add useful context about academics, faculty support, campus facilities, student life, placements, and day-to-day experience. CollegeShip presents reviews alongside factual college and course information so no single rating becomes the entire decision.",
      },
      {
        heading: "Review With Context",
        body: "Individual experiences differ by course, year, expectations, and personal circumstances. Compare multiple reviews, note recurring themes, and check the reviewer context where available instead of relying only on an average score.",
      },
      {
        heading: "Share Responsibly",
        body: "Signed-in students can contribute relevant, respectful, experience-based feedback. Reviews may be moderated to remove spam, abuse, promotional claims, or content that does not help students make an informed education decision.",
      },
    ],
    cta: { label: "Browse College Reviews", to: "/explore" },
  },
  applicationSupport: {
    title: "Application Support",
    intro:
      "Move from college research to a submitted admission inquiry with a simple, trackable CollegeShip application flow.",
    sections: [
      {
        heading: "Choose the Right Course",
        body: "Open a college profile, review its available courses and specializations, and select the program that matches your goal. The application form carries the chosen college and course forward so your inquiry reaches the platform with the correct context.",
      },
      {
        heading: "Submit and Receive Confirmation",
        body: "Signed-in students provide their current contact details and submit an application inquiry securely. CollegeShip records the submission in the Student Dashboard and sends a confirmation email containing the selected institution, course, status, and submission date.",
      },
      {
        heading: "Track the Next Step",
        body: "Use Dashboard Applications to review submitted inquiries and status changes. A CollegeShip submission begins the inquiry process; it does not guarantee admission, reserve a seat, or replace documents, payments, interviews, or verification required directly by the college.",
      },
    ],
    cta: { label: "Start an Application", to: "/explore" },
  },
  resources: {
    title: "Student Resources",
    intro:
      "Use practical CollegeShip tools to research, organize, compare, and act on your college options with less confusion.",
    sections: [
      {
        heading: "College Discovery",
        body: "Search and filter colleges by location, course, and institution type. Open detailed profiles for available programs, fee structures, facilities, accreditation, reviews, and other information relevant to your shortlist.",
      },
      {
        heading: "Favorites and Comparison",
        body: "Save colleges to your account so you can return to them from the Student Dashboard. Select up to three institutions for a focused comparison and review important differences before applying.",
      },
      {
        heading: "Application Dashboard",
        body: "Keep submitted admission inquiries organized in one place, review their current status, and retain the selected college and course context. Always verify changing deadlines, eligibility, fees, and seat availability directly with the institution.",
      },
    ],
    cta: { label: "Open Student Dashboard", to: "/dashboard" },
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "This policy explains how CollegeShip handles information when students browse colleges, create accounts, save preferences, or submit admission inquiries.",
    sections: [
      {
        heading: "Information We Collect",
        body: "We may collect account details such as name, email, phone number, education interests, selected colleges, favorites, application details, and basic usage data needed to operate and improve the platform.",
      },
      {
        heading: "How We Use Information",
        body: "We use information to authenticate users, show saved dashboard data, process college applications or inquiries, improve recommendations, send relevant confirmations, maintain security, and support admin operations.",
      },
      {
        heading: "Sharing and Safeguards",
        body: "Application details may be shared with the selected college or admission team when a student submits an inquiry. We do not sell student personal information. Access to admin tools is restricted, and sensitive actions are protected through Firebase authentication and security rules.",
      },
      {
        heading: "Student Choices",
        body: "Students can update account information, manage saved colleges, and contact CollegeShip for privacy-related questions. Some data may be retained where needed for application records, security, or legal compliance.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    intro:
      "These terms describe the rules for using CollegeShip as a college discovery, comparison, and application support platform.",
    sections: [
      {
        heading: "Platform Use",
        body: "Users should provide accurate information, use the platform for genuine education-related purposes, and avoid misuse such as false applications, unauthorized access, scraping, or attempts to disrupt service availability.",
      },
      {
        heading: "College Information",
        body: "We work to present useful college information, but details such as fees, seats, admission dates, eligibility, rankings, and facilities can change. Students should confirm final information with the college before making decisions or payments.",
      },
      {
        heading: "Applications and Communications",
        body: "Submitting an application or inquiry through CollegeShip does not guarantee admission, scholarship approval, seat availability, or direct acceptance. Colleges or admission teams may contact students using the submitted details.",
      },
      {
        heading: "Accounts and Responsibility",
        body: "Users are responsible for keeping login credentials safe and for activity under their account. CollegeShip may restrict access where misuse, inaccurate information, or security concerns are detected.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    intro:
      "This policy explains how CollegeShip may use cookies and similar technologies to support sign-in, analytics, security, and user experience.",
    sections: [
      {
        heading: "Essential Technologies",
        body: "Some browser storage or cookies may be required for authentication, session continuity, security checks, and remembering basic preferences while using the platform.",
      },
      {
        heading: "Analytics and Improvement",
        body: "We may use analytics tools to understand page views, feature usage, device behavior, and performance. This helps us improve college discovery, dashboard flows, and application experiences.",
      },
      {
        heading: "Managing Cookies",
        body: "Users can manage cookies in their browser settings. Blocking some cookies or storage features may affect login, dashboard access, saved colleges, and other personalized platform features.",
      },
    ],
  },
};
export default function InfoPage({ type }) {
  const page = pageContent[type] || pageContent.about;
  return (
    <main className="bg-background min-h-screen pt-28 pb-16">
      {" "}
      <section className="max-w-5xl mx-auto px-6">
        {" "}
        <div className="mb-10">
          {" "}
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent">
            CollegeShip
          </p>{" "}
          <h1 className="text-4xl md:text-5xl font-black text-gray-950 mt-3">
            {page.title}
          </h1>{" "}
          <p className="text-text-muted text-base md:text-lg leading-relaxed mt-4 max-w-3xl">
            {page.intro}
          </p>{" "}
        </div>{" "}
        <div className="grid gap-5">
          {" "}
          {page.sections.map((section) => (
            <article
              key={section.heading}
              className="glass-card p-6 md:p-8"
            >
              {" "}
              <h2 className="text-xl font-bold text-primary mb-3">
                {section.heading}
              </h2>{" "}
              <p className="text-sm md:text-base text-text-muted leading-relaxed">
                {section.body}
              </p>{" "}
            </article>
          ))}{" "}
        </div>{" "}
        {page.cta && (
          <div className="mt-10 rounded-card bg-primary p-7 md:p-9 text-white shadow-card shadow-primary/15">
            {" "}
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#e7c77f]">
              Ready for the next step?
            </p>{" "}
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              {" "}
              <p className="max-w-2xl text-sm leading-relaxed text-white/75">
                Use CollegeShip to turn this guidance into a focused college
                shortlist and a clear next action.
              </p>{" "}
              <Link
                to={page.cta.to}
                className="shrink-0 rounded-card bg-white px-5 py-3 text-center text-sm font-extrabold text-primary transition hover:-translate-y-0.5 hover:shadow-card"
              >
                {" "}
                {page.cta.label}{" "}
              </Link>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </section>{" "}
    </main>
  );
}

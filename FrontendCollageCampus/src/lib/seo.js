import { getCollegeDisplayAddress } from "./collegeMaps";
import { resolveAssetUrl } from "./api";

export const SITE_URL = "https://collageship.web.app";
export const SITE_NAME = "CollegeShip";

export const DEFAULT_SEO = {
  title:
    "CollegeShip — Discover Colleges, Compare Programs & Apply Online in India",
  description:
    "Find the best colleges and university programs in India with CollegeShip. Explore courses, fees, admissions, rankings, reviews, and apply online from one platform.",
  keywords:
    "CollegeShip, colleges in India, university programs, college admission, courses and fees, B.Tech colleges, MBA programs, college search India, apply to college online, university comparison, career counseling, college reviews India",
  ogImage: `${SITE_URL}/og-image.png`,
  ogType: "website",
  robots: "index, follow",
};

export const ROUTE_SEO = {
  "/": {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    keywords: DEFAULT_SEO.keywords,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_SEO.description,
        inLanguage: "en-IN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/og-image.png`,
        description:
          "CollegeShip helps Indian students discover colleges, compare academic programs, read reviews, and apply online.",
        areaServed: {
          "@type": "Country",
          name: "India",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_SEO.description,
      },
    ],
  },
  "/explore": {
    title: "Explore Colleges & University Programs in India",
    description:
      "Search and filter colleges by city, course, and program type. Compare fees, specializations, facilities, and admission details before you apply.",
    keywords:
      "explore colleges India, search university programs, college finder, course search, B.Tech admission, MBA colleges, engineering colleges India, medical colleges, college fees comparison",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Explore Colleges & Programs",
      url: `${SITE_URL}/explore`,
      description:
        "Browse colleges and academic programs across India on CollegeShip.",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
  },
  "/blog": {
    title: "Scholarships Blog — State Board Schemes for Students 2026–27",
    description:
      "Complete guide to state board scholarship schemes in India for 2026–27. NSP deadlines, BSEB MedhaSoft, eligibility, documents, state portals, and how to apply online.",
    keywords:
      "state board scholarship 2027, scholarship for students India, NSP 2026-27, Bihar BSEB scholarship, MedhaSoft, post matric scholarship, pre matric scholarship, state scholarship portal",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "State Board Scholarship Schemes for Students 2026–27",
      description:
        "Guide to government scholarships for Indian state board students including NSP, state portals, eligibility, and application steps.",
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      datePublished: "2026-07-24",
      mainEntityOfPage: `${SITE_URL}/blog`,
      inLanguage: "en-IN",
    },
  },
  "/about": {
    title: "About CollegeShip — College Discovery Platform",
    description:
      "Learn how CollegeShip helps students compare colleges, review programs and fees, save favorites, and submit admission inquiries with clarity.",
    keywords:
      "about CollegeShip, college discovery platform, student college platform India",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "Read how CollegeShip collects, uses, and protects student account, application, and browsing information.",
    robots: "index, follow",
  },
  "/terms": {
    title: "Terms of Use",
    description:
      "Review the terms for using CollegeShip to discover colleges, compare programs, and submit admission inquiries.",
    robots: "index, follow",
  },
  "/cookies": {
    title: "Cookie Policy",
    description:
      "Understand how CollegeShip uses cookies and similar technologies for sign-in, analytics, security, and platform performance.",
    robots: "index, follow",
  },
  "/services/career-counseling": {
    title: "Career Counseling — Choose the Right College Program",
    description:
      "Use CollegeShip career counseling resources to match your interests, budget, and goals with the right college courses and specializations in India.",
    keywords:
      "career counseling India, choose college course, program selection, education planning, college shortlist",
  },
  "/services/college-reviews": {
    title: "College Reviews — Real Student Experiences",
    description:
      "Read student reviews and ratings to evaluate colleges, programs, campus life, and placements before applying.",
    keywords:
      "college reviews India, student reviews, university ratings, campus experience reviews",
  },
  "/services/application-support": {
    title: "Application Support — Apply to Colleges Online",
    description:
      "Submit college admission inquiries online, track application status, and get confirmation emails through CollegeShip.",
    keywords:
      "college application India, admission inquiry, apply to university online, application tracking",
  },
  "/services/resources": {
    title: "Student Resources — Research & Apply Smarter",
    description:
      "Access CollegeShip tools for college discovery, favorites, comparison, and organized application tracking.",
    keywords:
      "student resources, college research tools, compare colleges, admission dashboard",
  },
};

const PRIVATE_ROUTE_PREFIXES = ["/dashboard", "/admin"];

export function truncateText(text, maxLength = 160) {
  if (!text) return "";
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPageTitle(title) {
  if (!title) return DEFAULT_SEO.title;
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

export function getRouteSeoConfig(pathname) {
  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return {
      title: `${SITE_NAME} Account`,
      description: DEFAULT_SEO.description,
      robots: "noindex, nofollow",
      noindex: true,
    };
  }

  if (pathname.startsWith("/college/") || pathname === "/explore") {
    return null;
  }

  const routeConfig = ROUTE_SEO[pathname];
  if (!routeConfig) {
    return {
      ...DEFAULT_SEO,
      canonical: absoluteUrl(pathname),
    };
  }

  return {
    ...DEFAULT_SEO,
    ...routeConfig,
    canonical: absoluteUrl(pathname),
    title: formatPageTitle(routeConfig.title || DEFAULT_SEO.title),
  };
}

function getCourseNames(college) {
  if (!Array.isArray(college?.courses)) return [];
  return college.courses
    .map((course) => {
      if (typeof course === "string") {
        return course.split(" (")[0]?.trim();
      }
      return course?.name?.trim();
    })
    .filter(Boolean);
}

export function buildCollegeSeo(college, collegeId) {
  const name = college?.name?.trim() || "College";
  const city = college?.location?.city?.trim() || "India";
  const courses = getCourseNames(college);
  const courseSummary =
    courses.length > 0
      ? courses.slice(0, 4).join(", ")
      : "undergraduate and postgraduate programs";
  const type = college?.type ? `${college.type} ` : "";
  const address = getCollegeDisplayAddress(college.location);
  const description = truncateText(
    college?.description ||
      `Explore ${name} in ${city}. View ${courseSummary}, fees, admissions, facilities, student reviews, and apply online on CollegeShip.`,
    160,
  );
  const keywords = [
    name,
    `${name} admission`,
    `${name} courses`,
    `${name} fees`,
    `${name} ${city}`,
    ...courses.slice(0, 6),
    city,
    college?.type,
    "college admission India",
    "university programs",
    SITE_NAME,
  ]
    .filter(Boolean)
    .join(", ");

  const canonical = absoluteUrl(`/college/${collegeId}`);
  const image =
    resolveAssetUrl(college?.thumbnail || college?.logo) || DEFAULT_SEO.ogImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name,
    url: canonical,
    description,
    image: image.startsWith("http") ? image : absoluteUrl(image),
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: address,
          addressLocality: city,
          addressCountry: "IN",
        }
      : {
          "@type": "PostalAddress",
          addressLocality: city,
          addressCountry: "IN",
        },
    ...(college?.website
      ? {
          sameAs: college.website.startsWith("http")
            ? college.website
            : `https://${college.website}`,
        }
      : {}),
    ...(college?.contactEmail ? { email: college.contactEmail } : {}),
    ...(college?.contactPhone ? { telephone: college.contactPhone } : {}),
    ...(courses.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${name} Academic Programs`,
            itemListElement: courses.slice(0, 12).map((courseName, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Course",
                name: courseName,
                provider: {
                  "@type": "CollegeOrUniversity",
                  name,
                },
              },
            })),
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Explore Colleges",
        item: absoluteUrl("/explore"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: canonical,
      },
    ],
  };

  return {
    title: formatPageTitle(
      `${name} — Courses, Fees, Admission & Reviews (${city})`,
    ),
    description,
    keywords,
    canonical,
    ogImage: image.startsWith("http") ? image : absoluteUrl(image),
    ogType: "article",
    jsonLd: [jsonLd, breadcrumbJsonLd],
  };
}
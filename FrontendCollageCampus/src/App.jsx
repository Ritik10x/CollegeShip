import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import HomeAbout from "./components/HomeAbout";
import Features from "./components/Features";
import Trajectory from "./components/Trajectory";
import Colleges from "./components/Colleges";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AppBoot from "./components/AppBoot";
import CollegeShipLoader from "./components/CollegeShipLoader";
import AuthModal from "./components/AuthModal";
import ApplyModal from "./components/ApplyModal";
import { SeoManager } from "./components/PageSEO";
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";

const Explore = lazy(() => import("./pages/Explore"));
const Blog = lazy(() => import("./pages/Blog"));
const CollegeDetail = lazy(() => import("./pages/CollegeDetail"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Applications = lazy(() => import("./pages/Applications"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminColleges = lazy(() => import("./pages/admin/AdminColleges"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminCollegeReviews = lazy(() => import("./pages/admin/AdminCollegeReviews"));
const AdminFooterSettings = lazy(() => import("./pages/admin/AdminFooterSettings"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));

function PageLoader() {
  return <CollegeShipLoader label="Loading page…" compact />;
}

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <HomeAbout />
      <Features />
      <Trajectory />
      <Colleges />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}

function ScrollManager() {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const targetId = decodeURIComponent(location.hash.slice(1));
      requestAnimationFrame(() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  return null;
}

function App() {
  React.useEffect(() => {
    logEvent(analytics, "page_view");
  }, []);

  return (
    <Router>
      <AppBoot />
      <AuthModal />
      <ApplyModal />
      <ScrollManager />
      <SeoManager />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/explore"
            element={
              <>
                <Navbar />
                <Explore />
                <Footer />
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <Navbar />
                <Blog />
                <Footer />
              </>
            }
          />
          <Route
            path="/college/:id"
            element={
              <>
                <Navbar />
                <CollegeDetail />
                <Footer />
              </>
            }
          />
          <Route path="/about" element={<><Navbar /><InfoPage type="about" /><Footer /></>} />
          <Route path="/privacy" element={<><Navbar /><InfoPage type="privacy" /><Footer /></>} />
          <Route path="/terms" element={<><Navbar /><InfoPage type="terms" /><Footer /></>} />
          <Route path="/cookies" element={<><Navbar /><InfoPage type="cookies" /><Footer /></>} />
          <Route
            path="/services/career-counseling"
            element={<><Navbar /><InfoPage type="careerCounseling" /><Footer /></>}
          />
          <Route
            path="/services/college-reviews"
            element={<><Navbar /><InfoPage type="collegeReviews" /><Footer /></>}
          />
          <Route
            path="/services/application-support"
            element={<><Navbar /><InfoPage type="applicationSupport" /><Footer /></>}
          />
          <Route
            path="/services/resources"
            element={<><Navbar /><InfoPage type="resources" /><Footer /></>}
          />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="explore" element={<Navigate to="/explore" replace />} />
            <Route path="settings" element={<Settings />} />
            <Route path="compare" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="colleges" element={<AdminColleges />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="college-reviews" element={<AdminCollegeReviews />} />
              <Route path="footer" element={<AdminFooterSettings />} />
              <Route path="applications" element={<AdminApplications />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

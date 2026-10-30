import { Component, Suspense, lazy, useState } from "react";

import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ExamForms from "./pages/ExamForms";
import Exams from "./pages/Exams";
import Preparations from "./pages/Preparations";
import Results from "./pages/Results";
import Subjects from "./pages/Subjects";
import Schedules from "./pages/Schedules";
import Documents from "./pages/Documents";
import Help from "./pages/Help";
import Subscription from "./pages/Subscription";
import Notifications from "./pages/Notifications";
import AdminOverview from "./pages/AdminOverview";
import AdminLogs from "./pages/AdminLogs";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminHelp from "./pages/AdminHelp";
import AdminJobs from "./pages/AdminJobs";

// Payments page alag se load hota hai: isme koi dikkat ho to baaki app band nahi hoga
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
import Jobs from "./pages/Jobs";

import {
  getUser,
  isAdmin,
  isAuthenticated,
  logout,
} from "./services/authService";

// Kisi page me error aaye to poori screen blank hone ki jagah error dikhao
class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("Page crashed:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          margin: "24px auto",
          maxWidth: 640,
          padding: 20,
          border: "1px solid #fecaca",
          background: "#fef2f2",
          color: "#991b1b",
          borderRadius: 12,
          fontSize: 14,
        }}
      >
        <strong>Something went wrong on this page.</strong>

        <div style={{ marginTop: 8, wordBreak: "break-word" }}>
          {String(this.state.error?.message || this.state.error)}
        </div>

        <button
          type="button"
          style={{ marginTop: 14 }}
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}

function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());
  // PayU payment ke baad URL me ?payment=... hota hai -> seedha Subscription page kholo
  const [activePage, setActivePage] = useState(() =>
    new URLSearchParams(window.location.search).has("payment")
      ? "subscription"
      : "dashboard"
  );

  function handleAuthSuccess() {
    setUser(getUser());
    setActivePage("dashboard");
    setLoggedIn(true);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setLoggedIn(false);
    setActivePage("dashboard");
  }

  // Login nahi hai to Login/Signup page dikhao
  if (!loggedIn) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  const admin = isAdmin(user);

  // =====================================================
  // ADMIN sections:
  //   Dashboard Insights, User & Role Management, Logs & Security,
  //   Analytics, Help & Support
  // =====================================================
  if (admin) {
    const adminPage = [
      "dashboard",
      "users",
      "payments",
      "logs",
      "analytics",
      "jobs",
      "help",
    ].includes(activePage)
      ? activePage
      : "dashboard";

    function renderAdminPage() {
      switch (adminPage) {
        case "users":
          return <Students />;

        case "payments":
          return (
            <Suspense
              fallback={
                <div style={{ padding: 30, color: "#64748b" }}>
                  Loading...
                </div>
              }
            >
              <AdminPayments />
            </Suspense>
          );

        case "logs":
          return <AdminLogs />;

        case "analytics":
          return <AdminAnalytics />;

        case "jobs":
          return <AdminJobs />;

        case "help":
          return <AdminHelp />;

        case "dashboard":
        default:
          return (
            <AdminOverview
              user={user}
              onNavigate={setActivePage}
            />
          );
      }
    }

    return (
      <AdminLayout
        activePage={adminPage}
        onNavigate={setActivePage}
        user={user}
        onLogout={handleLogout}
      >
        <PageErrorBoundary key={adminPage}>
          {renderAdminPage()}
        </PageErrorBoundary>
      </AdminLayout>
    );
  }

  // =====================================================
  // STUDENT: pehle jaisa
  // =====================================================
  function renderPage() {
    switch (activePage) {
      case "examForms":
        return <ExamForms />;

      case "exams":
        return <Exams />;

      case "preparations":
        return <Preparations />;

      case "results":
        return <Results />;

      case "subjects":
        return <Subjects />;

      case "schedules":
        return <Schedules />;

      case "documents":
        return <Documents />;

      case "jobs":
        return <Jobs onNavigate={setActivePage} />;

      case "notifications":
        return <Notifications onNavigate={setActivePage} />;

      case "help":
        return <Help onNavigate={setActivePage} />;

      case "subscription":
        return <Subscription onNavigate={setActivePage} />;

      case "dashboard":
      default:
        return (
          <Dashboard
            onNavigate={setActivePage}
            user={user}
          />
        );
    }
  }

  const studentPage =
    activePage === "students" ||
    activePage === "users" ||
    activePage === "payments" ||
    activePage === "logs" ||
    activePage === "analytics"
      ? "dashboard"
      : activePage;

  return (
    <Layout
      activePage={studentPage}
      onNavigate={setActivePage}
      user={user}
      onLogout={handleLogout}
    >
      <PageErrorBoundary key={studentPage}>
        {renderPage()}
      </PageErrorBoundary>
    </Layout>
  );
}

export default App;
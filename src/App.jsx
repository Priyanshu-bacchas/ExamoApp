import { useState } from "react";

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
import Jobs from "./pages/Jobs";

import {
  getUser,
  isAdmin,
  isAuthenticated,
  logout,
} from "./services/authService";

function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());
  const [activePage, setActivePage] = useState("dashboard");

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
        {renderAdminPage()}
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
      {renderPage()}
    </Layout>
  );
}

export default App;
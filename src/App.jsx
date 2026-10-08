import { useState } from "react";

import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ExamForms from "./pages/ExamForms";
import Exams from "./pages/Exams";
import Preparations from "./pages/Preparations";
import Subjects from "./pages/Subjects";
import Schedules from "./pages/Schedules";
import AdminOverview from "./pages/AdminOverview";
import AdminLogs from "./pages/AdminLogs";

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
  // ADMIN: sirf 3 sections
  //   Dashboard Insights, User & Role Management, Logs & Security
  // =====================================================
  if (admin) {
    const adminPage = ["dashboard", "users", "logs"].includes(
      activePage
    )
      ? activePage
      : "dashboard";

    function renderAdminPage() {
      switch (adminPage) {
        case "users":
          return <Students />;

        case "logs":
          return <AdminLogs />;

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

      case "subjects":
        return <Subjects />;

      case "schedules":
        return <Schedules />;

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
    activePage === "students" || activePage === "users" ||
    activePage === "logs"
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

import { useState } from "react";

import Layout from "./components/Layout";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ExamForms from "./pages/ExamForms";
import Exams from "./pages/Exams";
import Preparations from "./pages/Preparations";
import Subjects from "./pages/Subjects";
import Schedules from "./pages/Schedules";

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

  // Student Records sirf Admin ke liye
  const currentPage =
    activePage === "students" && !admin ? "dashboard" : activePage;

  function renderPage() {
    switch (currentPage) {
      case "students":
        return <Students />;

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

  return (
    <Layout
      activePage={currentPage}
      onNavigate={setActivePage}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;

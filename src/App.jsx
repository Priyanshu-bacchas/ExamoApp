import { useState } from "react";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ExamForms from "./pages/ExamForms";
import Exams from "./pages/Exams";
import Preparations from "./pages/Preparations";
import Subjects from "./pages/Subjects";
import Schedules from "./pages/Schedules";

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  function renderPage() {
    switch (activePage) {
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
          />
        );
    }
  }

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
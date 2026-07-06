import React, { useState } from "react";
import ReportIssue from "./components/ReportIssue.jsx";
import Dashboard from "./components/Dashboard.jsx";

function App() {
  const [view, setView] = useState("citizen");

  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="app-brand">
          <div className="app-brand-badge">C</div>
          <div>
            <h1>Civora</h1>
            <p>Citizen reporting and MP planning</p>
          </div>
        </div>
        <div className="view-toggle" role="tablist" aria-label="Workspace view">
          <button
            type="button"
            className={view === "citizen" ? "active" : ""}
            onClick={() => setView("citizen")}
          >
            Citizen View
          </button>
          <button
            type="button"
            className={view === "dashboard" ? "active" : ""}
            onClick={() => setView("dashboard")}
          >
            MP Dashboard
          </button>
        </div>
      </header>
      <main className="app-content">
        {view === "citizen" ? <ReportIssue /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;

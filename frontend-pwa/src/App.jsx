import React, { useState } from "react";
import ReportIssue from "./components/ReportIssue.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';

const MainApp = () => {
  const [view, setView] = useState("citizen");
  const { isAuthenticated, user, isGuest, logout } = useAuth();

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
        
        <div className="flex items-center gap-4">
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
          
          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-4 border-l pl-4 border-gray-200">
              <span className="text-sm text-gray-600 font-medium">
                {isGuest ? 'Guest' : user?.displayName || 'User'}
              </span>
              <button 
                onClick={logout}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="app-content">
        {view === "citizen" ? (
          isAuthenticated ? <ReportIssue /> : <Login />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

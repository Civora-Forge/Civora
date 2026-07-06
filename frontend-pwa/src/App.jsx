import React from "react";
import ReportIssue from "./components/ReportIssue.jsx";

function App() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Civora</h1>
      <p>Multilingual civic-tech platform for local development issues</p>
      <ReportIssue />
    </div>
  );
}

export default App;

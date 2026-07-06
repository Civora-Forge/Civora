import React, { useState } from "react";

const API_BASE_URL = "http://localhost:5001";

function ReportIssue() {
  const [form, setForm] = useState({
    text: "",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: "",
    longitude: "",
    categoryHint: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    // TODO: Add real file upload for photo and audio
    // TODO: Add geolocation API to auto-fill latitude/longitude

    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : 0,
          longitude: form.longitude ? parseFloat(form.longitude) : 0,
          createdAt: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setResult({ success: true, issueId: data.issueId });
        setForm({
          text: "",
          language: "en",
          photoUrl: "",
          audioUrl: "",
          latitude: "",
          longitude: "",
          categoryHint: "",
        });
      } else {
        setResult({ success: false, error: data.error || "Submission failed" });
      }
    } catch (err) {
      setResult({ success: false, error: "Network error — is the backend running?" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Report an Issue</h2>
      {result && (
        <div
          style={{
            padding: 10,
            marginBottom: 10,
            background: result.success ? "#d4edda" : "#f8d7da",
            borderRadius: 4,
          }}
        >
          {result.success
            ? `Issue submitted! ID: ${result.issueId}`
            : `Error: ${result.error}`}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Description</label>
          <br />
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            required
            rows={3}
            style={{ width: "100%" }}
            placeholder="Describe the issue..."
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Language</label>
          <br />
          <select name="language" value={form.language} onChange={handleChange}>
            <option value="en">English</option>
            <option value="ml">Malayalam</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Photo</label>
          <br />
          {/* TODO: Implement real file upload to cloud storage */}
          <input
            type="text"
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="Photo URL (placeholder)"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Audio</label>
          <br />
          {/* TODO: Implement real file upload to cloud storage */}
          <input
            type="text"
            name="audioUrl"
            value={form.audioUrl}
            onChange={handleChange}
            placeholder="Audio URL (placeholder)"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Location</label>
          <br />
          {/* TODO: Add "Use my location" button with navigator.geolocation */}
          <input
            type="number"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            step="any"
            style={{ width: "48%", marginRight: "4%" }}
          />
          <input
            type="number"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            step="any"
            style={{ width: "48%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Category Hint</label>
          <br />
          <select name="categoryHint" value={form.categoryHint} onChange={handleChange}>
            <option value="">-- Select (optional) --</option>
            <option value="roads">Roads</option>
            <option value="schools">Schools</option>
            <option value="health">Health</option>
            <option value="sanitation">Sanitation</option>
            <option value="livelihood">Livelihood</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button type="submit" disabled={submitting} style={{ padding: "8px 16px" }}>
          {submitting ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}

export default ReportIssue;

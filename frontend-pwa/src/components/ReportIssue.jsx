import React, { useState } from "react";
import { LocationPicker } from "./LocationPicker";
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
      setResult({
        success: false,
        error: "Network error — is the backend running?",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_48px_rgba(24,39,75,0.08)] backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Citizen View
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Report an Issue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Submit local infrastructure problems with text, photo, and location
            context.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Multilingual
        </span>
      </div>
      {result && (
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${result.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
        >
          {result.success
            ? `Issue submitted! ID: ${result.issueId}`
            : `Error: ${result.error}`}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Description
          </label>
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the issue..."
            className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-2 sm:max-w-xs">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Language
          </label>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="en">English</option>
            <option value="ml">Malayalam</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Photo
          </label>
          {/* TODO: Implement real file upload to cloud storage */}
          <input
            type="text"
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="Photo URL (placeholder)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Audio
          </label>
          {/* TODO: Implement real file upload to cloud storage */}
          <input
            type="text"
            name="audioUrl"
            value={form.audioUrl}
            onChange={handleChange}
            placeholder="Audio URL (placeholder)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Location
          </label>
          <LocationPicker
            lat={form.latitude}
            lng={form.longitude}
            onChange={(lat, lng, extraText) => {
              setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
              if (extraText) {
                // Prepend location context to the main text if manual/reverse geocoded
                setForm(prev => ({ 
                  ...prev, 
                  text: `[Location: ${extraText}]\n${prev.text}`.trim() 
                }));
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Category Hint
          </label>
          <select
            name="categoryHint"
            value={form.categoryHint}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- Select (optional) --</option>
            <option value="roads">Roads</option>
            <option value="schools">Schools</option>
            <option value="health">Health</option>
            <option value="sanitation">Sanitation</option>
            <option value="livelihood">Livelihood</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(47,109,246,0.22)] transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}

export default ReportIssue;

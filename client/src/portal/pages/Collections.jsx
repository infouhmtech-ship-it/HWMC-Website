import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";
import Proof from "../Proof.jsx";

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const empty = { project: "", visitDate: today(), staffName: "", status: "done", signatureName: "", latitude: "", longitude: "", proofNote: "" };

export default function Collections() {
  const { user } = usePortal();
  const field = user.role === "field";
  const [projects, setProjects] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function load() {
    Promise.all([
      portalFetch("/api/portal/projects"),
      portalFetch("/api/portal/visits"),
    ]).then(([projectRows, visitRows]) => {
      setProjects(projectRows);
      setRows(visitRows);
    }).catch((err) => setError(err.message));
  }

  useEffect(() => {
    document.title = "Collections | HWMC desk";
    load();
  }, []);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await portalFetch("/api/portal/visits", { method: "POST", body: JSON.stringify(form) });
      setForm({ ...empty, visitDate: today() });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <p className="portal-kicker">Stage 5 · Field</p>
      <h1>Collection proof</h1>
      <p className="portal-lede">
        {field
          ? "Collections you have already handed over. Today’s stops are on the Today page."
          : "Log the round after the crew collects. Record who signed at the society or building, and the map point if the phone has one."}
      </p>
      {error ? <p className="portal-error">{error}</p> : null}
      <div className="portal-grid">
        <div className="portal-table-wrap">
          <h2>Recent visits</h2>
          <table className="portal-table">
            <thead><tr><th>Date</th><th>Project</th><th>Proof</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>
                    {row.visitDate}{row.collectedTime ? ` · ${row.collectedTime}` : ""}
                    <br /><span className="portal-pill">{row.status}</span>
                  </td>
                  <td>{row.project?.code}<br />{row.project?.clientName}</td>
                  <td>
                    {row.nextPersonName || row.signatureName || "No next person"}
                    <br /><span className="portal-note">{row.proofNote}</span>
                    <Proof visit={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length ? null : <p className="portal-note">No collections logged yet.</p>}
          {field ? <p className="portal-note"><Link to="/portal">Back to today</Link></p> : null}
        </div>
        {field ? null : (
        <form className="portal-card portal-form" onSubmit={onSubmit}>
          <h2>Log a visit</h2>
          <label>Project
            <select value={form.project} onChange={(event) => set("project", event.target.value)} required>
              <option value="">Choose</option>
              {projects.map((project) => <option key={project._id} value={project._id}>{project.code} · {project.clientName}</option>)}
            </select>
          </label>
          <label>Date<input type="date" value={form.visitDate} onChange={(event) => set("visitDate", event.target.value)} required /></label>
          <label>Staff<input value={form.staffName} onChange={(event) => set("staffName", event.target.value)} /></label>
          <label>Result
            <select value={form.status} onChange={(event) => set("status", event.target.value)}>
              <option value="done">Collected</option>
              <option value="missed">Missed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
          <label>Signature name<input value={form.signatureName} onChange={(event) => set("signatureName", event.target.value)} /></label>
          <label>Latitude<input value={form.latitude} onChange={(event) => set("latitude", event.target.value)} /></label>
          <label>Longitude<input value={form.longitude} onChange={(event) => set("longitude", event.target.value)} /></label>
          <label>Proof note<textarea value={form.proofNote} onChange={(event) => set("proofNote", event.target.value)} rows="3" /></label>
          <button className="portal-btn" type="submit">Save visit</button>
        </form>
        )}
      </div>
    </>
  );
}

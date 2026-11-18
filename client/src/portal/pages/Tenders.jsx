import { useEffect, useState } from "react";
import { portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";

const empty = { reference: "", title: "", organisation: "", category: "Waste collection", notes: "" };

export default function Tenders() {
  const { user } = usePortal();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const canEdit = user.role === "owner" || user.role === "tender";

  function load() {
    portalFetch("/api/portal/tenders").then(setRows).catch((err) => setError(err.message));
  }

  useEffect(() => {
    document.title = "Tenders | HWMC desk";
    load();
  }, []);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onCreate(event) {
    event.preventDefault();
    setError("");
    try {
      await portalFetch("/api/portal/tenders", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(id, status) {
    setError("");
    try {
      await portalFetch(`/api/portal/tenders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <p className="portal-kicker">Stage 1 · PPRA</p>
      <h1>Tender discovery</h1>
      <p className="portal-lede">Watch cleaning and waste tenders on <a href="https://epms.ppra.gov.pk/" target="_blank" rel="noreferrer">epms.ppra.gov.pk</a>. When a tender is marked Submitted, a lead is opened automatically.</p>
      {error ? <p className="portal-error">{error}</p> : null}
      <div className="portal-grid">
        <div className="portal-table-wrap">
          <h2>Watched tenders</h2>
          <table className="portal-table">
            <thead>
              <tr><th>Reference</th><th>Tender</th><th>Status</th>{canEdit ? <th></th> : null}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{row.reference}</td>
                  <td>{row.title}<br /><span className="portal-note">{row.organisation}</span></td>
                  <td><span className="portal-pill">{row.status}</span></td>
                  {canEdit ? (
                    <td className="portal-actions">
                      <button className="portal-btn" type="button" onClick={() => setStatus(row._id, "submitted")}>Submitted</button>
                      <button className="portal-btn line" type="button" onClick={() => setStatus(row._id, "closed")}>Close</button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length ? null : <p className="portal-note">No tenders yet.</p>}
        </div>
        {canEdit ? (
          <form className="portal-card portal-form" onSubmit={onCreate}>
            <h2>Add a tender</h2>
            <label>Reference<input value={form.reference} onChange={(event) => set("reference", event.target.value)} required /></label>
            <label>Title<input value={form.title} onChange={(event) => set("title", event.target.value)} required /></label>
            <label>Organisation<input value={form.organisation} onChange={(event) => set("organisation", event.target.value)} required /></label>
            <label>Category<input value={form.category} onChange={(event) => set("category", event.target.value)} /></label>
            <label>Notes<textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} rows="3" /></label>
            <button className="portal-btn" type="submit">Save tender</button>
          </form>
        ) : null}
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";

const empty = { source: "manual", clientName: "", contactName: "", phone: "", site: "", city: "Lahore", service: "Waste collection", notes: "" };

export default function Leads() {
  const { user } = usePortal();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const canQualify = user.role === "owner" || user.role === "marketing";
  const isOwner = user.role === "owner";

  function load() {
    portalFetch("/api/portal/leads").then(setRows).catch((err) => setError(err.message));
  }

  useEffect(() => {
    document.title = "Leads | HWMC desk";
    load();
  }, []);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onCreate(event) {
    event.preventDefault();
    setError("");
    try {
      await portalFetch("/api/portal/leads", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function act(id, action) {
    setError("");
    try {
      await portalFetch(`/api/portal/leads/${id}/${action}`, { method: "POST", body: "{}" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <p className="portal-kicker">Stage 2 · Approval</p>
      <h1>Leads</h1>
      <p className="portal-lede">A submitted tender opens a lead on its own. Calls, WhatsApp, and walk-ins are added here. Marketing qualifies the lead. The owner approves it and a project is created.</p>
      {error ? <p className="portal-error">{error}</p> : null}
      <div className="portal-grid">
        <div className="portal-table-wrap">
          <h2>Open and closed leads</h2>
          <table className="portal-table">
            <thead>
              <tr><th>Client</th><th>Source</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>
                    <strong>{row.clientName}</strong>
                    <br /><span className="portal-note">{row.site || row.service}{row.phone ? ` · ${row.phone}` : ""}</span>
                  </td>
                  <td>{row.source}{row.tender ? ` · ${row.tender.reference}` : ""}</td>
                  <td><span className={row.status === "rejected" ? "portal-pill muted" : "portal-pill"}>{row.status}</span></td>
                  <td className="portal-actions">
                    {canQualify && row.status === "new" ? <button className="portal-btn line" type="button" onClick={() => act(row._id, "qualify")}>Qualify</button> : null}
                    {isOwner && row.status !== "approved" && row.status !== "rejected" ? <button className="portal-btn" type="button" onClick={() => act(row._id, "approve")}>Approve</button> : null}
                    {isOwner && row.status !== "approved" && row.status !== "rejected" ? <button className="portal-btn line" type="button" onClick={() => act(row._id, "reject")}>Reject</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length ? null : <p className="portal-note">No leads yet.</p>}
        </div>
        <form className="portal-card portal-form" onSubmit={onCreate}>
          <h2>Manual lead</h2>
          <label>Source
            <select value={form.source} onChange={(event) => set("source", event.target.value)}>
              <option value="manual">Manual</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Call</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </label>
          <label>Client<input value={form.clientName} onChange={(event) => set("clientName", event.target.value)} required /></label>
          <label>Contact<input value={form.contactName} onChange={(event) => set("contactName", event.target.value)} /></label>
          <label>Phone<input value={form.phone} onChange={(event) => set("phone", event.target.value)} /></label>
          <label>Site<input value={form.site} onChange={(event) => set("site", event.target.value)} /></label>
          <label>City<input value={form.city} onChange={(event) => set("city", event.target.value)} /></label>
          <label>Service<input value={form.service} onChange={(event) => set("service", event.target.value)} /></label>
          <label>Notes<textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} rows="3" /></label>
          <button className="portal-btn" type="submit">Save lead</button>
        </form>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { money, portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";
import Proof from "../Proof.jsx";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = usePortal();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const canEdit = user.role === "owner" || user.role === "marketing" || user.role === "operations";

  function load() {
    portalFetch(`/api/portal/projects/${id}`).then(setRecord).catch((err) => setError(err.message));
  }

  useEffect(() => {
    document.title = "Project | HWMC desk";
    load();
  }, [id]);

  function update(key, value) {
    setRecord((current) => ({ ...current, project: { ...current.project, [key]: value } }));
  }

  function toggleDay(day) {
    const current = record.project.scheduleDays || [];
    update("scheduleDays", current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      const project = await portalFetch(`/api/portal/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(record.project),
      });
      setRecord((current) => ({ ...current, project }));
      setSaved("Project saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function notifyTeams() {
    setError("");
    try {
      await portalFetch(`/api/portal/projects/${id}/notify`, { method: "POST", body: "{}" });
      setSaved("Sales, operations, field, and finance have been notified.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!record) return error ? <p className="portal-error">{error}</p> : <p>Loading the project…</p>;
  const project = record.project;

  return (
    <>
      <p className="portal-kicker">{project.code}</p>
      <h1>{project.clientName}</h1>
      <p className="portal-lede">{project.site || "Site not recorded"} · {project.service} · Marketing commission {Math.round(project.commissionRate * 100)}%</p>
      {error ? <p className="portal-error">{error}</p> : null}
      {saved ? <p className="portal-note">{saved}</p> : null}
      <form className="portal-grid" onSubmit={save}>
        <div className="portal-card portal-form">
          <h2>Agreement and plan</h2>
          <label>Contract
            <select value={project.contractStatus} onChange={(event) => update("contractStatus", event.target.value)} disabled={!canEdit}>
              <option value="draft">Draft</option>
              <option value="agreed">Agreed</option>
            </select>
          </label>
          <label>Terms<textarea value={project.contractNotes} onChange={(event) => update("contractNotes", event.target.value)} rows="3" disabled={!canEdit} /></label>
          <label>Frequency
            <select value={project.frequency} onChange={(event) => update("frequency", event.target.value)} disabled={!canEdit}>
              <option value="">Not set</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>Plan
            <select value={project.planType} onChange={(event) => update("planType", event.target.value)} disabled={!canEdit}>
              <option value="regular">Regular schedule</option>
              <option value="specific">Specific days</option>
              <option value="custom">Custom plan</option>
            </select>
          </label>
          <div className="portal-days">
            {days.map((day) => (
              <label key={day}>
                <input type="checkbox" checked={project.scheduleDays?.includes(day)} onChange={() => toggleDay(day)} disabled={!canEdit} />
                {day}
              </label>
            ))}
          </div>
          <label>Weekly rate (Rs)
            <input type="number" min="0" value={project.weeklyRate} onChange={(event) => update("weeklyRate", Number(event.target.value))} disabled={!canEdit} />
          </label>
          <label>Status
            <select value={project.status} onChange={(event) => update("status", event.target.value)} disabled={!canEdit}>
              <option value="setup">Setup</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>
        </div>
        <div className="portal-card portal-form">
          <h2>Crew and vehicle</h2>
          <label>Client WhatsApp<input value={project.phone} onChange={(event) => update("phone", event.target.value)} disabled={!canEdit} /></label>
          <label>Staff<input value={project.staffName} onChange={(event) => update("staffName", event.target.value)} disabled={!canEdit} /></label>
          <label>Vehicle<input value={project.vehicle} onChange={(event) => update("vehicle", event.target.value)} disabled={!canEdit} /></label>
          <label>Route<textarea value={project.routeNotes} onChange={(event) => update("routeNotes", event.target.value)} rows="4" disabled={!canEdit} /></label>
          {canEdit ? <button className="portal-btn" type="submit">Save project</button> : null}
          {canEdit ? <button className="portal-btn line" type="button" onClick={notifyTeams}>Notify the teams</button> : null}
          <p className="portal-note"><Link to="/portal/projects">All projects</Link></p>
        </div>
      </form>
      <div className="portal-grid">
        <section className="portal-table-wrap">
          <h2>Collection proof</h2>
          <table className="portal-table">
            <thead><tr><th>Date</th><th>Handover</th><th>Status</th></tr></thead>
            <tbody>
              {record.visits.map((visit) => (
                <tr key={visit._id}>
                  <td>{visit.visitDate}</td>
                  <td>
                    {visit.collectedTime || "—"}
                    <br />{visit.nextPersonName || visit.signatureName || "—"}
                    <br /><span className="portal-note">{visit.proofNote}</span>
                    <Proof visit={visit} />
                  </td>
                  <td><span className="portal-pill">{visit.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {record.visits.length ? null : <p className="portal-note">No visits logged.</p>}
        </section>
        <section className="portal-table-wrap">
          <h2>Invoices</h2>
          <table className="portal-table">
            <thead><tr><th>Week</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {record.invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.periodStart}</td>
                  <td>{money(invoice.amount)}<br /><span className="portal-note">Commission {money(invoice.commissionAmount)}</span></td>
                  <td><span className="portal-pill">{invoice.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {record.invoices.length ? null : <p className="portal-note">No invoices yet.</p>}
        </section>
      </div>
    </>
  );
}

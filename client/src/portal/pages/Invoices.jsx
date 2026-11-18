import { useEffect, useState } from "react";
import { money, portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";

export default function Invoices() {
  const { user } = usePortal();
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canBill = user.role === "owner" || user.role === "finance";

  function load() {
    portalFetch("/api/portal/invoices").then(setRows).catch((err) => setError(err.message));
  }

  useEffect(() => {
    document.title = "Invoices | HWMC desk";
    load();
  }, []);

  async function generate() {
    setError("");
    try {
      const result = await portalFetch("/api/portal/invoices/generate", { method: "POST", body: "{}" });
      const skipped = result.skipped.map((item) => `${item.client}: ${item.reason}`).join(" ");
      setMessage(`Drafted ${result.created} invoice${result.created === 1 ? "" : "s"} for ${result.week.start} to ${result.week.end}. ${skipped}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function send(id) {
    setError("");
    try {
      const result = await portalFetch(`/api/portal/invoices/${id}/sent`, { method: "POST", body: "{}" });
      if (result.url) window.open(result.url, "_blank", "noopener");
      else setMessage("This project has no phone number, so WhatsApp could not be opened. The invoice is marked sent.");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function paid(id) {
    setError("");
    try {
      await portalFetch(`/api/portal/invoices/${id}/paid`, { method: "POST", body: "{}" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <p className="portal-kicker">Stage 6 · Finance</p>
      <h1>Weekly invoices</h1>
      <p className="portal-lede">Active projects with a weekly rate get one invoice for the current week. Marketing commission is 10% of that amount. Sending opens WhatsApp to the client’s number.</p>
      {error ? <p className="portal-error">{error}</p> : null}
      {message ? <p className="portal-note">{message}</p> : null}
      {canBill ? <p><button className="portal-btn" type="button" onClick={generate}>Draft this week’s invoices</button></p> : null}
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr><th>Client</th><th>Period</th><th>Amount</th><th>Status</th>{canBill ? <th></th> : null}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td>{row.project?.clientName}<br /><span className="portal-note">{row.project?.code}</span></td>
                <td>{row.periodStart} to {row.periodEnd}</td>
                <td>{money(row.amount)}<br /><span className="portal-note">Commission {money(row.commissionAmount)}</span></td>
                <td><span className="portal-pill">{row.status}</span></td>
                {canBill ? (
                  <td className="portal-actions">
                    <button className="portal-btn" type="button" onClick={() => send(row._id)}>WhatsApp</button>
                    {row.status !== "paid" ? <button className="portal-btn line" type="button" onClick={() => paid(row._id)}>Mark paid</button> : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length ? null : <p className="portal-note">No invoices yet.</p>}
      </div>
    </>
  );
}

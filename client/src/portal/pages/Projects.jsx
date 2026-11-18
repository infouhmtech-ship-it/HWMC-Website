import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalFetch } from "../api.js";

export default function Projects() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Projects | HWMC desk";
    portalFetch("/api/portal/projects").then(setRows).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <p className="portal-kicker">Stages 3 and 4</p>
      <h1>Projects</h1>
      <p className="portal-lede">An approved lead becomes a project. Open one to agree the contract, set the collection plan, and assign the crew and vehicle.</p>
      {error ? <p className="portal-error">{error}</p> : null}
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr><th>Code</th><th>Client</th><th>Plan</th><th>Contract</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td><Link to={`/portal/projects/${row._id}`}>{row.code}</Link></td>
                <td>{row.clientName}<br /><span className="portal-note">{row.site}</span></td>
                <td>{row.frequency || "Not set"}{row.staffName ? ` · ${row.staffName}` : ""}</td>
                <td><span className="portal-pill">{row.contractStatus}</span></td>
                <td><span className={row.status === "active" ? "portal-pill" : "portal-pill warn"}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length ? null : <p className="portal-note">Approve a lead to open the first project.</p>}
      </div>
    </>
  );
}

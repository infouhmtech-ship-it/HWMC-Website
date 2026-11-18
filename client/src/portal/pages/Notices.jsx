import { useEffect, useState } from "react";
import { portalFetch } from "../api.js";

export default function Notices() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Notices | HWMC desk";
    portalFetch("/api/portal/notices").then(setRows).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <p className="portal-kicker">Stage 7</p>
      <h1>Notices for your desk</h1>
      <p className="portal-lede">The people on a job hear about it here: sales, operations, field staff, finance, and the owner.</p>
      {error ? <p className="portal-error">{error}</p> : null}
      <ul className="portal-list">
        {rows.map((row) => (
          <li className="portal-card" key={row._id}>
            <strong>{row.title}</strong>
            <p>{row.body}</p>
          </li>
        ))}
      </ul>
      {rows.length ? null : <p className="portal-note">Nothing for this desk yet.</p>}
    </>
  );
}

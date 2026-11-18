import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { money, portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";
import Today from "./Today.jsx";

const stages = [
  ["1", "Tenders being watched", "tenders", "/portal/tenders"],
  ["2", "Leads waiting", "leadsWaiting", "/portal/leads"],
  ["3", "Projects in setup", "projectsSetup", "/portal/projects"],
  ["4", "Active rounds", "projectsActive", "/portal/projects"],
  ["5", "Collections logged today", "visitsToday", "/portal/collections"],
  ["6", "Invoices still open", "invoicesOpen", "/portal/invoices"],
];

export default function Dashboard() {
  const { user } = usePortal();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role === "field") return undefined;
    document.title = "Dashboard | HWMC desk";
    portalFetch("/api/portal/dashboard").then(setData).catch((err) => setError(err.message));
    return undefined;
  }, [user.role]);

  if (user.role === "field") return <Today />;

  return (
    <>
      <p className="portal-kicker">Owner view</p>
      <h1>The whole round, on one desk.</h1>
      <p className="portal-lede">Tender discovery, approval, the service plan, proof of collection, the weekly invoice, and the 10% marketing commission.</p>
      {error ? <p className="portal-error">{error}</p> : null}
      {data ? (
        <>
          <div className="portal-stages">
            {stages.map(([num, label, key, to]) => (
              <Link className="portal-stage" to={to} key={key}>
                <span className="portal-kicker">Stage {num}</span>
                <b>{data.counts[key]}</b>
                {label}
              </Link>
            ))}
            <article className="portal-stage">
              <span className="portal-kicker">Commission</span>
              <b>{money(data.counts.commissionDue)}</b>
              Due on unpaid invoices
            </article>
          </div>
          <section className="portal-card" style={{ marginTop: "1rem" }}>
            <h2>Latest notices</h2>
            {data.notices.length ? (
              <ul className="portal-list">
                {data.notices.map((notice) => (
                  <li key={notice._id}>
                    <strong>{notice.title}</strong>
                    <p>{notice.body}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="portal-note">Notices appear when a tender is submitted, a lead is approved, or invoices are drafted.</p>}
          </section>
        </>
      ) : null}
    </>
  );
}

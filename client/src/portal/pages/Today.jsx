import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalFetch } from "../api.js";

function Stop({ stop, today = false }) {
  const done = stop.visit?.status === "done";
  const days = (stop.scheduleDays || []).join(", ");
  return (
    <article className="portal-stop">
      <p className="portal-kicker">{stop.code}{today ? "" : days ? ` · ${days}` : ""}</p>
      <h2>{stop.clientName}</h2>
      <p>{[stop.site, stop.city].filter(Boolean).join(", ") || "Site not recorded"}</p>
      <p>{stop.service || "Waste collection"}{stop.vehicle ? ` · ${stop.vehicle}` : ""}</p>
      {stop.routeNotes ? <p>{stop.routeNotes}</p> : null}
      {stop.staffName ? <p>Assigned: {stop.staffName}</p> : null}
      {stop.unscheduled ? <p>Collection days are not set, so this active round is listed for today.</p> : null}
      {done ? (
        <span className="portal-pill">Collected{stop.visit.collectedTime ? ` at ${stop.visit.collectedTime}` : ""}</span>
      ) : (
        <span className="portal-pill warn">{today ? "Still to collect" : "Not scheduled today"}</span>
      )}
      <Link className="portal-btn" to={`/portal/collections/${stop._id}`}>
        {done ? "View the handover" : "Collection done"}
      </Link>
    </article>
  );
}

export default function Today() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Today | HWMC desk";
    portalFetch("/api/portal/today").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <p className="portal-kicker">Today’s round</p>
      <h1>Where to collect.</h1>
      <p className="portal-lede">
        {data ? `${data.dayName} ${data.today}. Open a stop when the waste is collected, then record the time, the next person, and any page they hand you.` : "Loading today’s stops."}
      </p>
      {error ? <p className="portal-error">{error}</p> : null}
      {data && !data.stops.length ? <p className="portal-note">No collection is scheduled for {data.dayName}.</p> : null}
      <div className="portal-stops">
        {data?.stops.map((stop) => <Stop key={stop._id} stop={stop} today />)}
      </div>
      {data?.later?.length ? (
        <>
          <h2 className="portal-later">Other active rounds</h2>
          <div className="portal-stops">
            {data.later.map((stop) => <Stop key={stop._id} stop={stop} />)}
          </div>
        </>
      ) : null}
    </>
  );
}

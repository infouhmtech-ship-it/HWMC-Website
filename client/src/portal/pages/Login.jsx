import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { portalFetch } from "../api.js";
import "../portal.css";

export default function Login() {
  const navigate = useNavigate();
  const [desks, setDesks] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Staff portal | Hygienic Waste Management Company";
    portalFetch("/api/portal/desks").then(setDesks).catch(() => setDesks([]));
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await portalFetch("/api/portal/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("hwmc-portal-token", result.token);
      navigate("/portal");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portal-login">
      <section className="portal-login-copy">
        <p className="portal-kicker" style={{ color: "#8fd36f" }}>Staff only</p>
        <h1>From the tender to the weekly invoice.</h1>
        <p>This desk follows the company flow: PPRA tenders, lead approval, the project plan, collection proof, and the WhatsApp invoice.</p>
        <ol>
          <li>Watch a tender. Submitted tenders become leads.</li>
          <li>Marketing qualifies. The owner approves and opens a project.</li>
          <li>Operations sets the round, the crew, and the vehicle.</li>
          <li>Field staff log the visit and the signature.</li>
          <li>Finance drafts the weekly invoice and sends it on WhatsApp.</li>
        </ol>
        <p><Link to="/">Back to the website</Link></p>
      </section>
      <form className="portal-form" onSubmit={onSubmit}>
        <p className="portal-kicker">Sign in</p>
        <h1>Choose your desk.</h1>
        <label>Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error ? <p className="portal-error">{error}</p> : null}
        <button className="portal-btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Open the desk"}</button>
        {desks.length ? (
          <div className="portal-desks">
            <p className="portal-kicker">Local accounts</p>
            {desks.map((desk) => (
              <button
                key={desk.email}
                type="button"
                onClick={() => {
                  setEmail(desk.email);
                  setPassword(desk.password);
                }}
              >
                <strong>{desk.name}</strong>
                <span> · {desk.email} · {desk.password}</span>
              </button>
            ))}
          </div>
        ) : null}
      </form>
    </div>
  );
}

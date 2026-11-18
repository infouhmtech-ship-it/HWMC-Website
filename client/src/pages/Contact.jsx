import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const services = [
  "Door-to-door collection",
  "Single-point collection",
  "Janitorial / building cleaning",
  "One-time cleaning",
  "Garbage bags or dustbins",
  "Scrap sale",
  "Other",
];

const timings = ["Morning", "Afternoon", "Flexible", "Need a regular round"];

export default function Contact() {
  const [status, setStatus] = useState("");
  const [params] = useSearchParams();
  const requested = params.get("service") || "";
  const chosenService = services.includes(requested) ? requested : "";

  useEffect(() => {
    document.title = "Contact | Hygienic Waste Management Company";
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const lines = [
      "Service request for Hygienic Waste Management",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email || "—"}`,
      `Organisation: ${data.organisation || "—"}`,
      `Site: ${data.site}`,
      `Service: ${data.service}`,
      `Timing: ${data.timing}`,
      `Details: ${data.details || "—"}`,
    ];
    const url = `https://wa.me/923092914489?text=${encodeURIComponent(lines.join("\n"))}`;
    let saved = false;
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      saved = response.ok;
    } catch {
      saved = false;
    }
    setStatus(saved
      ? "WhatsApp is opening with your request. Send the message there to reach the team. A copy is saved for the office."
      : "WhatsApp is opening with your request. Send the message there to reach the team.");
    window.open(url, "_blank", "noopener");
  }

  return (
    <main id="content">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Contact</p>
          <h1>Tell us the site. We will confirm the visit.</h1>
          <p className="lede">Office hours are Monday to Saturday, 9:00 am to 6:00 pm. For a complaint after a visit, call the mobile at any hour and it will be taken up with the crew.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap office-grid">
          <article className="office">
            <p className="kicker">Head office</p>
            <h3>Garden Town, Lahore</h3>
            <p>69-MZ Floor, Central Plaza, Barkat Market, Garden Town, Lahore.</p>
            <p style={{ marginTop: "0.8rem" }}><a href="tel:+924235941169">042-35941169</a><br /><a href="tel:+923092914489">0309-2914489</a></p>
            <iframe className="map" title="Map of Central Plaza, Barkat Market, Garden Town, Lahore" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Central%20Plaza%20Barkat%20Market%20Garden%20Town%20Lahore&z=16&output=embed"></iframe>
          </article>
          <article className="office">
            <p className="kicker">Sub office</p>
            <h3>Adyala Road, Rawalpindi</h3>
            <p>1, Raja House, Abu Bakar, Mubaraklane, Dhok Kalhoor, Adyala Road, Rawalpindi.</p>
            <p style={{ marginTop: "0.8rem" }}><a href="mailto:info@hygienicwastemanagement.com">info@hygienicwastemanagement.com</a><br /><a href="mailto:hygienicwaste@gmail.com">hygienicwaste@gmail.com</a></p>
            <iframe className="map" title="Map of Adyala Road, Rawalpindi" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Adyala%20Road%20Rawalpindi&z=14&output=embed"></iframe>
          </article>
        </div>
      </section>

      <section className="band">
        <div className="wrap split">
          <div>
            <p className="kicker">Request</p>
            <h2>Send the details on WhatsApp.</h2>
            <p className="lede">The form opens WhatsApp with the details filled in, so you can send them to 0309-2914489. When the office database is available, a copy is saved there as well. You can also call or email if that is easier.</p>
            <p className="lede"><a href="https://wa.me/923092914489">Open WhatsApp without the form</a></p>
          </div>
          <form id="pickup-form" className="panel form" onSubmit={onSubmit}>
            <div className="form-row">
              <label>Name
                <input name="name" autoComplete="name" required />
              </label>
              <label>Phone
                <input name="phone" type="tel" autoComplete="tel" required />
              </label>
            </div>
            <div className="form-row">
              <label>Email <span style={{ fontWeight: 500, color: "var(--muted)" }}>(optional)</span>
                <input name="email" type="email" autoComplete="email" />
              </label>
              <label>Organisation <span style={{ fontWeight: 500, color: "var(--muted)" }}>(optional)</span>
                <input name="organisation" autoComplete="organization" />
              </label>
            </div>
            <label>Site address
              <input name="site" required placeholder="Society, street, or building" />
            </label>
            <div className="form-row">
              <label>Service
                <select name="service" required key={chosenService} defaultValue={chosenService}>
                  <option value="">Choose one</option>
                  {services.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>Preferred timing
                <select name="timing" required defaultValue="">
                  <option value="">Choose one</option>
                  {timings.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label>What should the crew know?
              <textarea name="details" placeholder="Material, access, how often, or anything unusual about the load."></textarea>
            </label>
            <button className="btn btn-fill" type="submit">Open this request in WhatsApp</button>
            {status ? <p id="form-status" className="form-status">{status}</p> : null}
          </form>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">Before you call</p>
          <h2>Short answers</h2>
          <div className="faq" style={{ marginTop: "1.2rem" }}>
            <details>
              <summary>How often can you come?</summary>
              <p>Daily, weekly, bi-weekly, monthly, or once. You set the schedule. A one-time clean is fine for a move or an event.</p>
            </details>
            <details>
              <summary>What if I need to reschedule?</summary>
              <p>Call at least 48 hours ahead when you can, on 0309-2914489.</p>
            </details>
            <details>
              <summary>What if the job needs to change?</summary>
              <p>Say what is different. If a new quote is needed, you get it before the extra work is done.</p>
            </details>
            <details>
              <summary>How do I pay?</summary>
              <p>Payment is due on the day of the visit. Cash or cheque made out to HWM. You receive a receipt.</p>
            </details>
            <details>
              <summary>Who do I tell if something was missed?</summary>
              <p>Tell the crew while they are on site, or call 0309-2914489. The company asks you to flag a cleaning problem within 24 hours.</p>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}

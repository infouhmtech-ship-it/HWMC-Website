import { useEffect } from "react";
import { Link } from "react-router-dom";
import Clients from "../components/Clients.jsx";
import { materials, sectors, services } from "../data.js";

const registrations = [
  ["Lahore Waste Management Company", "LWMC registration"],
  ["Federal Board of Revenue", "Sales and income tax"],
  ["Punjab Revenue Authority", "PRA registration"],
  ["Environmental Protection Agency", "EPA registration"],
  ["Registrar of Firms", "Firm registration"],
];

const steps = [
  ["1. You describe the site", "Call, WhatsApp, or use the form. Say what needs collecting or cleaning, and how often."],
  ["2. Scope is confirmed", "We agree the place, the timing, and the price before work starts. A requote is given if the job changes."],
  ["3. The crew attends", "Waste goes in company vehicles. Cleaners follow the checklist for that site."],
  ["4. You get a receipt", "Payment is due on the day of service. Cash or cheque to HWM, with a receipt after the visit."],
];

export default function Home() {
  useEffect(() => {
    document.title = "Hygienic Waste Management Company | Lahore & Rawalpindi";
  }, []);

  return (
    <main id="content">
      <section className="hero">
        <div className="hero-motion" aria-hidden="true">
          <span className="orb orb-a"></span>
          <span className="orb orb-b"></span>
          <span className="orb orb-c"></span>
        </div>
        <div className="wrap hero-grid">
          <div>
            <p className="kicker">Lahore and Rawalpindi · Since 2014</p>
            <h1>Waste collection and cleaning, on a schedule you set.</h1>
            <p className="lede">Hygienic Waste Management picks up waste door to door or from a single point, cleans buildings, supplies bags and dustbins, and buys scrap. One call covers a one-time job or a daily, weekly, or monthly round.</p>
            <div className="cta-actions" style={{ marginTop: "1.5rem" }}>
              <Link className="btn btn-fill" to="/contact">Request a pickup</Link>
              <Link className="btn btn-line" to="/services">View services</Link>
            </div>
            <ul className="hero-meta">
              <li><strong>Office hours</strong><span>Monday–Saturday, 9:00 am – 6:00 pm</span></li>
              <li><strong>Two offices</strong><span>Garden Town and Adyala Road</span></li>
              <li><strong>Registered</strong><span>LWMC, FBR, PRA, EPA, Registrar of Firms</span></li>
            </ul>
          </div>
          <aside className="hero-card">
            <p className="kicker">Call the desk</p>
            <h2>0309-2914489</h2>
            <p><a href="tel:+923092914489">Mobile and WhatsApp</a></p>
            <p><a href="tel:+924235941169">Lahore landline 042-35941169</a></p>
            <hr />
            <p className="kicker">Head office</p>
            <p>69-MZ Floor, Central Plaza, Barkat Market, Garden Town, Lahore.</p>
            <p style={{ marginTop: "1rem" }}><Link to="/contact">Offices, map, and request form</Link></p>
          </aside>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="kicker">Where the crews work</p>
          <h2>Sites we already organise around</h2>
          <ul className="sectors" aria-label="Types of sites">
            {sectors.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <Clients />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="kicker">Services</p>
              <h2>Collection, cleaning, supplies, and scrap.</h2>
            </div>
            <p>Tell us the site and how often you need a visit. We confirm the scope before the crew is booked.</p>
          </div>
          <div className="cards">
            {services.map((service) => (
              <Link className="card" to={`/services/${service.id}`} key={service.id}>
                <span className="num">{service.num}</span>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap split">
          <div>
            <p className="kicker">The company</p>
            <h2>Operating since 2014, with the registrations the work requires.</h2>
            <p className="lede">The crews cover waste collection, housing-society lifting, stewarding, public-area cleaning, glass, and floor care. Staff work in uniform, carry a service card, and the company makes a written agreement with the client.</p>
            <p className="lede"><Link to="/about">Read the company background</Link></p>
          </div>
          <ul className="reg-list">
            {registrations.map(([name, note]) => (
              <li key={name}><strong>{name}</strong><span>{note}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">How a job is booked</p>
          <h2>From the call to the next visit.</h2>
          <ol className="steps">
            {steps.map(([title, text]) => (
              <li key={title}><strong>{title}</strong><p>{text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band">
        <div className="wrap split">
          <div>
            <p className="kicker">Materials</p>
            <h2>What we collect, and what we buy as scrap.</h2>
            <p className="lede">Everyday waste is collected for disposal. Recyclable scrap can be sold to us instead of thrown out. Collected waste can be held at the company warehouse before it moves on.</p>
          </div>
          <div>
            <ul className="materials">
              {materials.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="note" style={{ marginTop: "1rem" }}>If a load is unusual, say so when you book so the right vehicle is sent.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap cta-inner">
          <div>
            <h2>Need a pickup or a cleaning visit?</h2>
            <p>Office lines are open Monday to Saturday, 9:00 am to 6:00 pm. For a complaint about a visit, call 0309-2914489 and the team will take it up with the crew.</p>
          </div>
          <div className="cta-actions">
            <Link className="btn btn-light" to="/contact">Send a request</Link>
            <a className="btn btn-line" href="https://wa.me/923092914489" style={{ borderColor: "rgba(255,255,255,.4)", color: "white" }}>WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { services } from "../data.js";

export default function Services() {
  const { hash } = useLocation();
  const target = services.find((service) => service.id === decodeURIComponent(hash.replace(/^#/, "")));

  useEffect(() => {
    document.title = "Services | Hygienic Waste Management Company";
  }, []);

  if (target) return <Navigate to={`/services/${target.id}`} replace />;

  return (
    <main id="content">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Services</p>
          <h1>Work matched to the site, not a fixed package.</h1>
          <p className="lede">Visits can be daily, weekly, bi-weekly, monthly, or a single clean. Reschedule with at least 48 hours’ notice when you can. If the scope changes, we requote before doing the extra work.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
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
            <p className="kicker">On the day</p>
            <h2>What you should expect from a visit.</h2>
            <ul className="plain-list">
              <li>A written agreement for ongoing work.</li>
              <li>Staff in uniform, with a service card.</li>
              <li>Transport in the company’s waste vehicles.</li>
              <li>Payment on the day, by cash or cheque to HWM, and a receipt.</li>
              <li>A complaint line on 0309-2914489 if something on the visit is wrong. Tell the crew while they are there, or call and it will be taken up with them.</li>
            </ul>
          </div>
          <div className="panel">
            <p className="kicker">If plans change</p>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>Call before the visit.</h2>
            <p>Give 48 hours’ notice when you need to move a booking. If you want a different frequency or extra rooms, we alter the agenda and send a new quote before that work is done.</p>
            <p style={{ marginTop: "1rem" }}><Link className="btn btn-fill" to="/contact">Request a service</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { services } from "../data.js";

export default function Service() {
  const { serviceId } = useParams();
  const service = services.find((item) => item.id === serviceId);

  useEffect(() => {
    if (service) document.title = `${service.title} | Hygienic Waste Management Company`;
  }, [service]);

  if (!service) return <Navigate to="/services" replace />;

  const request = `/contact?service=${encodeURIComponent(service.formOption)}#pickup-form`;
  const others = services.filter((item) => item.id !== service.id);
  const [file, caption, alt] = service.photo;

  return (
    <main id="content">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Service {service.num}</p>
          <h1>{service.title}</h1>
          <p className="lede">{service.lede}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <p className="kicker">What the visit covers</p>
            <h2>The work, stated before the crew is booked.</h2>
            <ul className="plain-list">
              {service.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="lede" style={{ marginTop: "1.2rem" }}>{service.visit}</p>
            <p style={{ marginTop: "1.2rem" }}>
              <Link className="btn btn-fill" to={request}>Request this service</Link>
            </p>
          </div>
          <div>
            <figure className="service-photo">
              <img src={`/assets/gallery/${file}`} alt={alt} />
              <figcaption>{caption}</figcaption>
            </figure>
            <div className="panel" style={{ marginTop: "1rem" }}>
              <p className="kicker">Suited to</p>
              <ul className="plain-list">
                {service.suited.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap split">
          <div>
            <p className="kicker">On the day</p>
            <h2>The same terms as every other visit.</h2>
            <ul className="plain-list">
              <li>A written agreement for ongoing work.</li>
              <li>Staff in uniform, with a service card.</li>
              <li>Payment on the day, by cash or cheque to HWM, and a receipt.</li>
              <li>Give 48 hours’ notice when a booking needs to move.</li>
              <li>If something on the visit is wrong, tell the crew there or call 0309-2914489.</li>
            </ul>
          </div>
          <div>
            <p className="kicker">Other services</p>
            <h2>The rest of the work.</h2>
            <ul className="service-links">
              {others.map((item) => (
                <li key={item.id}><Link to={`/services/${item.id}`}>{item.title}</Link></li>
              ))}
            </ul>
            <p style={{ marginTop: "1.2rem" }}><Link to="/services">All services</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}

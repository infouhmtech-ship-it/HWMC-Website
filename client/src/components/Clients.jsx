import { clientLogos } from "../data.js";

function Row({ logos, hidden = false }) {
  return (
    <ul className={hidden ? "logo-row is-clone" : "logo-row"} aria-hidden={hidden || undefined}>
      {logos.map(([file, name]) => (
        <li key={`${hidden ? "b" : "a"}-${file}`}>
          <img src={`/assets/clients/logo-${file}.png`} alt={hidden ? "" : name} />
        </li>
      ))}
    </ul>
  );
}

export default function Clients() {
  const first = clientLogos.slice(0, 26);
  const second = clientLogos.slice(26);
  return (
    <section className="clients" aria-labelledby="clients-title">
      <div className="wrap clients-head">
        <p className="kicker">Clients</p>
        <h2 id="clients-title">Organisations already on the round.</h2>
        <p>Housing schemes, hospitals, hotels, campuses, and plants the crews serve in Lahore and Rawalpindi.</p>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          <Row logos={first} />
          <Row logos={first} hidden />
        </div>
      </div>
      <div className="marquee">
        <div className="marquee-track reverse">
          <Row logos={second} />
          <Row logos={second} hidden />
        </div>
      </div>
    </section>
  );
}

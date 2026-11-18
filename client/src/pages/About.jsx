import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "About | Hygienic Waste Management Company";
  }, []);

  return (
    <main id="content">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">About the company</p>
          <h1>A Lahore waste and cleaning firm, started in 2014.</h1>
          <p className="lede">Hygienic Waste Management collects waste, lifts it from housing societies, and cleans the places around it: public areas, glass, and floors, plus stewarding where a site needs it. The head office is in Garden Town. A sub office sits on Adyala Road in Rawalpindi.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <blockquote className="quote">
            <p>The aim is a working system for collection and cleaning, with government bodies, private clients, and residents, so waste is handled properly and the places people use stay fit to be in.</p>
            <footer>Sarfraz Ahmed, Chief Executive</footer>
          </blockquote>
          <div>
            <p className="kicker">How the work is run</p>
            <h2>Trained crews, a written agreement, and a place to hold the waste.</h2>
            <p className="lede">Staff are trained for the cleaning and collection they are sent to do. They attend in uniform with a service card. Ongoing clients get a written agreement. Vehicles are set up to move waste, and the company keeps a warehouse for temporary holding. The work follows the rules of the Punjab environmental authority and the Punjab Health Department.</p>
            <div className="people">
              <p className="person"><strong>Sarfraz Ahmed</strong><br /><span>Chief Executive</span></p>
              <p className="person"><strong>Ijaz Ahmed</strong><br /><span>General Manager</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap split">
          <div>
            <p className="kicker">Registrations</p>
            <h2>The bodies named on the company registration file.</h2>
            <p className="lede">Copies of the registration sheets are in the 2023 company profile. The old website listed “Pakistan Revenue Authority”; the registration page itself is marked PRA, which is the Punjab Revenue Authority.</p>
          </div>
          <ul className="reg-list">
            <li><strong>Lahore Waste Management Company</strong><span>LWMC</span></li>
            <li><strong>Federal Board of Revenue</strong><span>Sales and income tax</span></li>
            <li><strong>Punjab Revenue Authority</strong><span>PRA</span></li>
            <li><strong>Environmental Protection Agency</strong><span>EPA</span></li>
            <li><strong>Registrar of Firms</strong><span>Firm registration</span></li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">What the company holds itself to</p>
          <h2>Three working rules, from the company profile.</h2>
          <div className="cards" style={{ marginTop: "1.4rem" }}>
            <article className="card">
              <h3>Do the job properly</h3>
              <p>Quality is treated as the standard of the visit, not a slogan on the van. If a clean is not right, call within a day and say what was missed.</p>
            </article>
            <article className="card">
              <h3>Stay with the client’s brief</h3>
              <p>Frequency, rooms, and collection points are set with you. A change is quoted before it is done.</p>
            </article>
            <article className="card">
              <h3>Look after the crew</h3>
              <p>The stated aim is a safe workplace and a team that is paid and spoken to with ordinary respect. That is how a round stays reliable.</p>
            </article>
          </div>
          <p className="lede"><a href="/assets/hwm-company-profile-2023.pdf">Download the 2023 company profile (PDF)</a></p>
        </div>
      </section>
    </main>
  );
}

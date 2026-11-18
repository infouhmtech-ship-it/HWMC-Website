import { useEffect, useState } from "react";
import { gallery } from "../data.js";

export default function Gallery() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    document.title = "Gallery | Hygienic Waste Management Company";
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <main id="content">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Gallery</p>
          <h1>Crews, vehicles, and the round itself.</h1>
          <p className="lede">Photographs from collection and cleaning visits. Select a picture to see it larger.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap gallery-grid">
          {gallery.map(([file, caption, alt]) => (
            <button className="shot" type="button" key={file} onClick={() => setActive({ file, caption, alt })}>
              <img src={`/assets/gallery/${file}`} alt={alt} />
              <span className="shot-cap">{caption}</span>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div className="lightbox-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.caption}>
            <button className="lightbox-close" type="button" onClick={() => setActive(null)}>Close</button>
            <img src={`/assets/gallery/${active.file}`} alt={active.alt} />
            <figcaption>{active.caption}</figcaption>
          </div>
        </div>
      )}
    </main>
  );
}

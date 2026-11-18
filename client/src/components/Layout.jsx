import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { services } from "../data.js";

const pages = [
  { to: "/", label: "Home", end: true },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesDismissed, setServicesDismissed] = useState(false);
  const year = new Date().getFullYear();
  const onContact = location.pathname === "/contact";

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView();
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".card, .service-row, .office, .logo-row li");
    const onMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    nodes.forEach((node) => node.addEventListener("pointermove", onMove));
    return () => nodes.forEach((node) => node.removeEventListener("pointermove", onMove));
  }, [location.pathname]);

  function closeMenu() {
    setMenuOpen(false);
    setServicesOpen(false);
  }

  function onServicesClick(event) {
    if (window.matchMedia("(max-width: 820px)").matches) {
      event.preventDefault();
      setServicesOpen((open) => !open);
    } else {
      closeMenu();
    }
  }

  function onServiceOptionClick() {
    closeMenu();
    setServicesDismissed(true);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <header className="site-head">
        <div className="topbar">
          <div className="wrap topbar-inner">
            <p>Head office: Garden Town, Lahore · Sub office: Adyala Road, Rawalpindi</p>
            <p className="topbar-links">
              <a href="mailto:info@hygienicwastemanagement.com">info@hygienicwastemanagement.com</a>
              <span>Mon–Sat, 9:00 am – 6:00 pm</span>
            </p>
          </div>
        </div>
        <div className="header-bar wrap">
          <Link className="brand" to="/" onClick={closeMenu}>
            <img src="/assets/mark.png?v=2" alt="" width="52" height="52" />
            <span>
              <span className="brand-name">Hygienic</span>
              <span className="brand-sub">Waste Management</span>
            </span>
          </Link>
          <nav id="site-nav" className={menuOpen ? "nav is-open" : "nav"} aria-label="Primary">
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <div
              className={["nav-item", servicesOpen ? "is-open" : "", servicesDismissed ? "is-dismissed" : ""].filter(Boolean).join(" ")}
              onMouseLeave={() => setServicesDismissed(false)}
            >
              <NavLink to="/services" aria-expanded={servicesOpen} onClick={onServicesClick}>
                Services<span className="caret" aria-hidden="true"></span>
              </NavLink>
              <div className="submenu" id="services-menu">
                {services.map((service) => (
                  <Link key={service.id} to={`/services/${service.id}`} onClick={onServiceOptionClick}>{service.menu}</Link>
                ))}
              </div>
            </div>
            {pages.slice(1).map((page) => (
              <NavLink key={page.to} to={page.to} onClick={closeMenu}>{page.label}</NavLink>
            ))}
            <Link className="nav-cta" to={onContact ? "/contact#pickup-form" : "/contact"} onClick={closeMenu}>Request a pickup</Link>
          </nav>
          <div className="header-actions">
            <a className="btn btn-line" href="tel:+923092914489">0309-2914489</a>
            <Link className="btn btn-fill" to={onContact ? "/contact#pickup-form" : "/contact"}>Request a pickup</Link>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                setMenuOpen((open) => {
                  if (open) setServicesOpen(false);
                  return !open;
                });
              }}
            >
              <span className="burger"></span>
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <strong>Hygienic Waste Management Company</strong>
            <p>Collection, janitorial cleaning, bins, and scrap buying for Lahore and Rawalpindi. Registered with LWMC, FBR, PRA, EPA, and the Registrar of Firms.</p>
          </div>
          <div>
            <h2>Pages</h2>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h2>Services</h2>
            <ul>
              {services.map((service) => (
                <li key={service.id}><Link to={`/services/${service.id}`}>{service.menu}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Offices</h2>
            <ul>
              <li>69-MZ Floor, Central Plaza, Barkat Market, Garden Town, Lahore</li>
              <li>1, Raja House, Abu Bakar, Mubaraklane, Dhok Kalhoor, Adyala Road, Rawalpindi</li>
              <li><a href="tel:+923092914489">0309-2914489</a></li>
              <li><a href="mailto:info@hygienicwastemanagement.com">info@hygienicwastemanagement.com</a></li>
            </ul>
          </div>
        </div>
        <div className="wrap legal">
          <p>© {year} Hygienic Waste Management Company</p>
          <nav aria-label="More">
            <a href="/assets/hwm-company-profile-2023.pdf">Company profile (PDF)</a>
            <Link to="/portal">Staff portal</Link>
            <a href="https://www.facebook.com/hygienic.waste/">Facebook</a>
            <a href="https://www.instagram.com/hygienicwastemanagement">Instagram</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

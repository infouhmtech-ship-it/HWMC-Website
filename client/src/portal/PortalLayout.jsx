import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { roleLabels } from "./api.js";
import { usePortal } from "./auth.jsx";
import "./portal.css";

const links = [
  { to: "/portal", label: "Dashboard", end: true },
  { to: "/portal/tenders", label: "Tenders", roles: ["owner", "tender", "marketing"] },
  { to: "/portal/leads", label: "Leads", roles: ["owner", "tender", "marketing"] },
  { to: "/portal/projects", label: "Projects", roles: ["owner", "marketing", "operations", "finance"] },
  { to: "/portal/collections", label: "Collections", roles: ["owner", "operations", "field"] },
  { to: "/portal/invoices", label: "Invoices", roles: ["owner", "finance", "marketing"] },
  { to: "/portal/notices", label: "Notices" },
];

export default function PortalLayout() {
  const { user } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = links
    .filter((link) => !link.roles || link.roles.includes(user.role))
    .map((link) => (user.role === "field" && link.end ? { ...link, label: "Today" } : link));

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function signOut() {
    localStorage.removeItem("hwmc-portal-token");
    navigate("/portal/login");
  }

  return (
    <div className="portal">
      <aside className={menuOpen ? "portal-side is-open" : "portal-side"}>
        <div className="portal-top">
          <Link className="portal-brand" to="/portal">
            <img src="/assets/mark.png" alt="" />
            <span>
              <strong>HWMC desk</strong>
              <span>Internal portal</span>
            </span>
          </Link>
          <button
            className="portal-menu"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className="portal-drawer">
          <nav className="portal-nav" aria-label="Portal">
            {visible.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
            ))}
          </nav>
          <footer>
            <p>{user.name}<br />{roleLabels[user.role]}</p>
            <button className="portal-btn line" type="button" onClick={signOut}>Sign out</button>
            <Link to="/">Public website</Link>
          </footer>
        </div>
      </aside>
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}

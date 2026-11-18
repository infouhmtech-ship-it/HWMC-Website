import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Service from "./pages/Service.jsx";
import About from "./pages/About.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import { PortalAuth } from "./portal/auth.jsx";
import PortalLayout from "./portal/PortalLayout.jsx";
import Login from "./portal/pages/Login.jsx";
import Dashboard from "./portal/pages/Dashboard.jsx";
import Tenders from "./portal/pages/Tenders.jsx";
import Leads from "./portal/pages/Leads.jsx";
import Projects from "./portal/pages/Projects.jsx";
import ProjectDetail from "./portal/pages/ProjectDetail.jsx";
import Collections from "./portal/pages/Collections.jsx";
import Handover from "./portal/pages/Handover.jsx";
import Invoices from "./portal/pages/Invoices.jsx";
import Notices from "./portal/pages/Notices.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="portal/login" element={<Login />} />
      <Route path="portal" element={<PortalAuth><PortalLayout /></PortalAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="tenders" element={<Tenders />} />
        <Route path="leads" element={<Leads />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="collections" element={<Collections />} />
        <Route path="collections/:projectId" element={<Handover />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="notices" element={<Notices />} />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:serviceId" element={<Service />} />
        <Route path="about" element={<About />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  const servicesLink = nav.querySelector(".nav-item > a");
  const servicesItem = nav.querySelector(".nav-item");
  const mobileMenu = window.matchMedia("(max-width: 820px)");

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    if (servicesItem) servicesItem.classList.remove("is-open");
    if (servicesLink) servicesLink.setAttribute("aria-expanded", "false");
  };

  if (servicesLink) servicesLink.setAttribute("aria-expanded", "false");

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const isServices = link === servicesLink && mobileMenu.matches;
      if (isServices) {
        event.preventDefault();
        const open = servicesItem.classList.toggle("is-open");
        servicesLink.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      closeMenu();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  toggle.addEventListener("click", () => {
    if (!nav.classList.contains("is-open") && servicesItem) {
      servicesItem.classList.remove("is-open");
      if (servicesLink) servicesLink.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".sub-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".nav-item");
    const open = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

document.querySelectorAll(".card, .service-row, .office, .logo-row li").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

const lightbox = document.querySelector("#lightbox");
if (lightbox) {
  const frame = lightbox.querySelector("img");
  const caption = lightbox.querySelector("figcaption");
  document.querySelectorAll(".shot").forEach((shot) => {
    shot.addEventListener("click", () => {
      frame.src = shot.dataset.full;
      frame.alt = shot.dataset.caption;
      caption.textContent = shot.dataset.caption;
      lightbox.showModal();
    });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const form = document.querySelector("#pickup-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = [
      "Service request for Hygienic Waste Management",
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Email: ${data.get("email") || "—"}`,
      `Organisation: ${data.get("organisation") || "—"}`,
      `Site: ${data.get("site")}`,
      `Service: ${data.get("service")}`,
      `Timing: ${data.get("timing")}`,
      `Details: ${data.get("details") || "—"}`,
    ];
    const url = `https://wa.me/923092914489?text=${encodeURIComponent(lines.join("\n"))}`;
    const status = document.querySelector("#form-status");
    if (status) {
      status.hidden = false;
      status.textContent = "WhatsApp is opening with your request. Send the message there to reach the team. Nothing is stored on this website.";
    }
    window.open(url, "_blank", "noopener");
  });
}

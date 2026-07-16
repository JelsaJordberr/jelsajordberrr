(function () {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone
    || new URLSearchParams(window.location.search).get("app") === "1";
  const isOverviewApp = /\/oversikt\.html$/.test(window.location.pathname);
  const useAppLayout = isStandalone && isOverviewApp;

  document.documentElement.classList.toggle("mobile-app-mode", useAppLayout);
  document.documentElement.classList.toggle("mobile-web-mode", !useAppLayout);

  const nav = document.querySelector("nav");
  if (!nav || document.body.classList.contains("seller-app")) return;
  if (!nav.id) nav.id = "site-navigation";

  const menuButton = document.createElement("button");
  menuButton.className = "mobile-menu-toggle";
  menuButton.type = "button";
  menuButton.setAttribute("aria-label", "Åpne meny");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-controls", nav.id);
  menuButton.innerHTML = "<span></span><span></span><span></span>";
  document.body.appendChild(menuButton);
  const mobileQuery = window.matchMedia("(max-width: 700px)");

  function setMenuOpen(isOpen) {
    document.body.classList.toggle("mobile-menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Lukk meny" : "Åpne meny");
    nav.toggleAttribute("inert", !isOpen && mobileQuery.matches && !useAppLayout);
  }

  setMenuOpen(false);
  mobileQuery.addEventListener("change", () => setMenuOpen(false));

  menuButton.addEventListener("click", () => {
    setMenuOpen(!document.body.classList.contains("mobile-menu-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

})();

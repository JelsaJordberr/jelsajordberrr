(function () {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone
    || new URLSearchParams(window.location.search).get("app") === "1";

  document.documentElement.classList.toggle("mobile-app-mode", Boolean(isStandalone));
  document.documentElement.classList.toggle("mobile-web-mode", !isStandalone);

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
    nav.toggleAttribute("inert", !isOpen && mobileQuery.matches && document.documentElement.classList.contains("mobile-web-mode"));
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

  if (isStandalone) return;

  const installPrompt = document.createElement("aside");
  installPrompt.className = "install-app-prompt";
  installPrompt.innerHTML = [
    "<strong>Vil du ha app-visning?</strong>",
    "<span>Legg Jelsa Jordbær til på hjemskjermen for fast bunnmeny og app-oppsett.</span>"
  ].join("");

  const main = document.querySelector("main");
  if (main) main.prepend(installPrompt);
})();

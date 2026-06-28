(function () {
  const boothId = document.body.dataset.boothId;
  const statusIndicator = document.getElementById("booth-status-indicator");
  const statusText = document.getElementById("booth-status-text");
  const messageText = document.getElementById("booth-message");
  const lastUpdated = document.getElementById("last-updated");
  const statusImage = document.getElementById("status-image");
  const sellerPanel = document.getElementById("seller-panel");
  const loginForm = document.getElementById("login-form");
  const updateForm = document.getElementById("update-form");
  const formMessage = document.getElementById("form-message");

  function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.className = isError ? "form-message error" : "form-message success";
  }

  function setLoggedIn(user) {
    loginForm.classList.toggle("hidden", Boolean(user));
    updateForm.classList.toggle("hidden", !user);
    document.getElementById("logged-in-user").textContent = user ? user.email : "";
  }

  function renderBooth(booth) {
    const isOpen = booth.status === "open";
    statusIndicator.className = `status-indicator ${isOpen ? "green" : "red"}`;
    statusText.textContent = isOpen ? "Åpent" : "Stengt";
    statusImage.src = isOpen
      ? "../media/salgsbod_open.jpg"
      : "../media/salgsbod_closed.jpg";
    messageText.textContent = booth.message || "";
    messageText.classList.toggle("hidden", !booth.message);
    document.getElementById("status-input").value = booth.status;
    document.getElementById("message-input").value = booth.message || "";
    lastUpdated.textContent = booth.updated_at
      ? `Sist oppdatert: ${new Date(booth.updated_at).toLocaleString("no-NO")}`
      : "";
  }

  async function refreshStatus(showLoading = false) {
    try {
      if (showLoading) statusText.textContent = "Henter status ...";
      renderBooth(await window.boothStatusApi.loadBoothStatus(boothId));
    } catch (error) {
      console.error("Kunne ikke hente status:", error);
      statusText.textContent = "Kunne ikke hente status";
    }
  }

  document.getElementById("seller-toggle").addEventListener("click", () => {
    sellerPanel.classList.toggle("hidden");
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showFormMessage("Logger inn ...");

    try {
      const user = await window.boothStatusApi.login(
        document.getElementById("email").value.trim(),
        document.getElementById("password").value
      );
      setLoggedIn(user);
      loginForm.reset();
      showFormMessage("Du er logget inn.");
    } catch (error) {
      showFormMessage(`Innlogging feilet: ${error.message}`, true);
    }
  });

  updateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const saveButton = document.getElementById("save-button");
    saveButton.disabled = true;
    showFormMessage("Lagrer ...");

    try {
      const booth = await window.boothStatusApi.updateBoothStatus(
        boothId,
        document.getElementById("status-input").value,
        document.getElementById("message-input").value
      );
      renderBooth(booth);
      showFormMessage("Statusen er oppdatert.");
    } catch (error) {
      showFormMessage(
        `Kunne ikke oppdatere. Kontroller at du har tilgang til denne boden. ${error.message}`,
        true
      );
    } finally {
      saveButton.disabled = false;
    }
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    try {
      await window.boothStatusApi.logout();
      setLoggedIn(null);
      showFormMessage("Du er logget ut.");
    } catch (error) {
      showFormMessage(`Kunne ikke logge ut: ${error.message}`, true);
    }
  });

  window.boothStatusApi.getCurrentUser()
    .then(setLoggedIn)
    .catch((error) => showFormMessage(`Kunne ikke kontrollere innlogging: ${error.message}`, true));

  refreshStatus(true);
  setInterval(refreshStatus, 20000);
})();

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
  let refreshTimer;

  function startRefreshTimer(interval) {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(refreshStatus, interval);
  }

  function toDateTimeLocal(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

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
    const messageHasExpired = booth.message_expires_at
      && new Date(booth.message_expires_at) <= new Date();
    const visibleMessage = messageHasExpired ? "" : booth.message;
    statusIndicator.className = `status-indicator ${isOpen ? "green" : "red"}`;
    statusText.textContent = isOpen ? "Åpent" : "Stengt";
    statusImage.src = isOpen
      ? "../media/salgsbod_open.jpg"
      : "../media/salgsbod_closed.jpg";
    messageText.textContent = visibleMessage || "";
    messageText.classList.toggle("hidden", !visibleMessage);
    document.getElementById("status-input").value = booth.status;
    document.getElementById("message-input").value = messageHasExpired ? "" : booth.message || "";
    document.getElementById("message-expires-at").value = messageHasExpired
      ? ""
      : toDateTimeLocal(booth.message_expires_at);
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
    startRefreshTimer(sellerPanel.classList.contains("hidden") ? 20000 : 180000);
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
        document.getElementById("message-input").value,
        document.getElementById("message-expires-at").value
          ? new Date(document.getElementById("message-expires-at").value).toISOString()
          : null
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

  document.getElementById("delete-message-button").addEventListener("click", async () => {
    const deleteButton = document.getElementById("delete-message-button");
    deleteButton.disabled = true;
    showFormMessage("Sletter melding ...");

    try {
      const booth = await window.boothStatusApi.updateBoothStatus(
        boothId,
        document.getElementById("status-input").value,
        "",
        null
      );
      renderBooth(booth);
      showFormMessage("Meldingen er slettet.");
    } catch (error) {
      showFormMessage(`Kunne ikke slette meldingen. ${error.message}`, true);
    } finally {
      deleteButton.disabled = false;
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
  startRefreshTimer(20000);
})();

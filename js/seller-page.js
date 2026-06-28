(function () {
  const boothInput = document.getElementById("booth-input");
  const loginForm = document.getElementById("login-form");
  const updateForm = document.getElementById("update-form");
  const formMessage = document.getElementById("form-message");

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
    const messageHasExpired = booth.message_expires_at
      && new Date(booth.message_expires_at) <= new Date();
    document.getElementById("status-input").value = booth.status;
    document.getElementById("message-input").value = messageHasExpired ? "" : booth.message || "";
    document.getElementById("message-expires-at").value = messageHasExpired
      ? ""
      : toDateTimeLocal(booth.message_expires_at);
  }

  async function loadSelectedBooth() {
    showFormMessage("Henter status ...");
    try {
      renderBooth(await window.boothStatusApi.loadBoothStatus(boothInput.value));
      showFormMessage("Status hentet.");
    } catch (error) {
      showFormMessage(`Kunne ikke hente status: ${error.message}`, true);
    }
  }

  boothInput.addEventListener("change", loadSelectedBooth);

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
      await loadSelectedBooth();
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
        boothInput.value,
        document.getElementById("status-input").value,
        document.getElementById("message-input").value,
        document.getElementById("message-expires-at").value
          ? new Date(document.getElementById("message-expires-at").value).toISOString()
          : null
      );
      renderBooth(booth);
      showFormMessage("Statusen er oppdatert.");
    } catch (error) {
      showFormMessage(`Kunne ikke oppdatere: ${error.message}`, true);
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
        boothInput.value,
        document.getElementById("status-input").value,
        "",
        null
      );
      renderBooth(booth);
      showFormMessage("Meldingen er slettet.");
    } catch (error) {
      showFormMessage(`Kunne ikke slette meldingen: ${error.message}`, true);
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
    .then(async (user) => {
      setLoggedIn(user);
      if (user) await loadSelectedBooth();
    })
    .catch((error) => showFormMessage(`Kunne ikke kontrollere innlogging: ${error.message}`, true));
})();

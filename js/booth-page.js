(function () {
  const boothId = document.body.dataset.boothId;
  const statusIndicator = document.getElementById("booth-status-indicator");
  const statusText = document.getElementById("booth-status-text");
  const messageText = document.getElementById("booth-message");
  const lastUpdated = document.getElementById("last-updated");
  const statusImage = document.getElementById("status-image");

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
    lastUpdated.textContent = booth.updated_at
      ? `Sist oppdatert: ${new Date(booth.updated_at).toLocaleString("no-NO")}`
      : "";
  }

  async function refreshStatus(showLoading = false) {
    try {
      if (showLoading) statusText.textContent = "Hentar status ...";
      renderBooth(await window.boothStatusApi.loadBoothStatus(boothId));
    } catch (error) {
      console.error("Kunne ikkje hente status:", error);
      statusText.textContent = "Kunne ikkje hente status";
    }
  }

  refreshStatus(true);
  setInterval(refreshStatus, 20000);
})();

(function () {
  const cards = Array.from(document.querySelectorAll(".overview-card[data-booth-id]"));

  function renderCard(card, booth) {
    const isOpen = booth.status === "open";
    const messageHasExpired = booth.message_expires_at
      && new Date(booth.message_expires_at) <= new Date();
    const visibleMessage = messageHasExpired ? "" : booth.message;
    const message = card.querySelector(".overview-message");

    card.dataset.status = isOpen ? "open" : "closed";
    card.querySelector(".overview-status-text").textContent = isOpen ? "Åpent" : "Stengt";
    message.textContent = visibleMessage || "";
    message.classList.toggle("hidden", !visibleMessage);
    card.querySelector(".overview-updated").textContent = booth.updated_at
      ? `Sist oppdatert: ${new Date(booth.updated_at).toLocaleString("no-NO")}`
      : "";
  }

  async function refreshCard(card) {
    try {
      const booth = await window.boothStatusApi.loadBoothStatus(card.dataset.boothId);
      renderCard(card, booth);
    } catch (error) {
      console.error(`Kunne ikkje hente status for ${card.dataset.boothId}:`, error);
      card.dataset.status = "error";
      card.querySelector(".overview-status-text").textContent = "Kunne ikkje hente status";
    }
  }

  function refreshAll() {
    cards.forEach(refreshCard);
  }

  refreshAll();
  setInterval(refreshAll, 20000);
})();

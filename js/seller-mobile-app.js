(function () {
  let lastTouchEnd = 0;

  document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
  });

  document.addEventListener("touchmove", (event) => {
    if (event.scale && event.scale !== 1) {
      event.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("touchend", (event) => {
    const now = Date.now();

    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }

    lastTouchEnd = now;
  }, { passive: false });
})();

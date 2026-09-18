(function openRegistrationEntry() {
  "use strict";
  if (new URLSearchParams(window.location.search).get("join") !== "1") return;
  const dialog = document.getElementById("pm4-join-dialog");
  if (!dialog || typeof window.showEx !== "function") return;
  dialog.querySelectorAll("[data-join-exchange]").forEach((button) => {
    button.addEventListener("click", () => {
      dialog.close();
      window.showEx(button.dataset.joinExchange);
    });
  });
  dialog.showModal();
})();

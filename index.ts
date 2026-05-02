import { setupInputListeners } from "./src/dom/listeners";

const passwordInput = document.querySelectorAll('input[type="password"]');

passwordInput.forEach((input) => {
  setupInputListeners(input);
});

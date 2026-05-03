import { InputListener } from "./src/dom/listeners";

const passwordInput = document.querySelectorAll('input[type="password"]');

passwordInput.forEach((input) => {
  new InputListener(input);
});

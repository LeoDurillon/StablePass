import { derivePassword } from "../generator/derive";
import { refreshIcon } from "../icons/refresh";
import createElement from "./element";

let boxExist = false;
let inputValue = "";
let loading = false;

export async function generate(value: string, rotate: boolean = false) {
  setLoadingState(true);
  const password = await derivePassword(value, rotate);
  boxExist = false;
  removeBox("password-generator-box");
  removeBox("password-generator-helper");
  setLoadingState(false);
  return password;
}

export function removeBox(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.remove();
  }
}

export function setLoadingState(isLoading: boolean) {
  loading = isLoading;
  const button = document.getElementById("password-generator-box");
  if (button && button instanceof HTMLButtonElement) {
    button.style.backgroundColor = isLoading ? "#6c757d" : "#007bff";
    button.style.cursor = isLoading ? "not-allowed" : "pointer";
    button.disabled = isLoading;
  }
}

export function createHelperBox(target: HTMLInputElement) {
  const box = target.getBoundingClientRect();

  (target.parentElement ?? document.body).appendChild(
    createElement("p", {
      id: "password-generator-helper",
      style: {
        position: "fixed",
        zIndex: "9999",
        backgroundColor: "#fff",
        color: "#000",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "12px",
        top: `${box.bottom}px`,
        left: `${box.left}px`,
        width: `${box.width}px`,
      },
      innerText: "Press Tab to generate a password",
    }),
  );
}

export function createRefreshButton(target: HTMLInputElement) {
  const box = target.getBoundingClientRect();

  (target.parentElement ?? document.body).appendChild(
    createElement(
      "button",
      {
        id: "password-generator-box",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          zIndex: "9999",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          top: `${box.top}px`,
          left: `${box.right}px`,
          height: `${box.height}px`,
          aspectRatio: "1 / 1",
        },
      },
      {
        innerHTML: refreshIcon,
        title: "Refresh Password Algorithm Version",
        onclick: () => {
          if (
            confirm(
              "Are you sure to refresh the password algorithm version ? This will change all your generated passwords for this domain",
            )
          ) {
            generate(inputValue, true).then((password) => {
              target.value = password;
            });
          }
        },
      },
    ),
  );
}

export function handleGeneratePasswordRequest(event: Event) {
  const target = event.target;
  if (!target || !(target instanceof HTMLInputElement) || !(event instanceof KeyboardEvent)) return;

  if (target.value.length < 4) return;

  if (event.key !== "Tab") return;

  generate(inputValue).then((password) => {
    target.value = password;
  });
}

export function handleInputChange(event: Event) {
  const target = event.target;
  if (!target || !(target instanceof HTMLInputElement)) return;

  inputValue = target.value;

  if (target.value.length >= 4) {
    if (!boxExist) {
      createHelperBox(target);
      createRefreshButton(target);
      boxExist = true;
    }
  } else {
    boxExist = false;
    removeBox("password-generator-box");
    removeBox("password-generator-helper");
  }
}

export function setupInputListeners(input: Element) {
  input.addEventListener("keydown", handleGeneratePasswordRequest);
  input.addEventListener("input", handleInputChange);

  input.addEventListener("focusout", () => {
    setTimeout(() => {
      if (loading) return;
      boxExist = false;
      removeBox("password-generator-box");
      removeBox("password-generator-helper");
    }, 500);
  });
}

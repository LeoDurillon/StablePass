import { derivePassword } from "../generator/derive";
import { refreshIcon } from "../icons/refresh";
import createElement from "./element";

export function createRefreshButton(target: HTMLInputElement, onClick?: () => void) {
  const box = target.getBoundingClientRect();

  const button = createElement(
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
      tabIndex: -1,
      innerHTML: refreshIcon,
      title: "Refresh Password Algorithm Version",
      onclick: onClick,
    },
  );

  return (target.parentElement ?? document.body).appendChild(button);
}

export function createHelperBox(target: HTMLInputElement) {
  const box = target.getBoundingClientRect();
  const helperBox = createElement("p", {
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
  });

  return (target.parentElement ?? document.body).appendChild(helperBox);
}

export class InputListener {
  private boxExist = false;
  private inputValue = "";
  private loading = false;
  private lock = false;
  private refreshButton: HTMLButtonElement | null = null;
  private helperBox: HTMLParagraphElement | null = null;

  constructor(input: Element) {
    const handleGeneratePasswordRequest = this.handleGeneratePasswordRequest.bind(this);
    const handleInputChange = this.handleInputChange.bind(this);
    input.addEventListener("keydown", handleGeneratePasswordRequest);
    input.addEventListener("input", handleInputChange);

    input.addEventListener("focusout", () => {
      setTimeout(() => {
        if (this.loading) return;
        this.clear();
      }, 500);
    });
  }

  handleGeneratePasswordRequest(event: Event) {
    const target = event.target;
    if (!target || !(target instanceof HTMLInputElement) || !(event instanceof KeyboardEvent))
      return;

    if (target.value.length < 4) return;

    if (event.key !== "Tab" || this.lock) return;
    target.disabled = true;
    this.generate(this.inputValue)
      .then((password) => {
        if (!password) return;
        target.value = password;
      })
      .finally(() => {
        target.disabled = false;
      });
  }

  handleInputChange(event: Event) {
    const target = event.target;
    if (!target || !(target instanceof HTMLInputElement)) return;

    this.inputValue = target.value;
    this.lock = false;

    if (target.value.length >= 4 && !this.boxExist) {
      this.helperBox = createHelperBox(target);
      this.refreshButton = createRefreshButton(target, () => {
        if (this.lock) return;
        if (
          confirm(
            "Are you sure to refresh the password algorithm version ? This will change all your generated passwords for this domain",
          )
        ) {
          target.disabled = true;
          this.generate(this.inputValue, true)
            .then((password) => {
              if (!password) return;
              target.value = password;
            })
            .finally(() => {
              target.disabled = false;
            });
        }
      });
      this.boxExist = true;
      return;
    }

    if (!this.boxExist) return;

    this.clear();
  }

  private setLoadingState(isLoading: boolean) {
    this.loading = isLoading;
    if (this.refreshButton) {
      this.refreshButton.style.backgroundColor = isLoading ? "#6c757d" : "#007bff";
      this.refreshButton.style.cursor = isLoading ? "not-allowed" : "pointer";
      this.refreshButton.disabled = isLoading;
    }
  }

  private clear() {
    this.boxExist = false;
    this.refreshButton?.remove();
    this.helperBox?.remove();
    this.refreshButton = null;
    this.helperBox = null;
  }

  async generate(value: string, rotate: boolean = false) {
    this.setLoadingState(true);
    try {
      const password = await derivePassword(value, rotate);
      this.clear();
      this.lock = true;
      return password;
    } catch (error) {
      console.error("Error generating password:", error);
      alert("An error occurred while generating the password. Please try again.");
    } finally {
      this.setLoadingState(false);
    }
  }
}

/// <reference lib="dom" />
import { test, expect, describe, jest, beforeEach, mock, afterEach } from "bun:test";
mock.restore();

import * as TestModule from "../../src/dom/listeners";
import { refreshIcon } from "../../src/icons/refresh";

describe("Listeners Setup", () => {
  beforeEach(() => {
    mock.module("../../src/generator/derive", () => ({
      derivePassword: jest.fn().mockResolvedValue("mocked_password"),
    }));
  });
  afterEach(() => {
    mock.restore();
    mock.clearAllMocks();
  });

  describe("Remove Box", () => {
    test("should remove the element from the dom", () => {
      document.body.innerHTML = `<div id="password-generator-box"></div>`;
      TestModule.removeBox("password-generator-box");
      const el = document.getElementById("password-generator-box");
      expect(el).toBeNull();
    });

    test("should do nothing if the element does not exist", () => {
      document.body.innerHTML = `<div id="some-other-element"></div>`;
      TestModule.removeBox("password-generator-box");
      const el = document.getElementById("some-other-element");
      expect(el).not.toBeNull();
    });
  });

  describe("SetLoadingState", () => {
    test("should set the button to loading state", () => {
      document.body.innerHTML = `<button id="password-generator-box"></button>`;
      const button = document.getElementById("password-generator-box") as HTMLButtonElement;
      expect(button.disabled).toBe(false);
      TestModule.setLoadingState(true);
      expect(button.disabled).toBe(true);
      expect(button.style.backgroundColor).toBe("#6c757d");
    });

    test("should set the button to normal state", () => {
      document.body.innerHTML = `<button id="password-generator-box" disabled style="background-color: #6c757d;"></button>`;
      const button = document.getElementById("password-generator-box") as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      TestModule.setLoadingState(false);
      expect(button.disabled).toBe(false);
      expect(button.style.backgroundColor).toBe("#007bff");
    });

    test("should do nothing if the button does not exist", () => {
      document.body.innerHTML = `<div id="some-other-element"></div>`;
      TestModule.setLoadingState(true);
      const el = document.getElementById("some-other-element");
      expect(el).not.toBeNull();
      expect(el?.style.backgroundColor).toBe("");
    });

    test("should do nothing if the button is not a HTMLButtonElement", () => {
      document.body.innerHTML = `<div id="password-generator-box"></div>`;
      TestModule.setLoadingState(true);
      const el = document.getElementById("password-generator-box");
      expect(el).not.toBeNull();
      expect(el?.style.backgroundColor).toBe("");
    });

    test("should do nothing if state stay the same", () => {
      document.body.innerHTML = `<button id="password-generator-box" disabled style="background-color: #6c757d;"></button>`;
      const button = document.getElementById("password-generator-box") as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(button.style.backgroundColor).toBe("#6c757d");
      TestModule.setLoadingState(true);
      expect(button.disabled).toBe(true);
      expect(button.style.backgroundColor).toBe("#6c757d");
    });
  });

  describe("Generate", () => {
    test("should generate a password and remove boxes", async () => {
      document.body.innerHTML = `<div id="password-generator-box"></div><div id="password-generator-helper"></div>`;
      const password = await TestModule.generate("test_value");
      expect(password).toBe("mocked_password");
      expect(document.getElementById("password-generator-box")).toBeNull();
      expect(document.getElementById("password-generator-helper")).toBeNull();
    });

    test("should set loading state during generation", async () => {
      document.body.innerHTML = `<button id="password-generator-box"></button>`;
      const button = document.getElementById("password-generator-box") as HTMLButtonElement;
      const promise = TestModule.generate("test_value");
      expect(button.disabled).toBe(true);
      await promise;
    });
  });

  describe("Create Helper Box", () => {
    test("should create a helper box with correct styles", () => {
      document.body.innerHTML = `<input type="password" id="password-input" style="position: absolute; top: 100px; left: 100px; width: 200px;">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      input.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 120,
        right: 300,
        width: 200,
        height: 20,
      });
      TestModule.createHelperBox(input);
      const helperBox = document.getElementById("password-generator-helper");
      expect(helperBox).not.toBeNull();
      expect(helperBox?.style.position).toBe("fixed");
      expect(helperBox?.style.top).toBe("120px");
      expect(helperBox?.style.left).toBe("100px");
      expect(helperBox?.style.width).toBe("200px");
      expect(helperBox?.innerText).toBe("Press Tab to generate a password");
    });
  });

  describe("Create Refresh Button", () => {
    beforeEach(() => {
      mock.clearAllMocks();
    });

    test("should create a refresh button with correct styles", () => {
      document.body.innerHTML = `<input type="password" id="password-input" style="position: absolute; top: 100px; left: 100px; width: 200px;">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      input.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 120,
        right: 300,
        width: 200,
        height: 20,
      });
      TestModule.createRefreshButton(input);
      const refreshButton = document.getElementById("password-generator-box");
      expect(refreshButton).not.toBeNull();
      expect(refreshButton?.style.position).toBe("fixed");
      expect(refreshButton?.style.top).toBe("100px");
      expect(refreshButton?.style.left).toBe("300px");
      expect(refreshButton?.style.height).toBe("20px");
      expect(refreshButton?.innerHTML).toBe(refreshIcon);
    });

    test("should display confirmation dialog on click", () => {
      document.body.innerHTML = `<input type="password" id="password-input" style="position: absolute; top: 100px; left: 100px; width: 200px;">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      input.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 120,
        right: 300,
        width: 200,
        height: 20,
      });
      TestModule.createRefreshButton(input);
      const refreshButton = document.getElementById("password-generator-box") as HTMLButtonElement;
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
      refreshButton.click();
      expect(confirmSpy).toHaveBeenCalledWith(
        "Are you sure to refresh the password algorithm version ? This will change all your generated passwords for this domain",
      );
    });

    test("should call generate on confirmation", () => {
      document.body.innerHTML = `<input type="password" id="password-input" style="position: absolute; top: 100px; left: 100px; width: 200px;">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      input.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 120,
        right: 300,
        width: 200,
        height: 20,
      });
      TestModule.createRefreshButton(input);
      const refreshButton = document.getElementById("password-generator-box") as HTMLButtonElement;
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
      const generateSpy = jest.spyOn(TestModule, "generate").mockResolvedValue("new_password");
      refreshButton.click();
      expect(confirmSpy).toHaveBeenCalledWith(
        "Are you sure to refresh the password algorithm version ? This will change all your generated passwords for this domain",
      );
      expect(generateSpy).toHaveBeenCalledWith("", true);
    });
  });

  describe("Input handlers", () => {
    beforeEach(() => {
      mock.clearAllMocks();
    });

    test("should generate password on keydown", async () => {
      document.body.innerHTML = `<input type="password" id="password-input" value="test_valu">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      const generateSpy = jest
        .spyOn(TestModule, "generate")
        .mockResolvedValue("generated_password");
      TestModule.setupInputListeners(input);
      input.value = "test_value";
      input.dispatchEvent(new KeyboardEvent("input", { key: "e" }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(generateSpy).toHaveBeenCalledWith("test_value");
    });

    test("should not generate password if value is too short", () => {
      document.body.innerHTML = `<input type="password" id="password-input" value="tes">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      const generateSpy = jest.spyOn(TestModule, "generate");
      TestModule.setupInputListeners(input);
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(generateSpy).not.toHaveBeenCalled();
    });

    test("should not generate password on other keys", () => {
      document.body.innerHTML = `<input type="password" id="password-input" value="test_valu">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      const generateSpy = jest.spyOn(TestModule, "generate");
      TestModule.setupInputListeners(input);
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(generateSpy).not.toHaveBeenCalled();
    });

    test("should not generate password if target is not an input", () => {
      document.body.innerHTML = `<div id="not-an-input"></div>`;
      const div = document.getElementById("not-an-input") as HTMLDivElement;
      const generateSpy = jest.spyOn(TestModule, "generate");
      TestModule.setupInputListeners(div as unknown as HTMLInputElement);
      div.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      expect(generateSpy).not.toHaveBeenCalled();
    });

    test("should allow backspace and delete keys", () => {
      document.body.innerHTML = `<input type="password" id="password-input" value="test_valu">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      const generateSpy = jest.spyOn(TestModule, "generate");
      TestModule.setupInputListeners(input);
      input.value = "test_va";
      input.dispatchEvent(new KeyboardEvent("input", { key: "Backspace" }));
      input.dispatchEvent(new KeyboardEvent("input", { key: "Delete" }));
      expect(generateSpy).not.toHaveBeenCalled();
      expect(input.value).toBe("test_va");
    });

    test("should remove boxes on focusout", async () => {
      document.body.innerHTML = `<input type="password" id="password-input"><div id="password-generator-box"></div><div id="password-generator-helper"></div>`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      TestModule.setupInputListeners(input);
      input.dispatchEvent(new Event("focusout"));
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(document.getElementById("password-generator-box")).toBeNull();
      expect(document.getElementById("password-generator-helper")).toBeNull();
    });
  });

  describe("Setup Listeners", () => {
    test("should add event listeners to input fields", () => {
      document.body.innerHTML = `<input type="password" id="password-input">`;
      const input = document.getElementById("password-input") as HTMLInputElement;
      const addEventListenerSpy = jest.spyOn(input, "addEventListener");
      // Assuming setupListeners is called here
      TestModule.setupInputListeners(input);
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("keydown"));
      input.dispatchEvent(new Event("focusout"));
      expect(addEventListenerSpy).toHaveBeenCalledWith("input", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("focusout", expect.any(Function));
    });
  });
});

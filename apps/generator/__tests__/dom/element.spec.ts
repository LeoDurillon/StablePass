/// <reference lib="dom" />
import { test, expect, describe, jest, mock } from "bun:test";
import createElement from "../../src/dom/element";
mock.restore();

describe("createElement", () => {
  test("should create correct HTML element", () => {
    const element = createElement("div");
    document.body.appendChild(element);
    expect(document.body.contains(element)).toBe(true);
    expect(document.querySelector("div")).toBe(element);
  });

  test("should set attributes correctly", () => {
    const element = createElement("input", { id: "test-input" }, { type: "text" });
    document.body.appendChild(element);
    expect(element.getAttribute("type")).toBe("text");
    expect(element.getAttribute("id")).toBe("test-input");
  });

  test("should set text content correctly", () => {
    const element = createElement("p", { innerText: "Hello, World!" });
    document.body.appendChild(element);
    expect(element.textContent).toBe("Hello, World!");
  });

  test("should set styles correctly", () => {
    const element = createElement("div", { style: { color: "red", fontSize: "16px" } });
    document.body.appendChild(element);
    expect(element.style.color).toBe("red");
    expect(element.style.fontSize).toBe("16px");
  });

  test("should handle empty attributes object", () => {
    const element = createElement("span", {});
    document.body.appendChild(element);
    expect(document.querySelector("span")).toBe(element);
  });

  test("should handle missing attributes parameter", () => {
    const element = createElement("h1");
    document.body.appendChild(element);
    expect(document.querySelector("h1")).toBe(element);
  });

  test("should handle className correctly", () => {
    const element = createElement("h2", { class: "test-class" });
    document.body.appendChild(element);
    expect(document.querySelector("h2")).toBe(element);
    expect(element.className).toBe("test-class");
  });

  test("Should handle handler properties correctly", () => {
    const clickHandler = jest.fn();
    const element = createElement("button", { innerText: "Click me" }, { onclick: clickHandler });
    document.body.appendChild(element);
    element.click();
    expect(clickHandler).toHaveBeenCalled();
  });
});

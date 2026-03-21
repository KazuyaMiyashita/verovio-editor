import { describe, it, expect, beforeEach } from "vitest";
import {
  appendDivTo,
  appendSpanTo,
  randomHex,
  appendHTMLElementTo,
} from "./functions";

describe("utils/functions", () => {
  let parent: HTMLDivElement;

  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = "";
    parent = document.createElement("div");
    document.body.appendChild(parent);
  });

  describe("randomHex", () => {
    it("should generate a string of the specified length", () => {
      const hex = randomHex(6);
      expect(hex.length).toBe(6);
      // It should only contain hex characters
      expect(/^[0-9a-f]+$/i.test(hex)).toBe(true);
    });

    it("should generate different strings on subsequent calls", () => {
      const hex1 = randomHex(8);
      const hex2 = randomHex(8);
      expect(hex1).not.toBe(hex2);
    });
  });

  describe("appendHTMLElementTo", () => {
    it("should create and append an element of the specified tag", () => {
      const el = appendHTMLElementTo(parent, { id: "test-id" }, "section");
      expect(el.tagName.toLowerCase()).toBe("section");
      expect(el.id).toBe("test-id");
      expect(parent.children.length).toBe(1);
      expect(parent.children[0]).toBe(el);
    });

    it("should set style properties correctly", () => {
      const el = appendHTMLElementTo(
        parent,
        { style: { color: "red", fontSize: "12px" } },
        "div",
      );
      expect(el.style.color).toBe("red");
      expect(el.style.fontSize).toBe("12px");
    });

    it("should set classes correctly", () => {
      const el = appendHTMLElementTo(
        parent,
        { class: "test-class" },
        "div",
      );
      expect(el.className).toBe("test-class");
    });
  });

  describe("appendDivTo", () => {
    it("should append a div to the parent", () => {
      const div = appendDivTo(parent, { id: "my-div" });
      expect(div.tagName.toLowerCase()).toBe("div");
      expect(div.id).toBe("my-div");
      expect(parent.contains(div)).toBe(true);
    });
  });

  describe("appendSpanTo", () => {
    it("should append a span to the parent with text", () => {
      const span = appendSpanTo(
        parent,
        { class: "my-span" },
        "Hello World",
      );
      expect(span.tagName.toLowerCase()).toBe("span");
      expect(span.className).toBe("my-span");
      expect(span.textContent).toBe("Hello World");
      expect(parent.contains(span)).toBe(true);
    });
  });
});

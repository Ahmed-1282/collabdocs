import { describe, expect, it } from "vitest";
import { parseContent, parseEmail, parseRole, parseTitle, ValidationError } from "../validation";

describe("parseTitle", () => {
  it("trims surrounding whitespace", () => {
    expect(parseTitle("  Roadmap  ")).toBe("Roadmap");
  });

  it("rejects blank and oversized titles", () => {
    expect(() => parseTitle("   ")).toThrow(ValidationError);
    expect(() => parseTitle("x".repeat(201))).toThrow(ValidationError);
    expect(() => parseTitle(42)).toThrow(ValidationError);
  });
});

describe("parseEmail", () => {
  it("normalises case and whitespace", () => {
    expect(parseEmail("  Alice@Example.COM ")).toBe("alice@example.com");
  });

  it("rejects malformed addresses", () => {
    expect(() => parseEmail("not-an-email")).toThrow(ValidationError);
    expect(() => parseEmail("missing@domain")).toThrow(ValidationError);
  });
});

describe("parseRole", () => {
  it("accepts the two known roles and nothing else", () => {
    expect(parseRole("EDITOR")).toBe("EDITOR");
    expect(parseRole("VIEWER")).toBe("VIEWER");
    expect(() => parseRole("ADMIN")).toThrow(ValidationError);
  });
});

describe("parseContent", () => {
  it("accepts a ProseMirror document node", () => {
    expect(parseContent({ type: "doc", content: [] })).toEqual({ type: "doc", content: [] });
  });

  it("rejects arrays, primitives and non-doc nodes", () => {
    expect(() => parseContent([])).toThrow(ValidationError);
    expect(() => parseContent("<p>hi</p>")).toThrow(ValidationError);
    expect(() => parseContent({ type: "paragraph" })).toThrow(ValidationError);
  });
});

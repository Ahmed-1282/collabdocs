import { describe, expect, it } from "vitest";
import { canEdit, canManage, canView, getAccessLevel } from "../access";

const OWNER = "user_owner";
const EDITOR = "user_editor";
const VIEWER = "user_viewer";
const STRANGER = "user_stranger";

const doc = {
  ownerId: OWNER,
  shares: [
    { userId: EDITOR, role: "EDITOR" as const },
    { userId: VIEWER, role: "VIEWER" as const },
  ],
};

describe("getAccessLevel", () => {
  it("identifies the owner", () => {
    expect(getAccessLevel(doc, OWNER)).toBe("owner");
  });

  it("identifies each shared role", () => {
    expect(getAccessLevel(doc, EDITOR)).toBe("editor");
    expect(getAccessLevel(doc, VIEWER)).toBe("viewer");
  });

  it("denies users with no share row", () => {
    expect(getAccessLevel(doc, STRANGER)).toBe("none");
  });

  it("denies signed-out visitors", () => {
    expect(getAccessLevel(doc, null)).toBe("none");
    expect(getAccessLevel(doc, undefined)).toBe("none");
  });

  it("keeps the owner an owner even if a share row demotes them", () => {
    // Guards against a stale VIEWER row locking an owner out of their own doc.
    const selfShared = {
      ownerId: OWNER,
      shares: [{ userId: OWNER, role: "VIEWER" as const }],
    };
    expect(getAccessLevel(selfShared, OWNER)).toBe("owner");
  });
});

describe("permission helpers", () => {
  it("lets owners and editors write, but not viewers or strangers", () => {
    expect(canEdit(doc, OWNER)).toBe(true);
    expect(canEdit(doc, EDITOR)).toBe(true);
    expect(canEdit(doc, VIEWER)).toBe(false);
    expect(canEdit(doc, STRANGER)).toBe(false);
  });

  it("lets every collaborator read, but not strangers", () => {
    expect(canView(doc, OWNER)).toBe(true);
    expect(canView(doc, EDITOR)).toBe(true);
    expect(canView(doc, VIEWER)).toBe(true);
    expect(canView(doc, STRANGER)).toBe(false);
  });

  it("restricts sharing and deletion to the owner alone", () => {
    expect(canManage(doc, OWNER)).toBe(true);
    expect(canManage(doc, EDITOR)).toBe(false);
    expect(canManage(doc, VIEWER)).toBe(false);
    expect(canManage(doc, STRANGER)).toBe(false);
  });
});

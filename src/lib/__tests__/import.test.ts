import { describe, expect, it } from "vitest";
import { fileToHtml } from "../import";
import { ValidationError, MAX_UPLOAD_BYTES } from "../validation";

function makeFile(name: string, content: string) {
  return new File([content], name, { type: "text/plain" });
}

describe("fileToHtml", () => {
  it("splits plain text on blank lines into paragraphs", async () => {
    const { html, title } = await fileToHtml(makeFile("notes.txt", "First.\n\nSecond."));
    expect(title).toBe("notes");
    expect(html).toBe("<p>First.</p><p>Second.</p>");
  });

  it("escapes HTML in plain text so uploads cannot inject markup", async () => {
    const { html } = await fileToHtml(makeFile("x.txt", "<script>alert(1)</script>"));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("converts markdown formatting", async () => {
    const { html } = await fileToHtml(makeFile("doc.md", "# Title\n\n- one\n- two"));
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<li>one</li>");
  });

  it("rejects unsupported extensions", async () => {
    await expect(fileToHtml(makeFile("photo.png", "binary"))).rejects.toThrow(ValidationError);
  });

  it("rejects empty and oversized files", async () => {
    await expect(fileToHtml(makeFile("empty.txt", ""))).rejects.toThrow(ValidationError);
    const big = makeFile("big.txt", "x".repeat(MAX_UPLOAD_BYTES + 1));
    await expect(fileToHtml(big)).rejects.toThrow(/under 1 MB/);
  });
});

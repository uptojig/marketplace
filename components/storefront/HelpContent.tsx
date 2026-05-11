import * as React from "react";

// Renders markdown-flavoured plain text into simple HTML.
// Supports: ## / ### headings, **bold**, basic markdown tables, blank-line
// paragraphs, ordered/unordered lists.
//
// Used by /stores/{slug}/help/{pageSlug} and the static fallback path of
// renderSchemaPage (shipping / returns / privacy / terms / faq) so both
// surfaces share a single rendering pipeline.
export function HelpContent({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let buffer: string[] = [];
  let mode: "p" | "ul" | "table" | null = null;
  let key = 0;

  function flush() {
    if (!buffer.length) return;
    if (mode === "p") {
      const html = buffer
        .join(" ")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      blocks.push(
        <p key={key++} className="my-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />,
      );
    } else if (mode === "ul") {
      blocks.push(
        <ul key={key++} className="my-3 list-disc space-y-1 pl-6">
          {buffer.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
          ))}
        </ul>,
      );
    } else if (mode === "table") {
      const rows = buffer.filter((r) => !/^\s*\|?[-:\s|]+\|?\s*$/.test(r));
      const parsed = rows.map((r) =>
        r.split("|").filter((c, i, arr) => i !== 0 && i !== arr.length - 1).map((c) => c.trim()),
      );
      blocks.push(
        <table key={key++} className="my-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {parsed[0]?.map((c, i) => (
                <th key={i} className="py-2 pr-4 text-left font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.slice(1).map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                {row.map((c, j) => (
                  <td key={j} className="py-2 pr-4">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
    }
    buffer = [];
    mode = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      blocks.push(
        <h3 key={key++} className="mt-5 text-base font-semibold">{line.slice(4)}</h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2 key={key++} className="mt-6 text-xl font-bold">{line.slice(3)}</h2>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      if (mode !== "ul") flush();
      mode = "ul";
      buffer.push(line.slice(2));
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (mode !== "ul") flush();
      mode = "ul";
      buffer.push(line.replace(/^\d+\.\s/, ""));
      continue;
    }
    if (line.startsWith("|")) {
      if (mode !== "table") flush();
      mode = "table";
      buffer.push(line);
      continue;
    }
    if (mode !== "p") flush();
    mode = "p";
    buffer.push(line);
  }
  flush();
  return <>{blocks}</>;
}

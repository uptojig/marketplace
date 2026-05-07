"use client";

/**
 * TrustSection — renders AI-generated markdown trust content
 * Handles: features (bullet lists), testimonials (blockquotes), stats
 */
export function TrustSectionBlock({
  contentMarkdown,
}: {
  contentMarkdown: string;
}) {
  // Parse markdown sections by ## headings
  const sections = contentMarkdown.split(/(?=^## )/m).filter(Boolean);

  return (
    <div className="py-12 px-6 bg-card/50">
      <div className="max-w-4xl mx-auto space-y-10">
        {sections.map((section, i) => (
          <MarkdownSection key={i} content={section} />
        ))}
      </div>
    </div>
  );
}

function MarkdownSection({ content }: { content: string }) {
  const lines = content.split("\n").filter(Boolean);
  const heading = lines[0]?.replace(/^#+\s*/, "") || "";
  const body = lines.slice(1);

  // Separate quotes, bullets, and plain text
  const quotes: string[] = [];
  const bullets: string[] = [];
  const plain: string[] = [];

  for (const line of body) {
    if (line.startsWith("> ")) {
      quotes.push(line.replace(/^>\s*/, ""));
    } else if (line.startsWith("- ")) {
      bullets.push(line.replace(/^-\s*/, ""));
    } else {
      plain.push(line);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">{heading}</h2>

      {/* Features (bullets) */}
      {bullets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {bullets.map((b, i) => {
            const boldMatch = b.match(/\*\*(.*?)\*\*:?\s*(.*)/);
            return (
              <div
                key={i}
                className="p-4 rounded-lg border border-border/50 bg-background"
              >
                {boldMatch ? (
                  <>
                    <h3 className="font-semibold text-sm mb-1">
                      {boldMatch[1]}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {boldMatch[2]}
                    </p>
                  </>
                ) : (
                  <p className="text-sm">{b}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Testimonials (blockquotes) */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quotes.map((q, i) => {
            // Parse: "ข้อความ" — ชื่อ ★4.7
            const match = q.match(
              /["""](.+?)["""]\s*[-—]\s*(.+?)(?:\s*[★☆](\d\.?\d?))?$/,
            );
            return (
              <div
                key={i}
                className="p-4 rounded-lg border border-border/50 bg-background"
              >
                <div className="text-yellow-500 text-sm mb-2">
                  {"★".repeat(5)}
                </div>
                <p className="text-sm italic text-muted-foreground mb-3">
                  &ldquo;{match ? match[1] : q}&rdquo;
                </p>
                {match && (
                  <p className="text-xs font-semibold">
                    {match[2]}
                    {match[3] && (
                      <span className="ml-1 text-yellow-500">
                        ★{match[3]}
                      </span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats / plain text */}
      {plain.length > 0 && (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {plain.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}

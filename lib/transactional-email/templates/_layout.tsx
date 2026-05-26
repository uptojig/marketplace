// Shared email shell: header (store name + logo), body slot, footer
// (compliance text + stubbed unsubscribe link).
//
// Server-rendered only — DO NOT add "use client". React Email's render
// pipeline runs this on the server / inside an action handler.

import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface EmailLayoutProps {
  /** Short summary shown in the inbox preview pane. */
  preview: string;
  /** Used in the header brand chip + footer compliance text. */
  storeName: string;
  storeLogoUrl?: string | null;
  /** Drives header accent + button background. */
  brandColor?: string | null;
  /** Inserted into the "you placed an order at … on basketplace.co" footer. */
  footerNote?: string;
  /** Stubbed for Phase 4 unsubscribe wiring. */
  unsubscribeUrl?: string;
  children: React.ReactNode;
}

const DEFAULT_BRAND = "#2563eb";

export function EmailLayout({
  preview,
  storeName,
  storeLogoUrl,
  brandColor,
  footerNote,
  unsubscribeUrl,
  children,
}: EmailLayoutProps) {
  const accent = brandColor || DEFAULT_BRAND;

  return (
    <Html lang="th">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section
            style={{
              ...headerStyle,
              borderTopColor: accent,
            }}
          >
            {storeLogoUrl ? (
              <Img
                src={storeLogoUrl}
                alt={storeName}
                width="40"
                height="40"
                style={logoStyle}
              />
            ) : null}
            <Text style={storeNameStyle}>{storeName}</Text>
          </Section>

          <Section style={contentStyle}>{children}</Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              {footerNote ??
                `คุณได้รับอีเมลนี้เนื่องจากคุณได้สั่งซื้อสินค้าที่ ${storeName}`}
            </Text>
            {unsubscribeUrl ? (
              <Text style={footerTextStyle}>
                <Link href={unsubscribeUrl} style={footerLinkStyle}>
                  ยกเลิกการรับอีเมล
                </Link>
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles (inline so email clients honor them) ───────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f6f7f9",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Thai", sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "24px auto",
  padding: "0",
  maxWidth: "560px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const headerStyle: React.CSSProperties = {
  borderTop: "4px solid #2563eb",
  padding: "20px 24px 16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoStyle: React.CSSProperties = {
  borderRadius: "6px",
  display: "inline-block",
  verticalAlign: "middle",
};

const storeNameStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#0f172a",
  margin: 0,
  display: "inline-block",
  verticalAlign: "middle",
};

const contentStyle: React.CSSProperties = {
  padding: "8px 24px 16px",
  color: "#0f172a",
  lineHeight: 1.55,
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "16px 24px",
};

const footerStyle: React.CSSProperties = {
  padding: "8px 24px 24px",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  margin: "4px 0",
};

const footerLinkStyle: React.CSSProperties = {
  color: "#64748b",
  textDecoration: "underline",
};

// Re-export shared style tokens so individual templates can match.
export const emailStyles = {
  heading: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "16px 0 8px",
  } satisfies React.CSSProperties,
  paragraph: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: 1.6,
    margin: "8px 0",
  } satisfies React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "12px",
  } satisfies React.CSSProperties,
  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
  } satisfies React.CSSProperties,
  tableCell: {
    padding: "8px 10px",
    fontSize: "13px",
    borderBottom: "1px solid #e2e8f0",
    color: "#0f172a",
    verticalAlign: "top" as const,
  } satisfies React.CSSProperties,
  totalRow: {
    fontWeight: 700,
    color: "#0f172a",
  } satisfies React.CSSProperties,
  ctaButton: (color: string): React.CSSProperties => ({
    backgroundColor: color,
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
    display: "inline-block",
    margin: "16px 0",
  }),
};

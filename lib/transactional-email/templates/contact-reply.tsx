// Vendor-to-buyer reply for ContactMessage submissions.
//
// Sent FROM the platform default (or store contactEmail when set) TO
// the buyer's email captured at the contact form. ReplyTo is set to
// the store's contactEmail so when the buyer hits "Reply" the thread
// goes back to the vendor — not to the platform inbox.
//
// Layout intentionally minimal — close to the StoreContactEmail style
// so vendors see a familiar shape when they preview their own outgoing
// reply. The original visitor message is quoted at the bottom so the
// buyer has context (most mail clients don't auto-thread two unrelated
// transactional sends).
//
// Server-rendered only. DO NOT add "use client".

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface Props {
  storeName: string;
  /** The body the vendor typed in the inbox reply form. */
  replyBody: string;
  /** Original visitor message — quoted at the bottom for context. */
  originalMessage: string;
  /** Visitor's display name — shown in the quote header. */
  visitorName: string;
  /**
   * Store's contactEmail — used in the footer "ตอบกลับได้ที่" line so
   * the buyer knows where their reply will land.
   */
  storeContactEmail?: string | null;
}

export default function ContactReplyEmail({
  storeName,
  replyBody,
  originalMessage,
  visitorName,
  storeContactEmail,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`${storeName} ได้ตอบกลับข้อความของคุณ`}</Preview>
      <Body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          padding: "24px",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            background: "#ffffff",
            padding: 24,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <Heading style={{ fontSize: 20, margin: 0, color: "#0f172a" }}>
            ตอบกลับข้อความของคุณ
          </Heading>
          <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
            ร้าน: <strong>{storeName}</strong>
          </Text>

          <Hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />

          {/* Vendor's reply body. whiteSpace: pre-wrap preserves the
              vendor's line breaks so multi-paragraph replies render
              correctly in the buyer's inbox. */}
          <Text
            style={{
              fontSize: 14,
              color: "#0f172a",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {replyBody}
          </Text>

          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />

          {/* Quoted original — muted + smaller so the vendor's reply
              stays visually dominant. */}
          <Text
            style={{
              fontSize: 12,
              color: "#94a3b8",
              marginTop: 0,
              marginBottom: 4,
            }}
          >
            ข้อความเดิมจาก {visitorName}:
          </Text>
          <div
            style={{
              borderLeft: "3px solid #e2e8f0",
              paddingLeft: 12,
              margin: 0,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "#64748b",
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {originalMessage}
            </Text>
          </div>

          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />

          <Text
            style={{
              fontSize: 12,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            ตอบกลับโดย <strong>{storeName}</strong>
            {storeContactEmail ? (
              <>
                {" · "}
                ตอบกลับข้อความนี้ได้ที่ {storeContactEmail}
              </>
            ) : null}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Store contact-form notification email.
//
// Sent to the store's `contactEmail` when a visitor submits the
// /stores/[slug]/contact form. Plain layout — readable in any mail
// client. Reply-To is set to the visitor's email (if provided) so the
// store can reply directly.

import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";

interface Props {
  storeName: string;
  visitorName: string;
  visitorEmail?: string | null;
  visitorPhone?: string | null;
  message: string;
}

export default function StoreContactEmail({
  storeName,
  visitorName,
  visitorEmail,
  visitorPhone,
  message,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`ข้อความใหม่จาก ${visitorName} ที่หน้าติดต่อร้าน ${storeName}`}</Preview>
      <Body style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", padding: "24px" }}>
        <Container style={{ maxWidth: 560, background: "#ffffff", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <Heading style={{ fontSize: 20, margin: 0, color: "#0f172a" }}>
            ข้อความใหม่จากหน้าติดต่อร้าน
          </Heading>
          <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
            ร้าน: <strong>{storeName}</strong>
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />
          <Text style={{ fontSize: 14, color: "#0f172a", marginBottom: 8 }}>
            <strong>ผู้ส่ง:</strong> {visitorName}
          </Text>
          {visitorEmail && (
            <Text style={{ fontSize: 14, color: "#0f172a", marginBottom: 8 }}>
              <strong>อีเมล:</strong> {visitorEmail}
            </Text>
          )}
          {visitorPhone && (
            <Text style={{ fontSize: 14, color: "#0f172a", marginBottom: 8 }}>
              <strong>โทร:</strong> {visitorPhone}
            </Text>
          )}
          <Hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />
          <Text style={{ fontSize: 14, color: "#0f172a", whiteSpace: "pre-wrap" }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

-- In-app inbox for phone-only customers
--
-- Customers who sign up without an external email get a deterministic
-- synthetic address (<slug>.<name>-<hash>@inbox.basketplace.co). Mail
-- addressed there lands in this table and renders at /account/inbox.

CREATE TABLE "InboxMessage" (
    "id"              TEXT NOT NULL,
    "userId"          TEXT NOT NULL,
    "storeId"         TEXT,
    "fromAddr"        TEXT NOT NULL,
    "toAddr"          TEXT NOT NULL,
    "subject"         TEXT NOT NULL,
    "htmlBody"        TEXT,
    "textBody"        TEXT,
    "attachmentsJson" JSONB,
    "fromOurSystem"   BOOLEAN NOT NULL DEFAULT true,
    "readAt"          TIMESTAMP(3),
    "receivedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InboxMessage_userId_receivedAt_idx" ON "InboxMessage"("userId", "receivedAt");
CREATE INDEX "InboxMessage_userId_readAt_idx" ON "InboxMessage"("userId", "readAt");

ALTER TABLE "InboxMessage"
    ADD CONSTRAINT "InboxMessage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InboxMessage"
    ADD CONSTRAINT "InboxMessage_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import { prisma } from "@/lib/prisma";
import { getAliasProvider } from "./index";

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Verification rule (no OTP):
 *
 * The forward target is set inside the admin UI which already gates
 * on ADMIN role; admins are trusted to type the correct destination
 * for their own brand inbox (e.g. contact@yourdomain.com). Any
 * non-empty, syntactically-valid email is accepted as verified —
 * matching owner.email is no longer a precondition.
 *
 * Why we used to require an owner.email match: for the legacy
 * vendor self-onboarding flow, where the form was filled by random
 * users we didn't trust. /onboarding has been removed (commit
 * 59c7c90), so the trust boundary is now the admin form itself.
 *
 * If we ever re-introduce a self-service settings page for vendors
 * who are NOT admins, gate this back to the email-match rule there.
 */
function isAutoVerified(forwardTo: string): boolean {
  const v = forwardTo.trim();
  if (!v) return false;
  // Cheap shape check — RFC 5322 is a nightmare and Zod has already
  // validated upstream. We just want to refuse "" and obviously-broken
  // values that slipped past.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function provisionPlatformEmail(storeId: string): Promise<{
  aliasEmail: string;
  alreadyProvisioned: boolean;
  verified: boolean;
}> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { owner: true },
  });
  if (!store) throw new Error(`Store ${storeId} not found`);

  if (store.platformEmail) {
    return {
      aliasEmail: store.platformEmail,
      alreadyProvisioned: true,
      verified: store.platformEmailVerified,
    };
  }

  const baseLocal = store.slug.toLowerCase();
  if (!SLUG_REGEX.test(baseLocal)) {
    throw new Error(`Slug "${store.slug}" not valid as email local part`);
  }

  const forwardTo =
    store.platformEmailForwardTo || store.contactEmail || store.owner.email;
  if (!forwardTo) {
    throw new Error(
      "No forwardTo email available (set contactEmail or sign-in email)"
    );
  }

  let local = baseLocal;
  const collision = await prisma.store.findFirst({
    where: { platformEmail: { startsWith: `${baseLocal}@` } },
  });
  if (collision) {
    local = `${baseLocal}-${randomSuffix()}`;
  }

  const provider = getAliasProvider();
  const { aliasEmail } = await provider.createAlias({
    local,
    forwardTo,
    name: `store-${store.slug}`,
  });

  const verified = isAutoVerified(forwardTo);
  const now = new Date();

  await prisma.$transaction([
    prisma.store.update({
      where: { id: store.id },
      data: {
        platformEmail: aliasEmail,
        platformEmailForwardTo: forwardTo,
        platformEmailProvisionedAt: now,
        platformEmailVerified: verified,
        platformEmailVerifiedAt: verified ? now : null,
      },
    }),
    prisma.identityVerification.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        status: verified ? "EMAIL_VERIFIED" : "PENDING",
        emailVerifiedAt: verified ? now : null,
      },
      update: {
        status: verified ? "EMAIL_VERIFIED" : "PENDING",
        emailVerifiedAt: verified ? now : null,
      },
    }),
  ]);

  return { aliasEmail, alreadyProvisioned: false, verified };
}

export async function updatePlatformEmailForward(
  storeId: string,
  newForwardTo: string
): Promise<{ verified: boolean }> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { owner: true },
  });
  if (!store) throw new Error(`Store ${storeId} not found`);

  const verified = isAutoVerified(newForwardTo);
  const now = new Date();

  if (!store.platformEmail) {
    // Nothing provisioned yet — just remember the preference. Provision
    // (which auto-verifies) will pick it up on first run.
    await prisma.store.update({
      where: { id: store.id },
      data: { platformEmailForwardTo: newForwardTo },
    });
    return { verified };
  }

  const local = store.platformEmail.split("@")[0];
  await getAliasProvider().updateAlias({
    local,
    forwardTo: newForwardTo,
    name: `store-${store.slug}`,
  });

  await prisma.$transaction([
    prisma.store.update({
      where: { id: store.id },
      data: {
        platformEmailForwardTo: newForwardTo,
        platformEmailVerified: verified,
        platformEmailVerifiedAt: verified ? now : null,
      },
    }),
    prisma.identityVerification.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        status: verified ? "EMAIL_VERIFIED" : "PENDING",
        emailVerifiedAt: verified ? now : null,
      },
      update: {
        status: verified ? "EMAIL_VERIFIED" : "PENDING",
        emailVerifiedAt: verified ? now : null,
      },
    }),
  ]);

  return { verified };
}

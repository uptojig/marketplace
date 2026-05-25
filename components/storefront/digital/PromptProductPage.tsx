/**
 * PromptProductPage — server component wrapper for PDP of DIGITAL +
 * PROMPT kind products. Handles the unlock check + decides whether to
 * pass `promptFull` to the client viewer.
 *
 * Security: the full prompt text NEVER reaches the client bundle when
 * the viewer is unlocked === false. The server simply omits it from
 * the props, so a hostile client cannot toggle a flag to reveal it.
 */
import { getServerSession } from 'next-auth';
import { PromptViewer } from './PromptViewer';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkProductUnlock } from '@/lib/digital/unlocks';

interface Props {
  product: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    priceTHB: number;
    promptText: string | null;
    promptSample: string | null;
  };
  store: { slug: string; name: string };
}

export default async function PromptProductPage({ product, store }: Props) {
  // Look up the buyer's userId (if any) and check unlock status.
  const session = await getServerSession(authOptions);
  let unlockedUserId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    unlockedUserId = user?.id ?? null;
  }
  const unlock = await checkProductUnlock(unlockedUserId, product.id);

  return (
    <main
      className="bg-[var(--shop-bg,#fafafa)] min-h-screen font-[family:var(--font-prompt)]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.18em] font-semibold mb-2"
            style={{ color: 'var(--shop-primary,#0a0a0a)' }}
          >
            Digital · Prompt
          </p>
          <h1
            className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold leading-tight"
            style={{ color: 'var(--shop-ink,#0a0a0a)' }}
          >
            {product.title}
          </h1>
          {product.description && (
            <p
              className="mt-3 text-base leading-relaxed max-w-2xl"
              style={{ color: 'var(--shop-ink-muted,#71717a)' }}
            >
              {product.description}
            </p>
          )}
        </header>

        <PromptViewer
          storeSlug={store.slug}
          storeName={store.name}
          productId={product.id}
          productTitle={product.title}
          productImage={product.imageUrl}
          priceTHB={product.priceTHB}
          promptSample={product.promptSample}
          // Only ship the full prompt to the client when the server has
          // verified the buyer holds an active unlock.
          promptFull={unlock.active ? product.promptText : null}
          unlocked={unlock.active}
          licenseKey={unlock.licenseKey ?? null}
        />

        {unlock.active && (
          <p
            className="mt-6 text-xs text-center"
            style={{ color: 'var(--shop-ink-muted,#71717a)' }}
          >
            ดู prompt ทั้งหมดของคุณได้ที่{' '}
            <a
              href={`/stores/${store.slug}/account/downloads`}
              className="underline"
            >
              คลังสินค้าดิจิทัล
            </a>
          </p>
        )}
      </div>
    </main>
  );
}

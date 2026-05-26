/**
 * /unlock/<accessToken> — guest-facing gift-unlock landing.
 *
 * Recipients of a digital gift land here via the magic link in their
 * email. The token is the only authentication — no signup required.
 * We look up the DigitalUnlock by accessToken, refuse on revoked /
 * expired, and render the product preview + download buttons.
 *
 * The download API (/api/digital/download/...) accepts `?token=` for
 * guest access, so the buttons here use a query-param variant.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { FileDown, Gift, KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}) {
  return { title: `ของขวัญดิจิทัล — ${params.token.slice(0, 8)}` };
}

export default async function GiftUnlockPage({
  params,
}: {
  params: { token: string };
}) {
  const unlock = await prisma.digitalUnlock.findUnique({
    where: { accessToken: params.token },
    include: {
      product: {
        include: {
          digitalAssets: {
            select: {
              id: true,
              fileName: true,
              fileFormat: true,
              fileSizeMB: true,
              isPreview: true,
            },
          },
          store: { select: { name: true, slug: true, logoUrl: true } },
        },
      },
      user: { select: { name: true } },
    },
  });

  if (!unlock || !unlock.accessToken) notFound();

  if (unlock.revokedAt) {
    return (
      <main className="bg-[#fafafa] min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            ลิงก์นี้ถูกเพิกถอนแล้ว
          </h1>
          <p className="text-sm text-zinc-500">
            หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อร้านที่ส่งของขวัญ
          </p>
        </div>
      </main>
    );
  }
  if (unlock.expiresAt && unlock.expiresAt < new Date()) {
    return (
      <main className="bg-[#fafafa] min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            ลิงก์นี้หมดอายุแล้ว
          </h1>
          <p className="text-sm text-zinc-500">
            หากต้องการดาวน์โหลด กรุณาติดต่อผู้ส่ง
          </p>
        </div>
      </main>
    );
  }

  const product = unlock.product;
  const productTitle = product.titleTh ?? product.title;
  const gifterName = unlock.user?.name || "เพื่อน";
  const downloadable = product.digitalAssets.filter((a) => !a.isPreview);
  const previews = product.digitalAssets.filter((a) => a.isPreview);

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
            <Gift className="h-8 w-8" />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-zinc-500 mb-2">
            ของขวัญดิจิทัล
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
            {gifterName} ส่งของขวัญให้คุณ
            {unlock.recipientName ? ` คุณ${unlock.recipientName}` : ""}
          </h1>
          <p className="text-sm text-zinc-500">
            จากร้าน <strong>{product.store.name}</strong>
          </p>
        </div>

        {unlock.giftMessage ? (
          <div
            className="border-l-4 border-rose-300 bg-rose-50/60 px-5 py-4 mb-8 rounded-r-lg"
          >
            <p className="text-sm italic text-zinc-700">
              “{unlock.giftMessage}”
            </p>
          </div>
        ) : null}

        <section className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 mb-6">
          <div className="flex gap-5 items-start">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={productTitle}
                width={120}
                height={120}
                className="rounded-lg object-cover shrink-0"
                unoptimized
              />
            ) : (
              <div className="h-[120px] w-[120px] rounded-lg bg-zinc-100 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">
                {productTitle}
              </h2>
              <p className="text-xs text-zinc-500 inline-flex items-center gap-1">
                <KeyRound size={11} />
                License {unlock.licenseKey.slice(0, 12)}…
              </p>
            </div>
          </div>

          {downloadable.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500 italic text-center">
              ผู้ขายยังไม่ได้อัปโหลดไฟล์ — โปรดติดต่อร้าน
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-zinc-100">
              {downloadable.map((asset) => (
                <li
                  key={asset.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {asset.fileName}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      .{asset.fileFormat} · {asset.fileSizeMB.toFixed(1)} MB
                    </p>
                  </div>
                  <a
                    href={`/api/digital/download/${unlock.id}/${asset.id}?token=${unlock.accessToken}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    <FileDown size={14} />
                    ดาวน์โหลด
                  </a>
                </li>
              ))}
            </ul>
          )}

          {previews.length > 0 ? (
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <p className="text-xs uppercase tracking-wide font-semibold text-zinc-500 mb-3">
                ตัวอย่าง (ฟรี)
              </p>
              <ul className="space-y-2">
                {previews.map((asset) => (
                  <li
                    key={asset.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-zinc-700 truncate">
                      {asset.fileName}
                    </span>
                    <a
                      href={`/api/digital/download/${unlock.id}/${asset.id}?token=${unlock.accessToken}`}
                      className="text-zinc-900 hover:underline text-xs"
                    >
                      ดู
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <p className="text-center text-xs text-zinc-400">
          เก็บลิงก์นี้ไว้ — บุ๊กมาร์กได้ตลอด ไม่ต้องสมัครสมาชิก ·{" "}
          <Link
            href={`/stores/${product.store.slug}`}
            className="underline hover:text-zinc-600"
          >
            เข้าร้าน
          </Link>
        </p>
      </div>
    </main>
  );
}

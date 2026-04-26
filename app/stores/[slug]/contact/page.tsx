import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Facebook, MessageCircle, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoreContactPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      contactEmail: true,
      contactPhone: true,
      facebookUrl: true,
      lineId: true,
      tagline: true,
      primaryColor: true,
    },
  });
  if (!store) notFound();

  const channels = [
    store.contactEmail && {
      icon: Mail,
      label: "อีเมล",
      value: store.contactEmail,
      href: `mailto:${store.contactEmail}`,
    },
    store.contactPhone && {
      icon: Phone,
      label: "โทรศัพท์",
      value: store.contactPhone,
      href: `tel:${store.contactPhone.replace(/[^0-9+]/g, "")}`,
    },
    store.facebookUrl && {
      icon: Facebook,
      label: "Facebook",
      value: store.facebookUrl.replace(/^https?:\/\//, ""),
      href: store.facebookUrl,
    },
    store.lineId && {
      icon: MessageCircle,
      label: "LINE",
      value: store.lineId,
      href: `https://line.me/R/ti/p/${encodeURIComponent(store.lineId.replace(/^@/, "~"))}`,
    },
  ].filter(Boolean) as Array<{
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
  }>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">ติดต่อ {store.name}</h1>
      {store.tagline && (
        <p className="mt-1 text-sm text-muted-foreground">{store.tagline}</p>
      )}

      {channels.length === 0 ? (
        <div className="mt-8 rounded-lg border bg-yellow-50 p-6 text-sm text-yellow-800">
          <p className="font-medium">ยังไม่มีช่องทางติดต่อ</p>
          <p className="mt-2 text-xs">ทางร้านยังไม่ได้กรอกข้อมูลติดต่อ — กรุณากลับมาใหม่ภายหลัง</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {channels.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-4 rounded-lg border bg-white p-4 transition hover:border-gray-400"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: store.primaryColor ?? "#2563eb" }}
              >
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </p>
                <p className="font-medium break-all">{c.value}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-start gap-3 rounded-lg border bg-white p-4 text-sm">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">ที่อยู่ร้าน</p>
          <p className="text-muted-foreground">{store.name}, Thailand</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/stores/${params.slug}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

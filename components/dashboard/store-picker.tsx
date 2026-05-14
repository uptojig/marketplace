"use client";

// Store picker rendered in the dashboard topbar.
//
// Two render modes:
//   1. Multiple stores available (admin OR multi-store owner) → shadcn
//      `<Select>` that pushes `?storeSlug=newSlug` onto the current
//      URL (preserving every other search param so e.g. the orders
//      `?tab=PAID` filter survives a store switch).
//   2. Exactly one store available (the singular owner case — the
//      vast majority of users today since `Store.ownerId @unique`) →
//      a static `<Badge>` showing the store name. No interaction.
//
// Why URL search param vs. cookie: the prompt requires that refreshes,
// shared links, and back-button navigation all preserve the choice.
// Cookies would silently desync from the URL on share-link follow.
// Search-param-as-source-of-truth is also what the dashboard pages
// already do for things like the orders `tab` filter.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Store as StoreIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StoreOption = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
};

export function StorePicker({
  currentStore,
  availableStores,
  isAdmin,
}: {
  currentStore: StoreOption;
  availableStores: StoreOption[];
  // Surfaces an "Admin" hint on the badge when an admin is editing
  // someone else's store — purely informational, not load-bearing
  // for authorization.
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Singular-owner UX — render a static badge, not a picker. This
  // covers ~all users today (Store.ownerId @unique).
  if (availableStores.length <= 1) {
    return (
      <Badge variant="outline" className="h-8 gap-1.5 px-2.5">
        <StoreIcon className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">{currentStore.name}</span>
      </Badge>
    );
  }

  // Multi-store mode (admin / future multi-store owner). Push the
  // new slug while preserving the rest of the search params so e.g.
  // the orders ?tab=PAID filter doesn't get nuked by a store switch.
  function handleChange(nextSlug: string) {
    if (nextSlug === currentStore.slug) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("storeSlug", nextSlug);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentStore.slug} onValueChange={handleChange}>
        <SelectTrigger
          aria-label="เลือกร้าน"
          className="h-8 min-w-[180px] gap-2"
        >
          <SelectValue placeholder="เลือกร้าน">
            <span className="flex items-center gap-2">
              <Avatar size="sm" className="size-5">
                {currentStore.logoUrl ? (
                  <AvatarImage
                    src={currentStore.logoUrl}
                    alt={currentStore.name}
                  />
                ) : null}
                <AvatarFallback className="text-[10px]">
                  {currentStore.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">
                {currentStore.name}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {availableStores.map((s) => (
            <SelectItem key={s.id} value={s.slug}>
              <span className="flex items-center gap-2">
                <Avatar size="sm" className="size-5">
                  {s.logoUrl ? (
                    <AvatarImage src={s.logoUrl} alt={s.name} />
                  ) : null}
                  <AvatarFallback className="text-[10px]">
                    {s.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{s.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isAdmin && (
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Admin
        </Badge>
      )}
    </div>
  );
}

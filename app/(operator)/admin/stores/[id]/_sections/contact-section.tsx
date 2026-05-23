"use client";

/**
 * Contact tab — email / phone / social URLs / platform email forward
 * target. The platform email itself is system-managed (provisioned when
 * a custom domain is set) so it shows read-only above the form;
 * `platformEmailForwardTo` is the only editable platform-email column.
 */

import { useRouter } from "next/navigation";

import {
  OperatorFormSection,
  type OperatorFormSectionSubmitResult,
} from "@/components/operator/operator-form-section";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  storeContactSchema,
  type StoreContactValues,
} from "@/lib/admin/store-form-schema";

import { patchStore } from "./patch-store";

export type ContactStore = {
  id: string;
  contactEmail: string | null;
  contactPhone: string | null;
  facebookUrl: string | null;
  messengerUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  lineId: string | null;
  platformEmail: string | null;
  platformEmailForwardTo: string | null;
  platformEmailVerified: boolean;
};

function toDefaults(s: ContactStore): StoreContactValues {
  return {
    contactEmail: s.contactEmail ?? "",
    contactPhone: s.contactPhone ?? "",
    facebookUrl: s.facebookUrl ?? "",
    messengerUrl: s.messengerUrl ?? "",
    twitterUrl: s.twitterUrl ?? "",
    instagramUrl: s.instagramUrl ?? "",
    websiteUrl: s.websiteUrl ?? "",
    lineId: s.lineId ?? "",
    platformEmailForwardTo: s.platformEmailForwardTo ?? "",
  };
}

export function ContactSection({ store }: { store: ContactStore }) {
  const router = useRouter();
  const defaults = toDefaults(store);

  async function handleSubmit(
    values: StoreContactValues,
  ): Promise<OperatorFormSectionSubmitResult> {
    const result = await patchStore(store.id, values);
    if (result.ok) router.refresh();
    return result;
  }

  return (
    <>
      <OperatorFormSection
        title="ช่องทางติดต่อ"
        description="email, โทรศัพท์, social media URLs"
        schema={storeContactSchema}
        defaultValues={defaults}
        onSubmit={handleSubmit}
      >
        {(form) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="contact@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>โทรศัพท์</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0812345678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Page URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://facebook.com/..."
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="messengerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Messenger URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://m.me/..."
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormDescription>
                      m.me/... หรือลิงก์ Messenger
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X (Twitter) URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://x.com/..."
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://instagram.com/..."
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เว็บไซต์ (Website)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LINE ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@example" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">อีเมลของระบบ (Platform Email)</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                อีเมลกลางบนโดเมนของระบบ — สร้างให้อัตโนมัติเมื่อร้านตั้งค่า
                custom domain ครั้งแรก เมลที่ส่งมาจะถูก forward ไปยังกล่อง
                จดหมายที่ระบุไว้ด้านล่าง
              </p>
              <div className="mt-3 space-y-1">
                <label className="text-xs font-medium">อีเมลกลางของร้าน</label>
                <Input
                  value={store.platformEmail ?? "— ยังไม่มี —"}
                  readOnly
                  className="bg-muted font-mono"
                />
              </div>
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="platformEmailForwardTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ส่งต่อไปที่อีเมล</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="contact@yourdomain.com"
                        />
                      </FormControl>
                      <FormDescription>
                        กล่องจดหมายที่จะรับเมลจริง — กรอกอีเมลใดก็ได้ เช่น
                        contact@yourdomain.com (ระบบเชื่อค่าที่แอดมินกรอก
                        ไม่ต้องยืนยันเพิ่ม)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="font-medium">สถานะ:</span>
                {store.platformEmailVerified ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ยืนยันแล้ว
                  </Badge>
                ) : (
                  <Badge variant="secondary">ยังไม่ยืนยัน</Badge>
                )}
              </div>
            </div>
          </>
        )}
      </OperatorFormSection>
    </>
  );
}

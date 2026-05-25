"use client";

/**
 * Address tab — Thai postal address (addressLine1 / 2 / subdistrict /
 * district / province / postalCode / country). Empty strings stay as ""
 * client-side; the server's trimNullable transform converts to null.
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
import {
  storeAddressSchema,
  type StoreAddressValues,
} from "@/lib/admin/store-form-schema";

import { patchStore } from "./patch-store";

export type AddressStore = {
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
};

function toDefaults(s: AddressStore): StoreAddressValues {
  return {
    addressLine1: s.addressLine1 ?? "",
    addressLine2: s.addressLine2 ?? "",
    subdistrict: s.subdistrict ?? "",
    district: s.district ?? "",
    province: s.province ?? "",
    postalCode: s.postalCode ?? "",
    country: s.country ?? "TH",
  };
}

export function AddressSection({ store }: { store: AddressStore }) {
  const router = useRouter();
  const defaults = toDefaults(store);

  async function handleSubmit(
    values: StoreAddressValues,
  ): Promise<OperatorFormSectionSubmitResult> {
    const result = await patchStore(store.id, values);
    if (result.ok) router.refresh();
    return result;
  }

  return (
    <OperatorFormSection
      title="ที่อยู่ร้านค้า"
      description="ที่อยู่ตามแบบไทย — ใช้ในใบเสร็จและหน้าติดต่อ"
      schema={storeAddressSchema}
      defaultValues={defaults}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>บ้านเลขที่ / ถนน</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="364/99 ซอยศูนย์วิจัย 4" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เพิ่มเติม (อาคาร / ชั้น)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ชั้น 2 อาคาร A (ไม่ใส่ก็ได้)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="subdistrict"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>แขวง / ตำบล</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="บางกะปิ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เขต / อำเภอ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ห้วยขวาง" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จังหวัด</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="กรุงเทพมหานคร" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสไปรษณีย์</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="10310"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเทศ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="TH"
                      maxLength={2}
                      className="w-24 font-mono uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    ISO code 2 ตัว เช่น TH, US
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </OperatorFormSection>
  );
}

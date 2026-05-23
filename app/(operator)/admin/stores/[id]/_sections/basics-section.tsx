"use client";

/**
 * Basics tab — name / slug / description / tagline / company / taxId /
 * customDomain. Validates via storeBasicsSchema then PATCHes the dirty
 * subset to /api/admin/stores/[id].
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
import { Textarea } from "@/components/ui/textarea";
import {
  storeBasicsSchema,
  type StoreBasicsValues,
} from "@/lib/admin/store-form-schema";

import { patchStore } from "./patch-store";

export type BasicsStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  customDomain: string | null;
  companyName: string | null;
  taxId: string | null;
};

function toDefaults(s: BasicsStore): StoreBasicsValues {
  return {
    name: s.name,
    slug: s.slug,
    description: s.description ?? "",
    tagline: s.tagline ?? "",
    customDomain: s.customDomain ?? "",
    companyName: s.companyName ?? "",
    taxId: s.taxId ?? "",
  };
}

export function BasicsSection({ store }: { store: BasicsStore }) {
  const router = useRouter();
  const defaults = toDefaults(store);

  async function handleSubmit(
    values: StoreBasicsValues,
  ): Promise<OperatorFormSectionSubmitResult> {
    const result = await patchStore(store.id, values);
    if (result.ok) router.refresh();
    return result;
  }

  return (
    <OperatorFormSection
      title="ข้อมูลพื้นฐาน"
      description="ชื่อร้าน, slug, คำอธิบาย และข้อมูลนิติบุคคล"
      schema={storeBasicsSchema}
      defaultValues={defaults}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  ชื่อร้าน <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="เช่น Fluffy House" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Slug (URL ของร้าน){" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="font-mono"
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormDescription>
                  /stores/{form.watch("slug") || "..."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>คำอธิบาย</FormLabel>
                <FormControl>
                  <Textarea rows={3} maxLength={500} {...field} />
                </FormControl>
                <FormDescription>
                  โชว์ในหน้าร้านและ meta description (max 500)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="เช่น แฟชั่นนำเทรนด์ ส่งตรงจากโรงงาน"
                  />
                </FormControl>
                <FormDescription>ข้อความสั้นๆใต้ชื่อร้าน</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Domain</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="shop.example.com"
                    className="font-mono"
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormDescription>
                  ถ้าตั้งไว้ ลูกค้าเข้าผ่านโดเมนนี้แทน /stores/[slug]
                  (ต้องชี้ DNS มาที่ Vercel แยก)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อบริษัท / นิติบุคคล</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="บริษัท ___ จำกัด" />
                  </FormControl>
                  <FormDescription>
                    เช่น &ldquo;บริษัท นิสิตสามย่าน จำกัด (สำนักงานใหญ่)&rdquo;
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เลขประจำตัวผู้เสียภาษี</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0105564088661"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>13 หลัก</FormDescription>
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

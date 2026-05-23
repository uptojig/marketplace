"use client";

/**
 * StoreEditForm — admin edit-store orchestrator.
 *
 * Renders the 5 per-tab sections (basics / branding / address / contact
 * / danger) inside a shadcn <Tabs> shell. Each section owns its own RHF
 * form + PATCH submit, so dirty-tracking and validation are scoped to
 * the tab the operator is on. Phase C of the admin/stores redesign.
 *
 * The Approval panel and page-header actions (View store, Landing
 * content, etc.) are now hoisted into the page-level OperatorPageHeader
 * — this component is only concerned with the editable form sections.
 */

import * as React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  BasicsSection,
  type BasicsStore,
} from "./_sections/basics-section";
import {
  BrandingSection,
  type BrandingStore,
} from "./_sections/branding-section";
import {
  AddressSection,
  type AddressStore,
} from "./_sections/address-section";
import {
  ContactSection,
  type ContactStore,
} from "./_sections/contact-section";
import { DangerSection, type DangerStore } from "./_sections/danger-section";

// Union of every column the per-tab sections read from. Kept inline
// (not exported) so adding a new section just means widening the type
// here + extending the corresponding *Store type in _sections/.
export type StoreEditData = BasicsStore &
  BrandingStore &
  AddressStore &
  ContactStore &
  DangerStore;

export function StoreEditForm({ store }: { store: StoreEditData }) {
  return (
    <Tabs defaultValue="basics" className="w-full">
      <TabsList className="sticky top-0 z-10 mb-4 w-full justify-start gap-1 bg-background/95 backdrop-blur">
        <TabsTrigger value="basics">ข้อมูลพื้นฐาน</TabsTrigger>
        <TabsTrigger value="branding">แบรนด์ดิ้ง</TabsTrigger>
        <TabsTrigger value="address">ที่อยู่</TabsTrigger>
        <TabsTrigger value="contact">ติดต่อ</TabsTrigger>
        <TabsTrigger
          value="danger"
          className="data-active:bg-destructive/10 data-active:text-destructive"
        >
          โซนอันตราย
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basics" className="mt-0">
        <BasicsSection store={store} />
      </TabsContent>
      <TabsContent value="branding" className="mt-0">
        <BrandingSection store={store} />
      </TabsContent>
      <TabsContent value="address" className="mt-0">
        <AddressSection store={store} />
      </TabsContent>
      <TabsContent value="contact" className="mt-0">
        <ContactSection store={store} />
      </TabsContent>
      <TabsContent value="danger" className="mt-0">
        <DangerSection store={store} />
      </TabsContent>
    </Tabs>
  );
}

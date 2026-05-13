'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AnnotatedSupplierProduct,
  ImportSource,
} from '@/lib/import-sources/types';

export type CollectionStatus = 'draft' | 'processing' | 'ready' | 'imported';

export interface TranslationData {
  titleTh: string;
  descriptionTh: string;
  categorySlug: string;
  categoryTh: string;
  priceTHB: number;
  compareAtTHB: number;
  costTHB: number;
}

export interface CollectionItem {
  id: string;
  externalId: string;
  source: ImportSource;
  product: AnnotatedSupplierProduct;
  addedAt: string;
  selectedImageIndexes?: number[];
  primaryImageIndex?: number;
  /** Current translation — may be edited by seller */
  translated?: TranslationData;
  /** Original AI translation — immutable snapshot for "reset to AI" */
  aiTranslation?: TranslationData;
  ipChecked?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  /** When set, "ยืนยันนำเข้า" pushes to this store. Otherwise user picks at import time */
  targetStoreId?: string;
  items: CollectionItem[];
  status: CollectionStatus;
  createdAt: string;
  lastModifiedAt: string;
}

interface CollectionStore {
  collections: Collection[];

  createCollection: (input: { name: string; description?: string; targetStoreId?: string }) => string;
  renameCollection: (id: string, name: string) => void;
  setDescription: (id: string, description: string) => void;
  setTargetStore: (id: string, storeId?: string) => void;
  deleteCollection: (id: string) => void;

  addItem: (collectionId: string, product: AnnotatedSupplierProduct) => void;
  addManyItems: (collectionId: string, products: AnnotatedSupplierProduct[]) => void;
  removeItem: (collectionId: string, itemId: string) => void;

  setPrimaryImage: (collectionId: string, itemId: string, imageIndex: number) => void;
  toggleImageSelected: (collectionId: string, itemId: string, imageIndex: number) => void;

  setItemTranslation: (
    collectionId: string,
    itemId: string,
    translated: TranslationData,
  ) => void;

  /** Granular field edit — used by inline editors */
  updateTranslationField: <K extends keyof TranslationData>(
    collectionId: string,
    itemId: string,
    field: K,
    value: TranslationData[K],
  ) => void;

  /** Restore one item's translation to AI default */
  resetTranslationToAi: (collectionId: string, itemId: string) => void;

  /** Restore all items in collection to AI default */
  resetAllTranslationsToAi: (collectionId: string) => void;

  setStatus: (id: string, status: CollectionStatus) => void;

  getById: (id: string) => Collection | undefined;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function touch(c: Collection): Collection {
  return { ...c, lastModifiedAt: new Date().toISOString() };
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: [],

      createCollection: (input) => {
        const id = newId('coll');
        const now = new Date().toISOString();
        const collection: Collection = {
          id,
          name: input.name,
          description: input.description,
          targetStoreId: input.targetStoreId,
          items: [],
          status: 'draft',
          createdAt: now,
          lastModifiedAt: now,
        };
        set((s) => ({ collections: [...s.collections, collection] }));
        return id;
      },

      renameCollection: (id, name) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? touch({ ...c, name }) : c)),
        })),

      setDescription: (id, description) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? touch({ ...c, description }) : c,
          ),
        })),

      setTargetStore: (id, storeId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? touch({ ...c, targetStoreId: storeId }) : c,
          ),
        })),

      deleteCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

      addItem: (collectionId, product) =>
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c;
            // Avoid duplicates
            if (c.items.some((i) => i.externalId === product.externalId && i.source === product.source)) {
              return c;
            }
            const item: CollectionItem = {
              id: newId('itm'),
              externalId: product.externalId,
              source: product.source,
              product,
              addedAt: new Date().toISOString(),
              selectedImageIndexes: product.images.map((_, i) => i),
              primaryImageIndex: 0,
            };
            return touch({ ...c, items: [...c.items, item], status: 'draft' });
          }),
        })),

      addManyItems: (collectionId, products) =>
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c;
            const existingKeys = new Set(c.items.map((i) => `${i.source}:${i.externalId}`));
            const newItems: CollectionItem[] = products
              .filter((p) => !existingKeys.has(`${p.source}:${p.externalId}`))
              .map((product) => ({
                id: newId('itm'),
                externalId: product.externalId,
                source: product.source,
                product,
                addedAt: new Date().toISOString(),
                selectedImageIndexes: product.images.map((_, i) => i),
                primaryImageIndex: 0,
              }));
            if (newItems.length === 0) return c;
            return touch({ ...c, items: [...c.items, ...newItems], status: 'draft' });
          }),
        })),

      removeItem: (collectionId, itemId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({ ...c, items: c.items.filter((i) => i.id !== itemId) })
              : c,
          ),
        })),

      setPrimaryImage: (collectionId, itemId, imageIndex) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId ? { ...i, primaryImageIndex: imageIndex } : i,
                  ),
                })
              : c,
          ),
        })),

      toggleImageSelected: (collectionId, itemId, imageIndex) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({
                  ...c,
                  items: c.items.map((i) => {
                    if (i.id !== itemId) return i;
                    const current = i.selectedImageIndexes ?? i.product.images.map((_, idx) => idx);
                    const next = current.includes(imageIndex)
                      ? current.filter((x) => x !== imageIndex)
                      : [...current, imageIndex].sort((a, b) => a - b);
                    return { ...i, selectedImageIndexes: next };
                  }),
                })
              : c,
          ),
        })),

      setItemTranslation: (collectionId, itemId, translated) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId
                      ? { ...i, translated, aiTranslation: translated }
                      : i,
                  ),
                })
              : c,
          ),
        })),

      updateTranslationField: (collectionId, itemId, field, value) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({
                  ...c,
                  items: c.items.map((i) => {
                    if (i.id !== itemId || !i.translated) return i;
                    return {
                      ...i,
                      translated: { ...i.translated, [field]: value },
                    };
                  }),
                })
              : c,
          ),
        })),

      resetTranslationToAi: (collectionId, itemId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId && i.aiTranslation
                      ? { ...i, translated: { ...i.aiTranslation } }
                      : i,
                  ),
                })
              : c,
          ),
        })),

      resetAllTranslationsToAi: (collectionId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? touch({
                  ...c,
                  items: c.items.map((i) =>
                    i.aiTranslation ? { ...i, translated: { ...i.aiTranslation } } : i,
                  ),
                })
              : c,
          ),
        })),

      setStatus: (id, status) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? touch({ ...c, status }) : c)),
        })),

      getById: (id) => get().collections.find((c) => c.id === id),
    }),
    { name: 'basketplace-import-collections', version: 2 },
  ),
);

export const COLLECTION_STATUS_LABEL: Record<CollectionStatus, string> = {
  draft: 'แบบร่าง',
  processing: 'กำลังประมวลผล',
  ready: 'พร้อมนำเข้า',
  imported: 'นำเข้าแล้ว',
};

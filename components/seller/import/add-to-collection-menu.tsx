'use client';

import { useState } from 'react';
import { Check, FolderPlus, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCollectionStore } from '@/lib/import-collections/store';
import type { AnnotatedSupplierProduct } from '@/lib/import-sources/types';

interface Props {
  products: AnnotatedSupplierProduct[]; // 1 or many — bulk-add supported
  trigger?: React.ReactNode;
}

export function AddToCollectionMenu({ products, trigger }: Props) {
  const collections = useCollectionStore((s) => s.collections);
  const addManyItems = useCollectionStore((s) => s.addManyItems);
  const createCollection = useCollectionStore((s) => s.createCollection);

  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [addedToCollectionId, setAddedToCollectionId] = useState<string | null>(null);

  const handleAddToExisting = (collectionId: string) => {
    addManyItems(collectionId, products);
    setAddedToCollectionId(collectionId);
    setOpen(false);
    setTimeout(() => setAddedToCollectionId(null), 2000);
  };

  const handleCreateNew = () => {
    if (!newName.trim()) return;
    const id = createCollection({ name: newName.trim() });
    addManyItems(id, products);
    setNewName('');
    setDialogOpen(false);
    setAddedToCollectionId(id);
    setTimeout(() => setAddedToCollectionId(null), 2000);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          {trigger ?? (
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]">
              {addedToCollectionId ? (
                <>
                  <Check className="h-3 w-3 text-green-600" /> เพิ่มแล้ว
                </>
              ) : (
                <>
                  <FolderPlus className="h-3 w-3" /> เพิ่มในคอลเลคชั่น
                </>
              )}
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
            {products.length === 1
              ? 'เพิ่มสินค้านี้ใน...'
              : `เพิ่ม ${products.length} รายการใน...`}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {collections.length === 0 ? (
            <DropdownMenuLabel className="px-2 py-3 text-center text-xs text-muted-foreground font-normal">
              ยังไม่มีคอลเลคชั่น
            </DropdownMenuLabel>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {collections.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => handleAddToExisting(c.id)}
                  className="flex items-start justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {c.items.length} รายการ
                      {c.targetStoreId && ` · ร้าน ${c.targetStoreId}`}
                    </div>
                  </div>
                  <span
                    className={
                      c.status === 'imported'
                        ? 'text-[9px] text-green-600'
                        : c.status === 'ready'
                          ? 'text-[9px] text-blue-600'
                          : 'text-[9px] text-muted-foreground'
                    }
                  >
                    {c.status === 'draft' && '●'}
                    {c.status === 'ready' && '✓'}
                    {c.status === 'imported' && '✓✓'}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setDialogOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="mr-1 h-3 w-3" /> สร้างคอลเลคชั่นใหม่
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>สร้างคอลเลคชั่นใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="coll-name" className="text-xs">
                ชื่อคอลเลคชั่น
              </Label>
              <Input
                id="coll-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="เช่น TikTok hits มิ.ย., ของขายฤดูร้อน"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              <Sparkles className="inline h-3 w-3" /> เพิ่ม {products.length} รายการเข้าคอลเลคชั่นนี้ทันที
              ค่อยแปลและกำหนดร้านปลายทางทีหลัง
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateNew} disabled={!newName.trim()}>
              สร้างและเพิ่ม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

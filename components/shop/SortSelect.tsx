"use client";

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      aria-label="เรียงตามลำดับ"
      className="h-11 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) url.searchParams.set("sort", e.target.value);
        else url.searchParams.delete("sort");
        window.location.href = url.toString();
      }}
    >
      <option value="">เรียงตามลำดับ</option>
      <option value="best-selling">ขายดี</option>
      <option value="newest">มาใหม่</option>
      <option value="low-to-high">ราคาต่ำไปสูง</option>
      <option value="high-to-low">ราคาสูงไปต่ำ</option>
      <option value="order-by-stock">เรียงตามสินค้าที่มีสต๊อก</option>
    </select>
  );
}

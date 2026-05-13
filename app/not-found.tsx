import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        ไม่พบหน้าที่คุณค้นหา
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        หน้านี้อาจถูกลบ ย้าย หรือลิงก์ที่คุณเปิดเข้ามาไม่ถูกต้อง
        ลองกลับไปหน้าแรกหรือค้นหาสิ่งที่ต้องการได้ที่ด้านล่าง
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/help">
            <Search className="mr-2 h-4 w-4" />
            ศูนย์ช่วยเหลือ
          </Link>
        </Button>
      </div>
    </div>
  );
}

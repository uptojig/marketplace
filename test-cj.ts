import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { cjAdapter } from "./lib/suppliers/cj/adapter";

async function test() {
  try {
    const res = await cjAdapter.listCatalog({ search: "phone case" });
    console.log("✅ CJ fetched products:", res.items.length);
    console.log("First item:", res.items[0]);
  } catch (err) {
    console.error("❌ CJ Error:", err);
  }
}
test();

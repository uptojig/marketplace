import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { runLandingAgent } from "./lib/landing-agent";

async function test() {
  const storeId = "cmpcinsx405kewgrx10rtg8jo"; // zugar
  const brief = "เคสมือถือ"; // iPhone Case search

  console.log("🚀 Running AI Agent for store:", storeId);
  try {
    const result = await runLandingAgent({ storeId, brief });
    console.log("✅ Success:", result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

test();

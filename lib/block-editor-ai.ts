/**
 * AI-assisted single-block editing.
 * Sends one block + instruction to Haiku → returns modified block.
 * Fast (~3-5s) because payload is tiny.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AGENT_MODEL } from "@/lib/agent/config";

const BLOCK_EDIT_SYSTEM = `You edit individual blocks of a Thai e-commerce landing page.
You receive the current block JSON and an instruction from the operator.
Return ONLY the modified block JSON — no explanation, no markdown fences.
Rules:
- Keep the same blockType
- Only change what the instruction asks for
- All text in Thai unless asked otherwise
- Return valid JSON: {"blockType":"...","content":{...}}`;

type Block = { blockType: string; content: Record<string, unknown> };

export async function aiFixBlock(args: {
  block: Block;
  instruction: string;
  designFamily?: string;
  storeName?: string;
}): Promise<Block> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });

  const userMsg = [
    `Store: ${args.storeName ?? "Shop"}`,
    args.designFamily ? `Design family: ${args.designFamily}` : "",
    `\nCurrent block:\n${JSON.stringify(args.block, null, 2)}`,
    `\nInstruction: ${args.instruction}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: AGENT_MODEL,
    max_tokens: 2000,
    system: BLOCK_EDIT_SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("blockType" in parsed) ||
    !("content" in parsed)
  ) {
    throw new Error("AI returned object without blockType/content");
  }

  return parsed as Block;
}

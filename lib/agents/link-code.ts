const SAFE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generates a random 6-char alphanumeric code with no prefix.
 * e.g., "X7K9AB" — deliberately neutral so an invite link never hints
 * at an "agent" / referral system to the vendor receiving it.
 */
export function generateLinkCode(): string {
  return Array.from({ length: 6 }, () =>
    SAFE_ALPHABET[Math.floor(Math.random() * SAFE_ALPHABET.length)]
  ).join("");
}

/**
 * Normalizes a user-inputted link code to uppercase and trims whitespaces.
 */
export function normalizeLinkCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Validates the format of the link code.
 * Rules:
 * - Must be between 3 and 20 characters.
 * - Allowed characters: uppercase letters, numbers, and hyphens.
 * - Must start and end with an alphanumeric character.
 */
export function isValidLinkCodeFormat(code: string): boolean {
  const normalized = normalizeLinkCode(code);
  return /^[A-Z0-9][A-Z0-9\-]{1,18}[A-Z0-9]$/.test(normalized);
}

// Copied from the Amcolink website repo, lib/password.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
// Password rules for sign-up and password reset.
// Also set the same minimum in Supabase (Authentication → Sign In / Providers → Email)
// so the rule is enforced on the server, not only in the browser.

export const MIN_PASSWORD_LENGTH = 8;

// Passwords attackers try first. Kept short on purpose; Supabase can add leaked-password checks on paid plans.
const COMMON = new Set([
  "password", "password1", "password123", "passw0rd", "12345678", "123456789", "1234567890",
  "qwerty123", "qwertyuiop", "11111111", "00000000", "abc12345", "abcd1234", "iloveyou",
  "welcome1", "admin123", "letmein1", "sokoeast", "sokoeast1", "amcolink", "amcolink1", "amcolink123", "kenya2024", "kenya2025", "kenya2026",
  "nairobi1", "nairobi123", "mpesa123",
]);

export type PasswordCheck = { ok: boolean; problems: string[] };

export function checkPassword(password: string, email = ""): PasswordCheck {
  const problems: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) problems.push(`at least ${MIN_PASSWORD_LENGTH} characters`);
  if (!/[A-Za-z]/.test(password)) problems.push("a letter");
  if (!/[0-9]/.test(password)) problems.push("a number");
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) problems.push("not a common password");
  const emailName = email.split("@")[0]?.toLowerCase();
  if (emailName && emailName.length >= 4 && lower.includes(emailName)) problems.push("not contain your email name");
  return { ok: problems.length === 0, problems };
}

export function passwordError(password: string, email = ""): string | null {
  const { ok, problems } = checkPassword(password, email);
  return ok ? null : `Password needs ${problems.join(", ")}.`;
}

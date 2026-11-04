// Copied from the Amcolink website repo, lib/authErrors.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
// Turns Supabase auth errors into short, friendly messages (and avoids revealing
// whether a particular email has an account).
export function friendlyAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const m = message.toLowerCase();
  if (m.includes("captcha")) return "The security check didn’t finish. Please wait a second and try again.";
  if (m.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox (and spam folder) for the link.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("weak") || m.includes("password should")) return "Please choose a stronger password.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Could not create the account. If you already have one, sign in or reset your password.";
  if (m.includes("same password") || m.includes("different from the old")) return "Your new password must be different from your old one.";
  if (m.includes("network") || m.includes("failed to fetch")) return "No connection. Check your internet and try again.";
  return message || "Something went wrong. Please try again.";
}

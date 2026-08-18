// Telegram bot token config (server-only file, never bundled to the browser).
// The value itself is kept in the project's secure environment as
// TELEGRAM_BOT_TOKEN so it is never committed to the codebase.
export function getBotToken(): string {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

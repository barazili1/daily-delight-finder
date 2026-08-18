import { createFileRoute } from "@tanstack/react-router";
import { getBotToken } from "@/lib/bot-token.server";

// One-shot helper: points the Telegram bot webhook at THIS deployment.
export const Route = createFileRoute("/api/public/telegram-setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = getBotToken();
        const origin = new URL(request.url).origin;
        const url = `${origin}/api/public/telegram`;

        const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, allowed_updates: ["message"] }),
        });
        const body = await res.text();
        return new Response(JSON.stringify({ url, telegram: body }), {
          status: res.ok ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

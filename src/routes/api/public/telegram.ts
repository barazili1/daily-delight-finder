import { createFileRoute } from "@tanstack/react-router";
import { WELCOME_JPEG_B64 } from "@/lib/telegram-assets.server";

const API = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sendWelcome(token: string, chatId: number, name: string) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(
    "caption",
    `🎰 <b>أهلاً ${name} في CRAZY VIP</b>\n\nمنصة الإشارات والأكواد الأولى.\nجارٍ توليد كود التفعيل الخاص بك...`,
  );
  form.append("parse_mode", "HTML");
  form.append("photo", new Blob([b64ToBytes(WELCOME_JPEG_B64)], { type: "image/jpeg" }), "welcome.jpg");
  await fetch(API(token, "sendPhoto"), { method: "POST", body: form });
}

async function sendCode(token: string, chatId: number, code: string, minutes: number, expiresAt: Date) {
  const url = `https://placehold.co/1000x420/0a0a0a/90D600/png?text=${encodeURIComponent(code)}&font=montserrat`;
  const expire = expiresAt.toISOString().slice(11, 16);
  await fetch(API(token, "sendPhoto"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: url,
      parse_mode: "HTML",
      caption:
        `✅ <b>كود التفعيل الخاص بك</b>\n\n<code>${code}</code>\n\n` +
        `⏳ الوقت المتبقي: <b>${minutes} دقيقة</b>\n🕒 ينتهي في: <b>${expire} UTC</b>\n\n` +
        `انسخ الكود وارجع للتطبيق ثم اضغط «استخدام كود تفعيل».`,
    }),
  });
}

export const Route = createFileRoute("/api/public/telegram")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["TELEGRAM_BOT_TOKEN"];
        if (!token) return new Response("no token", { status: 500 });

        const update = (await request.json()) as {
          message?: { chat: { id: number }; from?: { first_name?: string }; text?: string };
        };
        const msg = update.message;
        if (!msg?.text) return new Response("ok");

        const chatId = msg.chat.id;
        const name = msg.from?.first_name ?? "لاعب";
        const [cmd, arg] = msg.text.trim().split(/\s+/);

        if (cmd !== "/start" && cmd !== "/code") return new Response("ok");

        // Only users who came from the website (deep link with their user id) get a code
        if (!arg) {
          await fetch(API(token, "sendMessage"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              parse_mode: "HTML",
              disable_web_page_preview: false,
              text:
                `👋 <b>أهلاً ${name}</b>\n\n` +
                `https://crazy-vip-one.vercel.app/\n\n` +
                `للحصول على كود تفعيل توجّه إلى الموقع`,
            }),
          });
          return new Response("ok");
        }

        await sendWelcome(token, chatId, name);


        const code = makeCode();
        const minutes = 30 + Math.floor(Math.random() * 31);
        const expiresAt = new Date(Date.now() + minutes * 60_000);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("activation_codes").insert({
          code,
          telegram_id: String(chatId),
          user_id: arg ?? null,
          expires_at: expiresAt.toISOString(),
        });

        await sendCode(token, chatId, code, minutes, expiresAt);
        return new Response("ok");
      },
    },
  },
});

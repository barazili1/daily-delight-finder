import { createFileRoute } from "@tanstack/react-router";
import { getBotToken } from "@/lib/bot-token.server";

const ADMIN_PASS = "HACKSD";

export const Route = createFileRoute("/api/public/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          pass?: string;
          userId?: string;
          status?: string;
        };

        if ((body.pass ?? "").toUpperCase() !== ADMIN_PASS) {
          return new Response("forbidden", { status: 401 });
        }
        if (!body.userId || (body.status !== "approved" && body.status !== "rejected")) {
          return new Response("bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: codes } = await supabaseAdmin
          .from("activation_codes")
          .select("telegram_id")
          .eq("user_id", body.userId)
          .order("created_at", { ascending: false })
          .limit(1);

        let chatId = codes?.[0]?.telegram_id ?? null;

        if (!chatId) {
          const { data: subs } = await supabaseAdmin
            .from("submissions")
            .select("telegram_id")
            .eq("user_id", body.userId)
            .order("created_at", { ascending: false })
            .limit(1);
          chatId = subs?.[0]?.telegram_id ?? null;
        }

        if (!chatId) return new Response("ok");

        const text =
          body.status === "approved"
            ? "✅ <b>تم التحقق من بياناتك</b>\n\nتقدر تستخدم الكود الآن داخل التطبيق."
            : "❌ <b>تم رفض الطلب</b>\n\nلم يتم قبول بياناتك، برجاء إعادة تنفيذ الشروط والمحاولة مجددًا.";

        await fetch(`https://api.telegram.org/bot${getBotToken()}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, parse_mode: "HTML", text }),
        });

        return new Response("ok");
      },
    },
  },
});

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة المراجعة — CRAZY VIP" },
      { name: "description", content: "مراجعة إثباتات المستخدمين وقبول أو رفض طلبات التفعيل." },
      { property: "og:title", content: "لوحة المراجعة — CRAZY VIP" },
      { property: "og:description", content: "قبول أو رفض طلبات التفعيل في CRAZY VIP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Row = {
  id: string;
  user_id: string;
  telegram_id: string | null;
  image1_url: string;
  image2_url: string;
  status: string;
  created_at: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pass = typeof window !== "undefined" ? (sessionStorage.getItem("cvip_admin") ?? "") : "";

  const load = useCallback(async () => {
    const { data } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: Row[] | null; error: unknown }>
    )("admin_list_submissions", { _pass: pass });

    const sign = async (path: string) => {
      if (path.startsWith("http")) return path;
      const { data: signed } = await supabase.storage.from("proofs").createSignedUrl(path, 3600);
      return signed?.signedUrl ?? "";
    };

    const withUrls = await Promise.all(
      (data ?? []).map(async (r) => ({
        ...r,
        image1_url: await sign(r.image1_url),
        image2_url: await sign(r.image2_url),
      })),
    );
    setRows(withUrls);
    setLoading(false);
  }, [pass]);

  useEffect(() => {
    if (!pass) {
      navigate({ to: "/games" });
      return;
    }
    void load();
  }, [pass, load, navigate]);

  const setStatus = async (row: Row, status: "approved" | "rejected") => {
    setBusy(row.id);
    await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: unknown }>
    )("admin_set_submission_status", { _pass: pass, _id: row.id, _status: status });

    await fetch("/api/public/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass, userId: row.user_id, status }),
    }).catch(() => {});

    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, status } : x)));
    setBusy(null);
  };

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-20">
      <TopBar />
      <div className="mx-auto max-w-md px-4 pt-6">
        <Logo size={80} />
        <h1 className="mt-3 text-center text-lg font-black text-foreground">لوحة المراجعة</h1>

        {loading && (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && rows.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">لا توجد طلبات حالياً</p>
        )}

        <div className="mt-6 flex flex-col gap-6">
          {rows.map((r) => (
            <article
              key={r.id}
              className="overflow-hidden rounded-2xl border border-primary/30 bg-transparent p-3 backdrop-blur-sm"
            >
              <div className="grid grid-cols-2 gap-2">
                {[r.image1_url, r.image2_url].map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noreferrer">
                    <img
                      src={u}
                      alt={`إثبات ${i + 1}`}
                      loading="lazy"
                      className="h-40 w-full rounded-xl border border-primary/25 object-cover"
                    />
                  </a>
                ))}
              </div>

              <p className="mt-3 text-center text-sm font-black tracking-widest text-primary">
                {r.user_id}
              </p>
              <p className="text-center text-[11px] text-muted-foreground">
                {r.status === "approved" ? "مقبول" : r.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStatus(r, "rejected")}
                  disabled={busy === r.id}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/60 py-3 text-sm font-black text-red-400 transition active:scale-95 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> رفض
                </button>
                <button
                  onClick={() => setStatus(r, "approved")}
                  disabled={busy === r.id}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: "#90D600" }}
                >
                  <Check className="h-4 w-4" /> قبول
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

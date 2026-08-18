import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Brand } from "@/components/Brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CRAZY VIP — تطبيق الألعاب والتفعيل" },
      { name: "description", content: "CRAZY VIP: ألعاب مميزة وكود تفعيل خاص لمنصات 1xBet وLineBet وWinWin وGreenBet." },
      { property: "og:title", content: "CRAZY VIP — تطبيق الألعاب والتفعيل" },
      { property: "og:description", content: "ابدأ الآن مع CRAZY VIP واحصل على كود التفعيل الخاص بك." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setPct(Math.min(100, ((Date.now() - start) / 3000) * 100)), 40);
    const t = setTimeout(() => navigate({ to: "/games" }), 3000);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [navigate]);

  const status = pct < 35 ? "initializing" : pct < 75 ? "loading assets" : "almost ready";

  return (
    <main
      dir="ltr"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-7 bg-transparent px-8"
    >
      {/* logo orb */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10 [animation-duration:2.6s]" />
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(144,214,0,0.22),transparent_65%)]" />
        <span className="absolute inset-1 rounded-full border border-primary/25" />
        <span className="absolute inset-5 rounded-full border-2 border-primary/50 shadow-[0_0_70px_rgba(144,214,0,0.4)]" />
        <svg className="absolute inset-0 h-full w-full animate-spin [animation-duration:6s]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            className="text-primary/70"
            strokeWidth="1.5"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
        </svg>
        <svg className="absolute inset-0 h-full w-full animate-spin [animation-duration:3s]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="30 246"
            style={{ filter: "drop-shadow(0 0 6px rgba(144,214,0,0.9))" }}
          />
        </svg>
        <Logo size={100} className="relative animate-pulse [animation-duration:3s]" />
      </div>

      {/* brand */}
      <div className="text-center">
        <h1 className="text-4xl tracking-[0.18em]">
          <Brand />
        </h1>
        <div className="mx-auto mt-3 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-muted-foreground">
            premium
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/60" />
        </div>
      </div>

      {/* progress */}
      <div className="w-60">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          <span>{status}</span>
          <span className="tabular-nums text-primary">{Math.round(pct)}%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full border border-primary/30 bg-transparent">
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_16px_rgba(144,214,0,0.85)] transition-[width] duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-6 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Ticket, ShieldCheck, Loader2 } from "lucide-react";
import { Overlay } from "@/components/Overlay";
import { verifyActivationCode } from "@/lib/codes.functions";
import { saveSession, type ActiveSession } from "@/lib/session";

export function ChoiceDialog({
  open,
  onClose,
  onUse,
  onGet,
}: {
  open: boolean;
  onClose: () => void;
  onUse: () => void;
  onGet: () => void;
}) {
  const rows = [
    { label: "استخدام كود تفعيل", sub: "لديك كود من البوت", icon: KeyRound, action: onUse },
    { label: "الحصول على كود تفعيل", sub: "احصل على كود جديد", icon: Ticket, action: onGet },
  ];
  return (
    <Overlay open={open} onClose={onClose}>
      <h3 className="mb-4 text-center text-base font-black text-foreground">اختر طريقة الدخول</h3>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <button
            key={r.label}
            onClick={r.action}
            className="group flex items-center gap-3 rounded-2xl border border-primary/35 bg-transparent p-3 text-left transition active:scale-[0.98] hover:border-primary"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/50 text-primary shadow-[0_0_18px_rgba(144,214,0,0.25)]">
              <r.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-foreground">{r.label}</span>
              <span className="block text-[11px] text-muted-foreground">{r.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </Overlay>
  );
}

export function CodeDialog({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: (s: ActiveSession) => void;
}) {
  const verify = useServerFn(verifyActivationCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await verify({ data: { code } });
      if (res.status === "ok") {
        const s = { code: code.trim().toUpperCase(), userId: res.userId, expiresAt: res.expiresAt };
        saveSession(s);
        onVerified(s);
      } else if (res.status === "expired") {
        setError("الكود صلاحيته منتهية");
      } else {
        setError("كود غير صحيح");
      }
    } catch {
      setError("حدث خطأ، حاول مجددًا");
    }
    setBusy(false);
  };

  return (
    <Overlay open={open} onClose={onClose}>
      <div className="mb-4 flex flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/50 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h3 className="text-base font-black text-foreground">إدخال كود التفعيل</h3>
      </div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="XXXX-XXXX-XXXX-XXXX"
        className="w-full rounded-xl border border-primary/40 bg-transparent px-3 py-3 text-center text-sm font-bold tracking-[0.15em] text-foreground outline-none focus:border-primary"
      />
      {error && <p className="mt-2 text-center text-xs font-bold text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/95 py-3 text-sm font-black text-black transition active:scale-95 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        التحقق
      </button>
    </Overlay>
  );
}

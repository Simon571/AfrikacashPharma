"use client";
import React, { useCallback, useMemo, useState } from "react";
import QRCode from "qrcode";
import { AlertCircle, CheckCircle2, Copy, Loader2, QrCode, RefreshCcw, ShieldCheck } from "lucide-react";

type Feedback = { type: "success" | "error" | "info"; message: string } | null;

const steps = [
  {
    title: "Générer",
    description: "Créez un secret unique et obtenez le QR Code à scanner.",
    icon: RefreshCcw,
  },
  {
    title: "Scanner",
    description: "Ajoutez le compte dans votre application d'authentification.",
    icon: QrCode,
  },
  {
    title: "Valider",
    description: "Saisissez le code à usage unique pour activer la 2FA.",
    icon: ShieldCheck,
  },
];

export default function TotpPage() {
  const [loading, setLoading] = useState(false);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [feedback, setFeedback] = useState<Feedback>({ type: "info", message: "Générez un QR Code pour démarrer." });
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);

  const currentStep = useMemo(() => {
    if (verifiedAt) return 3;
    if (qrDataUrl) return 2;
    return 1;
  }, [qrDataUrl, verifiedAt]);

  const generate = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setVerifiedAt(null);
    try {
      const res = await fetch("/api/auth/totp/generate");
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setOtpauth(json.otpauth_url);
      const dataUrl = await QRCode.toDataURL(json.otpauth_url);
      setQrDataUrl(dataUrl);
      setFeedback({ type: "success", message: "QR Code généré. Scannez-le avec votre application." });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFeedback({ type: "error", message: `Échec de génération : ${message}` });
      setOtpauth(null);
      setQrDataUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/auth/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json));
      setFeedback({ type: "success", message: "TOTP vérifié et activé." });
      setVerifiedAt(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFeedback({ type: "error", message: `Vérification impossible : ${message}` });
      setVerifiedAt(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const copySecret = useCallback(async () => {
    if (!otpauth) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API indisponible dans ce navigateur");
      }
      await navigator.clipboard.writeText(otpauth);
      setFeedback({ type: "success", message: "Lien copié dans le presse-papiers." });
      setTimeout(() => setFeedback(null), 3500);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFeedback({ type: "error", message: `Impossible de copier : ${message}` });
      setTimeout(() => setFeedback(null), 4000);
    }
  }, [otpauth]);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-12">
      <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
          <header className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">Sécurité</span>
            <h1 className="text-3xl font-bold text-slate-900">Activer la double authentification</h1>
            <p className="text-sm text-slate-500">
              Renforcez la sécurité des comptes en ajoutant une couche de vérification basée sur le temps. Suivez les étapes et validez le code généré pour finaliser.
            </p>
          </header>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index + 1 === currentStep;
              const isDone = index + 1 < currentStep;
              return (
                <div
                  key={step.title}
                  className={`rounded-2xl border p-4 text-sm transition ${
                    isDone
                      ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                      : isActive
                      ? "border-slate-900/10 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? "bg-white/10" : "bg-white"}`}>
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-600"}`} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider">Étape {index + 1}</p>
                      <p className="font-semibold">{step.title}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void generate()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Générer un QR Code
            </button>
            <button
              onClick={() => void verify()}
              disabled={loading || !token}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              Vérifier le code
            </button>
            {feedback && (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : feedback.type === "error"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : feedback.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {feedback.message}
              </span>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-6">
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              <span>Code à 6 chiffres</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg tracking-[0.4em] text-slate-900 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            {verifiedAt && (
              <p className="text-xs text-emerald-600">Dernière vérification réussie : {verifiedAt.toLocaleTimeString()}</p>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-inner">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> Mémo de sécurité
          </h2>
          <ul className="space-y-3 text-sm text-emerald-900">
            <li>• Limitez l'accès TOTP aux comptes privilégiés seulement.</li>
            <li>• Conservez un canal de secours (codes de récupération) hors ligne.</li>
            <li>• Vérifiez la date et l'heure du terminal : un décalage casse la vérification.</li>
          </ul>

          <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">QR Code</h3>
            <p className="mt-1 text-xs text-slate-500">Visible uniquement après génération.</p>
            {qrDataUrl ? (
              <div className="mt-4 flex flex-col items-center gap-3">
                <img
                  src={qrDataUrl}
                  alt="QR Code TOTP"
                  className="h-48 w-48 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-md"
                />
                <button
                  onClick={() => void copySecret()}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/20"
                >
                  <Copy className="h-4 w-4" /> Copier l'URL otpauth
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-100/40 px-6 py-10 text-center text-xs text-emerald-700">
                <QrCode className="h-8 w-8" />
                Le QR apparaîtra ici après génération.
              </div>
            )}
          </div>

          {otpauth && (
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
              <p className="font-semibold text-emerald-300">URL otpauth</p>
              <p className="mt-2 break-all font-mono text-[11px] leading-5">{otpauth}</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

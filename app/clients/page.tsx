"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, CircleSlash2, Mail, Phone, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";

type Client = {
  id: string;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | string;
  license?: { key: string; status: string } | null;
};

type FetchResponse = {
  clients?: Client[];
  error?: string;
  ok?: boolean;
};

async function fetchClients(): Promise<FetchResponse> {
  const res = await fetch("/api/admin/clients", { credentials: "include" });
  return res.json();
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  PENDING: "En attente",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
  SUSPENDED: "bg-rose-50 text-rose-600 ring-rose-500/20",
  PENDING: "bg-amber-50 text-amber-600 ring-amber-500/20",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients();
      if (data.error) {
        setError(data.error || "Erreur lors de la récupération");
        return;
      }
      setClients(data.clients || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const metrics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "ACTIVE").length;
    const suspended = clients.filter((c) => c.status === "SUSPENDED").length;
    const noLicense = clients.filter((c) => !c.license).length;
    return {
      total,
      active,
      suspended,
      noLicense,
    };
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...clients]
      .sort((a, b) => {
        const aw = a.license && a.license.status === "ACTIVE" ? 0 : 1;
        const bw = b.license && b.license.status === "ACTIVE" ? 0 : 1;
        if (aw !== bw) return aw - bw;
        return a.name.localeCompare(b.name);
      })
      .filter((c) => {
        if (statusFilter && c.status !== statusFilter) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.contactEmail || "").toLowerCase().includes(q) ||
          (c.contactPhone || "").toLowerCase().includes(q)
        );
      });
    return list;
  }, [clients, query, statusFilter]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchClients();
      if (data.error) {
        setFeedback({ type: "error", message: data.error });
      } else {
        setClients(data.clients || []);
        setFeedback({ type: "success", message: "Liste synchronisée" });
      }
    } catch (e) {
      setFeedback({ type: "error", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  }, []);

  const generateLicense = useCallback(async (clientId: string) => {
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const payload = await res.json();
      if (payload.key) {
        setFeedback({ type: "success", message: `Licence générée : ${payload.key}` });
        const refreshed = await fetchClients();
        setClients(refreshed.clients || []);
      } else {
        throw new Error(payload.error || "Échec génération licence");
      }
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setTimeout(() => setFeedback(null), 5000);
    }
  }, []);

  const toggleSuspend = useCallback(async (clientId: string, currentStatus: string) => {
    try {
      const action = currentStatus === "ACTIVE" ? "suspend" : "activate";
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, action }),
      });
      const payload = await res.json();
      if (payload.client) {
        setClients((prev) => prev.map((p) => (p.id === payload.client.id ? payload.client : p)));
        setFeedback({ type: "success", message: `Client ${action === "suspend" ? "suspendu" : "activé"}` });
      } else {
        throw new Error(payload.error || "Action impossible");
      }
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  }, []);

  const deleteClient = useCallback(async (clientId: string) => {
    if (!confirm("Supprimer ce client ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`/api/admin/clients?clientId=${clientId}`, { method: "DELETE" });
      const payload = await res.json();
      if (payload.ok) {
        setClients((prev) => prev.filter((p) => p.id !== clientId));
        setFeedback({ type: "success", message: "Client supprimé" });
      } else {
        throw new Error(payload.error || "Suppression impossible");
      }
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-10">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Gestion de l'équipe</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Clients & accès</h1>
            <p className="mt-2 text-sm text-slate-500">
              Surveillez l'adoption de la plateforme, pilotez les licences et ajustez les statuts en quelques clics.
            </p>
          </div>
          <button
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Users} label="Clients" value={metrics.total} description="Référencés" />
          <MetricCard icon={BadgeCheck} label="Actifs" value={metrics.active} description="Avec accès" highlight />
          <MetricCard icon={CircleSlash2} label="Suspendus" value={metrics.suspended} description="Accès coupé" variant="warning" />
          <MetricCard icon={ShieldCheck} label="Sans licence" value={metrics.noLicense} description="À activer" variant="info" />
        </section>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par nom, email ou téléphone"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["ACTIVE", "SUSPENDED", "PENDING"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter((prev) => (prev === status ? null : status))}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {statusLabels[status] ?? status}
                </button>
              ))}
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter(null)}
                  className="text-xs font-medium text-slate-500 underline transition hover:text-slate-700"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {feedback.type === "success" ? (
                <BadgeCheck className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Licence</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      Chargement des clients…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-rose-600">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      Aucun client ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => {
                    const badgeClass = statusStyles[client.status] ?? "bg-slate-100 text-slate-600 ring-slate-500/10";
                    const hasActiveLicense = client.license?.status === "ACTIVE";
                    return (
                      <tr key={client.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-4 font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${
                              hasActiveLicense ? "bg-emerald-500" : "bg-slate-400"
                            }`}>
                              {client.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                              <p className="text-xs text-slate-500">Identifiant : {client.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 text-xs">
                            {client.contactEmail ? (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Mail className="h-3.5 w-3.5" />
                                {client.contactEmail}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Mail className="h-3.5 w-3.5" />
                                Pas d'email
                              </span>
                            )}
                            {client.contactPhone ? (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Phone className="h-3.5 w-3.5" />
                                {client.contactPhone}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Phone className="h-3.5 w-3.5" />
                                Pas de téléphone
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {client.license ? (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                client.license.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                                  : "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20"
                              }`}
                            >
                              {client.license.status === "ACTIVE" ? "Active" : client.license.status}
                            </span>
                          ) : (
                            <button
                              onClick={() => void generateLicense(client.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-dashed border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:border-emerald-500 hover:bg-emerald-50"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Générer
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeClass}`}>
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {statusLabels[client.status] ?? client.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2 text-xs font-semibold">
                            <button
                              onClick={() => void toggleSuspend(client.id, client.status)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
                            >
                              {client.status === "ACTIVE" ? "Suspendre" : "Activer"}
                            </button>
                            <button
                              onClick={() => void generateLicense(client.id)}
                              className="rounded-lg border border-emerald-300 bg-emerald-500/10 px-3 py-1.5 text-emerald-600 transition hover:bg-emerald-500/20"
                            >
                              Licence
                            </button>
                            <button
                              onClick={() => void deleteClient(client.id)}
                              className="rounded-lg border border-transparent px-3 py-1.5 text-rose-600 transition hover:bg-rose-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

type MetricCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description: string;
  highlight?: boolean;
  variant?: "warning" | "info";
};

function MetricCard({ icon: Icon, label, value, description, highlight, variant }: MetricCardProps) {
  const base = "rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  const palette = highlight
    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
    : variant === "warning"
    ? "border-amber-200 bg-amber-50/60"
    : variant === "info"
    ? "border-sky-200 bg-sky-50/60"
    : "border-slate-200 bg-white";

  return (
    <article className={`${base} ${palette}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-full bg-slate-900/10 p-2 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </article>
  );
}

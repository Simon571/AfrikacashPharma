"use client";
import React, { useEffect, useState } from "react";

type Subscription = {
  id: string;
  clientId: string;
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
  billingCycle?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  notes?: string;
  client?: { name: string };
  payments?: { amount: number; status: string; paidAt?: string }[];
};

type Client = { id: string; name: string };

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const res = await fetch("/api/admin/subscriptions", { credentials: "include" });
  const data = await res.json();
  return data.subscriptions || [];
};

const fetchClients = async (): Promise<Client[]> => {
  const res = await fetch("/api/admin/clients", { credentials: "include" });
  const data = await res.json();
  return data.clients || [];
};

const addSubscription = async (sub: Partial<Subscription>) => {
  const res = await fetch("/api/admin/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
    credentials: "include",
  });
  return res.ok;
};

const updateSubscriptionStatus = async (id: string, status: string) => {
  const res = await fetch(`/api/admin/subscriptions/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  return res.ok;
};

const deleteSubscription = async (id: string) => {
  const res = await fetch(`/api/admin/subscriptions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.ok;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Subscription>>({});
  const [notif, setNotif] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchSubscriptions().then((data) => {
      setSubscriptions(data);
      setLoading(false);
    });
    fetchClients().then(setClients);
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    const ok = await addSubscription(form);
    setNotif(ok ? "Abonnement ajouté" : "Erreur lors de l'ajout");
    setShowModal(false);
    setForm({});
    fetchSubscriptions().then((data) => {
      setSubscriptions(data);
      setLoading(false);
    });
  };

  const handleStatus = async (id: string, status: string) => {
    setLoading(true);
    const ok = await updateSubscriptionStatus(id, status);
    setNotif(ok ? "Statut mis à jour" : "Erreur lors de la mise à jour");
    fetchSubscriptions().then((data) => {
      setSubscriptions(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const ok = await deleteSubscription(id);
    setNotif(ok ? "Abonnement supprimé" : "Erreur lors de la suppression");
    fetchSubscriptions().then((data) => {
      setSubscriptions(data);
      setLoading(false);
    });
  };

  const filteredSubscriptions = subscriptions.filter(
    (s) =>
      s.client?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      s.plan?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des abonnements</h1>
      <div className="flex items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Filtrer par client ou plan..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Ajouter un abonnement
        </button>
      </div>
      {notif && (
        <div className="mb-2 text-green-700 font-semibold">{notif}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Début</th>
              <th className="px-3 py-2">Fin</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-4">Chargement...</td></tr>
            ) : filteredSubscriptions.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-4">Aucun abonnement</td></tr>
            ) : (
              filteredSubscriptions.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-3 py-2">{s.client?.name || "-"}</td>
                  <td className="px-3 py-2">{s.plan}</td>
                  <td className="px-3 py-2">{s.amount} {s.currency}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{s.startDate?.slice(0, 10) || "-"}</td>
                  <td className="px-3 py-2">{s.endDate?.slice(0, 10) || "-"}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => handleStatus(s.id, "EXPIRED")}
                    >Expirer</button>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => handleStatus(s.id, "ACTIVE")}
                    >Activer</button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(s.id)}
                    >Supprimer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter un abonnement</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex flex-col gap-2"
            >
              <select
                value={form.clientId || ""}
                onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                required
                className="border px-2 py-1 rounded"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Plan (mensuel, annuel...)"
                value={form.plan || ""}
                onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                required
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Montant"
                value={form.amount || ""}
                onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                required
                className="border px-2 py-1 rounded"
              />
              <input
                type="text"
                placeholder="Devise (EUR, USD...)"
                value={form.currency || ""}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
              <input
                type="date"
                placeholder="Date de début"
                value={form.startDate || ""}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
              <input
                type="date"
                placeholder="Date de fin"
                value={form.endDate || ""}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
              <input
                type="text"
                placeholder="Cycle de facturation (mensuel, annuel...)"
                value={form.billingCycle || ""}
                onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
              <input
                type="text"
                placeholder="Méthode de paiement"
                value={form.paymentMethod || ""}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
              <textarea
                placeholder="Notes"
                value={form.notes || ""}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="border px-2 py-1 rounded"
              />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

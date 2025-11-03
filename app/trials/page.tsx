"use client";
import React, { useEffect, useState } from "react";

type Trial = {
  id: string;
  userId: string;
  trialDuration: number;
  remainingDays: number;
  extensionsGranted: number;
  maxExtensions: number;
  isBlocked: boolean;
  blockReason?: string;
  user?: { username: string };
};

const fetchTrials = async (): Promise<Trial[]> => {
  const res = await fetch("/api/admin/trials", { credentials: "include" });
  const data = await res.json();
  return data.trials || [];
};

const extendTrial = async (id: string) => {
  const res = await fetch(`/api/admin/trials/${id}/extend`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
};

const blockTrial = async (id: string, reason: string) => {
  const res = await fetch(`/api/admin/trials/${id}/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
    credentials: "include",
  });
  return res.ok;
};

const updateTrial = async (id: string, data: Partial<Trial>) => {
  const res = await fetch(`/api/admin/trials`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data }),
    credentials: "include",
  });
  return res.ok;
};

export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [blockReason, setBlockReason] = useState<string>("");
  const [blockId, setBlockId] = useState<string>("");

  useEffect(() => {
    fetchTrials().then((data) => {
      setTrials(data);
      setLoading(false);
    });
  }, []);

  const handleExtend = async (id: string) => {
    setLoading(true);
    const ok = await extendTrial(id);
    setNotif(ok ? "Essai prolongé de 7 jours" : "Erreur lors de la prolongation");
    fetchTrials().then((data) => {
      setTrials(data);
      setLoading(false);
    });
  };

  const handleBlock = async () => {
    if (!blockId) return;
    setLoading(true);
    const ok = await blockTrial(blockId, blockReason);
    setNotif(ok ? "Essai bloqué" : "Erreur lors du blocage");
    setBlockId("");
    setBlockReason("");
    fetchTrials().then((data) => {
      setTrials(data);
      setLoading(false);
    });
  };

  const filteredTrials = trials.filter(
    (t) =>
      t.user?.username?.toLowerCase().includes(filter.toLowerCase()) ||
      t.remainingDays.toString().includes(filter)
  );

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des périodes d’essai</h1>
      <div className="flex items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Filtrer par utilisateur ou jours restants..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
      </div>
      {notif && (
        <div className="mb-2 text-green-700 font-semibold">{notif}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Utilisateur</th>
              <th className="px-3 py-2">Jours restants</th>
              <th className="px-3 py-2">Extensions</th>
              <th className="px-3 py-2">Blocage</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Chargement...</td></tr>
            ) : filteredTrials.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-4">Aucun essai</td></tr>
            ) : (
              filteredTrials.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="px-3 py-2">{t.user?.username || "-"}</td>
                  <td className="px-3 py-2">{t.remainingDays}</td>
                  <td className="px-3 py-2">{t.extensionsGranted} / {t.maxExtensions}</td>
                  <td className="px-3 py-2">{t.isBlocked ? `Oui (${t.blockReason})` : "Non"}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => handleExtend(t.id)}
                      disabled={t.extensionsGranted >= t.maxExtensions || t.isBlocked}
                    >Prolonger</button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => { setBlockId(t.id); }}
                      disabled={t.isBlocked}
                    >Bloquer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal blocage */}
      {blockId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bloquer la période d’essai</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleBlock();
              }}
              className="flex flex-col gap-2"
            >
              <input
                type="text"
                placeholder="Raison du blocage"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                required
                className="border px-2 py-1 rounded"
              />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Bloquer</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setBlockId(""); setBlockReason(""); }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

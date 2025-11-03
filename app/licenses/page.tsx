"use client";
import React, { useEffect, useState } from "react";

type License = {
  id: string;
  key: string;
  status: string;
  issuedAt: string;
  activatedAt?: string;
  expiresAt?: string;
  assignedBy?: string;
  client?: { id: string; name: string };
};

type Client = { id: string; name: string };

const fetchLicenses = async (): Promise<License[]> => {
  const res = await fetch("/api/admin/licenses", { credentials: "include" });
  if (!res.ok) {
    console.error("Failed to fetch licenses:", res.status, res.statusText);
    return []; // Retourne un tableau vide en cas d'erreur
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : { licenses: [] };
  return data.licenses || [];
};

const fetchClients = async (): Promise<Client[]> => {
  const res = await fetch("/api/admin/clients", { credentials: "include" });
  if (!res.ok) {
    console.error("Failed to fetch clients:", res.status, res.statusText);
    return []; // Retourne un tableau vide en cas d'erreur
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : { clients: [] };
  return data.clients || [];
};

const addLicense = async (clientId: string) => {
  const res = await fetch("/api/admin/licenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
    credentials: "include",
  });
  return res.ok;
};

const updateLicenseStatus = async (id: string, status: string) => {
  const res = await fetch(`/api/admin/licenses/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  return res.ok;
};

const deleteLicense = async (id: string) => {
  const res = await fetch(`/api/admin/licenses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.ok;
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [notif, setNotif] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchLicenses().then((data) => {
      setLicenses(data);
      setLoading(false);
    });
    fetchClients().then(setClients);
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    const ok = await addLicense(selectedClient);
    setNotif(ok ? "Licence générée et attribuée" : "Erreur lors de l'attribution");
    setShowModal(false);
    setSelectedClient("");
    fetchLicenses().then((data) => {
      setLicenses(data);
      setLoading(false);
    });
  };

  const handleStatus = async (id: string, status: string) => {
    setLoading(true);
    const ok = await updateLicenseStatus(id, status);
    setNotif(ok ? "Statut mis à jour" : "Erreur lors de la mise à jour");
    fetchLicenses().then((data) => {
      setLicenses(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const ok = await deleteLicense(id);
    setNotif(ok ? "Licence supprimée" : "Erreur lors de la suppression");
    fetchLicenses().then((data) => {
      setLicenses(data);
      setLoading(false);
    });
  };

  const filteredLicenses = licenses.filter(
    (l) =>
      l.key?.toLowerCase().includes(filter.toLowerCase()) ||
      l.client?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des licences</h1>
      <div className="flex items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Filtrer par clé ou client..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Générer une licence
        </button>
      </div>
      {notif && (
        <div className="mb-2 text-green-700 font-semibold">{notif}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Clé</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Attribuée le</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Chargement...</td></tr>
            ) : filteredLicenses.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-4">Aucune licence</td></tr>
            ) : (
              filteredLicenses.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="px-3 py-2 font-mono">{l.key}</td>
                  <td className="px-3 py-2">{l.client?.name || "-"}</td>
                  <td className="px-3 py-2">{l.status}</td>
                  <td className="px-3 py-2">{l.issuedAt?.slice(0, 10)}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => handleStatus(l.id, "SUSPENDED")}
                    >Suspendre</button>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => handleStatus(l.id, "ACTIVE")}
                    >Activer</button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(l.id)}
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
            <h2 className="text-xl font-bold mb-4">Générer et attribuer une licence</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex flex-col gap-2"
            >
              <select
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
                required
                className="border px-2 py-1 rounded"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Générer</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";
import React, { useEffect, useState } from "react";

const fetchAudit = async () => {
  const res = await fetch("/api/admin/audit", { credentials: "include" });
  return await res.json();
};

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudit().then((d) => {
      setLogs(d.logs || []);
      setLoading(false);
    });
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Historique des actions</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="min-w-full border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Utilisateur</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Modèle</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ancien</th>
              <th className="px-3 py-2">Nouveau</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-4">Aucune action</td></tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2">{log.user?.username || '-'}</td>
                  <td className="px-3 py-2">{log.action}</td>
                  <td className="px-3 py-2">{log.model}</td>
                  <td className="px-3 py-2">{log.recordId}</td>
                  <td className="px-3 py-2">{log.oldValue || '-'}</td>
                  <td className="px-3 py-2">{log.newValue || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}

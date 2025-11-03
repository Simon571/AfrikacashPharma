'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Users, DollarSign, Building2, TrendingUp } from 'lucide-react';
import { ExchangeRateManager } from '@/components/ExchangeRateManager';

interface Subscription {
  planType: 'trial' | 'monthly' | 'quarterly' | 'annual' | 'lifetime';
  amount: number;
}

interface Instance {
  id: string;
  name: string;
  subdomain: string;
  ownerEmail: string;
  ownerName?: string;
  status: 'active' | 'suspended' | 'pending' | 'deleted';
  subscription?: Subscription;
  activeUsers?: number;
  monthlyRevenue?: number;
  totalOrders?: number;
  createdAt: string;
}

interface DashboardStats {
  totalInstances: number;
  activeInstances: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInstances: 0,
    activeInstances: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    ownerEmail: '',
    ownerName: '',
    planType: 'trial' as const,
  });

  useEffect(() => {
    loadInstances();
  }, [filterStatus]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await fetch(`/api/admin/instances${query}`);
      const data = await response.json();
      
      setInstances(data.instances || []);
      
      const total = data.instances?.length || 0;
      const active = data.instances?.filter((i: Instance) => i.status === 'active').length || 0;
      const users = data.instances?.reduce((sum: number, i: Instance) => sum + (i.activeUsers || 0), 0) || 0;
      const revenue = data.instances?.reduce((sum: number, i: Instance) => sum + (i.monthlyRevenue || 0), 0) || 0;
      
      setStats({
        totalInstances: total,
        activeInstances: active,
        totalUsers: users,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('Instance créée:', responseData);
        setFormData({
          name: '',
          subdomain: '',
          ownerEmail: '',
          ownerName: '',
          planType: 'trial',
        });
        setShowCreateModal(false);
        // Recharger les instances
        setTimeout(() => loadInstances(), 500);
        alert('Instance créée avec succès!');
      } else {
        console.error('Erreur API:', responseData);
        alert('Erreur: ' + (responseData.error || 'Impossible de créer l\'instance'));
      }
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur réseau: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await fetch(`/api/admin/instances/${id}/suspend`, { method: 'POST' });
      loadInstances();
    } catch (error) {
      console.error('Erreur suspend:', error);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await fetch(`/api/admin/instances/${id}/reactivate`, { method: 'POST' });
      loadInstances();
    } catch (error) {
      console.error('Erreur réactivation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de supprimer cette instance?')) {
      try {
        await fetch(`/api/admin/instances/${id}`, { method: 'DELETE' });
        loadInstances();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const getPlanLabel = (plan: string) => {
    const labels: { [key: string]: string } = {
      trial: 'Trial',
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      annual: 'Annuel',
      lifetime: 'Illimité',
    };
    return labels[plan] || plan;
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-gray-100 text-gray-800',
    };
    const labels: { [key: string]: string } = {
      active: 'Actif',
      suspended: 'Suspendu',
      pending: 'En attente',
      deleted: 'Supprimé',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tableau de Bord Admin</h1>
          <p className="text-indigo-100">Gestion des instances et performances</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Instances</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalInstances}</p>
              </div>
              <Building2 className="w-12 h-12 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Actives</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeInstances}</p>
              </div>
              <RefreshCw className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Utilisateurs</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenu Mensuel</p>
                <p className="text-3xl font-bold text-purple-600">€ {stats.totalRevenue.toLocaleString('fr-FR')}</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Card Taux de Change */}
        <div className="bg-white rounded-lg p-4 shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gestion du Taux USD→CDF</h2>
                <p className="text-sm text-gray-500">Mettez à jour le taux de change et les prix</p>
              </div>
            </div>
            <button
              onClick={() => setShowExchangeRateModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Ouvrir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-lg mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilterStatus('suspended')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'suspended'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Suspendues
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Instance
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : instances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucune instance trouvée</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Propriétaire</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Utilisateurs</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Revenu Mensuel</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Commandes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((instance) => (
                    <tr key={instance.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{instance.name}</p>
                          <p className="text-sm text-gray-500">{instance.subdomain}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{instance.ownerName || instance.ownerEmail}</p>
                          <p className="text-sm text-gray-500">{instance.ownerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {instance.subscription ? getPlanLabel(instance.subscription.planType) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(instance.status)}</td>
                      <td className="px-6 py-4 text-gray-900">{instance.activeUsers || 0}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        € {(instance.monthlyRevenue || 0).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{instance.totalOrders || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {instance.status === 'active' && (
                            <button
                              onClick={() => handleSuspend(instance.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                            >
                              Suspendre
                            </button>
                          )}
                          {instance.status === 'suspended' && (
                            <button
                              onClick={() => handleReactivate(instance.id)}
                              className="text-green-600 hover:text-green-800 font-medium text-sm transition"
                            >
                              Réactiver
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(instance.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                          >
                            <Trash2 className="w-4 h-4 inline" /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une Instance</h2>
              <form onSubmit={handleCreateInstance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Mon Magasin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sous-domaine</label>
                  <input
                    type="text"
                    required
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="monmagasin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Propriétaire</label>
                  <input
                    type="email"
                    required
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="owner@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom Propriétaire</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="trial">Trial</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="annual">Annuel</option>
                    <option value="lifetime">Illimité</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                      </>
                    ) : (
                      'Créer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Taux de Change */}
        {showExchangeRateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Gestion du Taux USD→CDF</h2>
                <button
                  onClick={() => setShowExchangeRateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <ExchangeRateManager />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

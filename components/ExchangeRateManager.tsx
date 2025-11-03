'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface ExchangeRateData {
  id: string;
  rate: number;
  currency?: string;
  updatedAt?: Date | string;
}

export function ExchangeRateManager() {
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [newRate, setNewRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [medicationsAffected, setMedicationsAffected] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger le taux actuel au montage
  useEffect(() => {
    loadCurrentRate();
  }, []);

  const loadCurrentRate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exchange-rate');
      if (!response.ok) throw new Error('Impossible de charger le taux');
      const data = (await response.json()) as ExchangeRateData;
      setCurrentRate(data.rate);
      setNewRate(data.rate.toString());
      if (data.updatedAt) {
        setLastUpdate(new Date(data.updatedAt));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Impossible de charger le taux' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = async () => {
    try {
      const parsedRate = parseFloat(newRate);
      if (!parsedRate || parsedRate <= 0) {
        setMessage({ type: 'error', text: 'Le taux doit être un nombre positif' });
        return;
      }

      setUpdating(true);
      const response = await fetch('/api/exchange-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: parsedRate })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      
      if ((result as any).medicationsUpdated) {
        setMedicationsAffected((result as any).medicationsUpdated);
        setCurrentRate(parsedRate);
        setLastUpdate(new Date());
        setMessage({
          type: 'success',
          text: `Taux mis à jour! ${(result as any).medicationsUpdated} médicaments recalculés`,
        });
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
    } finally {
      setUpdating(false);
    }
  };

  const rateChange = currentRate && parseFloat(newRate) ? parseFloat(newRate) - currentRate : 0;
  const percentageChange =
    currentRate && rateChange !== 0 ? ((rateChange / currentRate) * 100).toFixed(2) : '0';

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Taux de Change USD → CDF
        </h2>
        <p className="text-gray-600">
          Gérez le taux de change pour la conversion automatique des prix
        </p>
      </div>

      {/* Taux actuel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Taux Actuel</p>
          <p className="text-3xl font-bold text-blue-900">
            {currentRate?.toLocaleString()} CDF
          </p>
          <p className="text-xs text-blue-500 mt-2">1 USD</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 mb-1">Médicaments Affectés</p>
          <p className="text-3xl font-bold text-green-900">{medicationsAffected}</p>
          <p className="text-xs text-green-500 mt-2">Convertis avec ce taux</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 mb-1">Dernière Mise à Jour</p>
          <p className="text-sm font-mono text-purple-900">
            {lastUpdate?.toLocaleDateString('fr-FR')}
          </p>
          <p className="text-xs text-purple-500 mt-2">
            {lastUpdate?.toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Formulaire de mise à jour */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <div>
          <label htmlFor="newRate" className="block text-sm font-medium mb-2">
            Nouveau Taux (CDF/USD)
          </label>
          <div className="flex gap-2">
            <input
              id="newRate"
              type="number"
              step="0.01"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Entrez le nouveau taux"
              disabled={updating}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleUpdateRate}
              disabled={updating || !newRate}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Mettre à Jour
            </button>
          </div>
        </div>

        {/* Aperçu du changement */}
        {rateChange !== 0 && (
          <div className="flex items-center gap-2 text-sm">
            {rateChange > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  +{rateChange.toFixed(2)} CDF ({percentageChange}%)
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-red-600">
                  {rateChange.toFixed(2)} CDF ({percentageChange}%)
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={message.type === 'success' ? 'bg-green-50 border border-green-200 p-4 rounded-lg' : 'bg-red-50 border border-red-200 p-4 rounded-lg'}>
          <div className="flex items-center gap-2">
            <AlertCircle className={message.type === 'success' ? 'h-4 w-4 text-green-600' : 'h-4 w-4 text-red-600'} />
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Info:</strong> Quand vous mettez à jour le taux, tous les prix en CDF des produits
          seront recalculés automatiquement en fonction de leurs prix USD de référence.
        </p>
      </div>
    </div>
  );
}

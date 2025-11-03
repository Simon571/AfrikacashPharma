import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface MedicationPriceDisplayProps {
  medicationId: string;
  name: string;
  priceUsd: number;
  priceCdf: number;
  purchasePriceUsd?: number;
  purchasePriceCdf?: number;
}

export function MedicationPriceDisplay({
  medicationId,
  name,
  priceUsd,
  priceCdf,
  purchasePriceUsd,
  purchasePriceCdf,
}: MedicationPriceDisplayProps) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const response = await fetch('/api/exchange-rate');
        if (!response.ok) throw new Error('Impossible de charger le taux');
        const data = (await response.json()) as any;
        setExchangeRate(data.rate);
      } catch (error) {
        console.error('Error loading exchange rate:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRate();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  const calculatedCdfPrice = exchangeRate ? Math.round(priceUsd * exchangeRate * 100) / 100 : priceCdf;
  const calculatedPurchaseCdfPrice =
    exchangeRate && purchasePriceUsd
      ? Math.round(purchasePriceUsd * exchangeRate * 100) / 100
      : purchasePriceCdf;

  return (
    <div className="space-y-3">
      {/* Prix de vente */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-600 mb-1">Prix USD</p>
          <p className="text-lg font-semibold text-blue-900">
            ${priceUsd?.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600 mb-1">Prix CDF</p>
          <p className="text-lg font-semibold text-green-900">
            {calculatedCdfPrice?.toLocaleString()} CDF
          </p>
        </div>
      </div>

      {/* Prix d'achat si disponible */}
      {purchasePriceUsd && purchasePriceCdf && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-600 mb-1">Achat USD</p>
            <p className="text-lg font-semibold text-purple-900">
              ${purchasePriceUsd?.toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-600 mb-1">Achat CDF</p>
            <p className="text-lg font-semibold text-orange-900">
              {calculatedPurchaseCdfPrice?.toLocaleString()} CDF
            </p>
          </div>
        </div>
      )}

      {/* Info taux */}
      {exchangeRate && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
          <p>
            <strong>Taux appliqué:</strong> {exchangeRate.toLocaleString()} CDF/USD
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Minus, AlertCircle, ArrowLeft } from 'lucide-react';

interface Movement {
  id: string;
  type: 'ENTRY' | 'EXIT' | 'CORRECTION';
  quantity: number;
  reason?: string;
  createdAt: string;
  medicationId: string;
  userId?: string;
  medication?: {
    id: string;
    name: string;
    pharmaceuticalForm: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

function getMovementInfo(type: 'ENTRY' | 'EXIT' | 'CORRECTION') {
  switch (type) {
    case 'ENTRY':
      return {
        title: 'Quantité Ajouter',
        description: 'Tous les ajouts en stock (venant de la page Mouvement de stock)',
        icon: Plus,
        color: 'bg-green-100 text-green-800',
        textColor: 'text-green-700',
      };
    case 'EXIT':
      return {
        title: 'Qtté Sortie',
        description: 'Toutes les sorties/ventes (venant de la page Vente)',
        icon: Minus,
        color: 'bg-orange-100 text-orange-800',
        textColor: 'text-orange-700',
      };
    case 'CORRECTION':
      return {
        title: 'Qtté Abimée',
        description: 'Toutes les corrections (venant de la page Stock)',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800',
        textColor: 'text-red-700',
      };
  }
}

export default function MovementsPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') || 'ENTRY') as 'ENTRY' | 'EXIT' | 'CORRECTION';
  
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'medication' | 'quantity'>('date');

  const info = getMovementInfo(type);
  const IconComponent = info.icon;

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await fetch(`/api/medications/movements?type=${type}`);
        const data = await response.json();
        setMovements(data);
      } catch (error) {
        console.error('Erreur lors du chargement des mouvements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, [type]);

  const sortedMovements = [...movements].sort((a, b) => {
    switch (sortBy) {
      case 'medication':
        return (a.medication?.name || '').localeCompare(b.medication?.name || '');
      case 'quantity':
        return b.quantity - a.quantity;
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const stats = {
    total: movements.length,
    totalQuantity: movements.reduce((sum, m) => sum + m.quantity, 0),
    averageQuantity: movements.length > 0 ? (movements.reduce((sum, m) => sum + m.quantity, 0) / movements.length).toFixed(2) : '0',
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/admin/inventory">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'inventaire
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className={`h-6 w-6 ${info.textColor}`} />
              {info.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">{info.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${info.color}`}>
                <div className="text-sm font-medium">Total d'entrées</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className={`p-4 rounded-lg ${info.color}`}>
                <div className="text-sm font-medium">Quantité totale</div>
                <div className="text-2xl font-bold">{stats.totalQuantity}</div>
              </div>
              <div className={`p-4 rounded-lg ${info.color}`}>
                <div className="text-sm font-medium">Quantité moyenne</div>
                <div className="text-2xl font-bold">{stats.averageQuantity}</div>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <Button 
                variant={sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('date')}
              >
                Trier par date
              </Button>
              <Button 
                variant={sortBy === 'medication' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('medication')}
              >
                Trier par médicament
              </Button>
              <Button 
                variant={sortBy === 'quantity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('quantity')}
              >
                Trier par quantité
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Produit</th>
                    <th className="text-left py-2 px-4">Forme</th>
                    <th className="text-right py-2 px-4">Quantité</th>
                    <th className="text-left py-2 px-4">Utilisateur</th>
                    <th className="text-left py-2 px-4">Raison</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMovements.map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-600">
                        {new Date(movement.createdAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(movement.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-4 font-medium">{movement.medication?.name}</td>
                      <td className="py-2 px-4 text-gray-600">{movement.medication?.pharmaceuticalForm}</td>
                      <td className="py-2 px-4 text-right font-semibold">{movement.quantity}</td>
                      <td className="py-2 px-4 text-gray-600">{movement.user?.name || '-'}</td>
                      <td className="py-2 px-4 text-gray-600">{movement.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedMovements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun mouvement de stock pour le moment
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/nextauth-config';
import { getExchangeRate, updateExchangeRate } from '@/lib/actions/exchange-rate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const rate = await getExchangeRate();
      return res.status(200).json(rate);
    } catch (error) {
      console.error('Erreur lors de la récupération du taux de change:', error);
      return res.status(500).json({ message: 'Impossible de récupérer le taux de change.' });
    }
  }

  if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    try {
      const { rate } = req.body;
      const parsedRate = Number(rate);

      if (!parsedRate || parsedRate <= 0) {
        return res.status(400).json({ message: 'Le taux doit être un nombre positif.' });
      }

      const updated = await updateExchangeRate(parsedRate, (session.user as any)?.id || 'system');
      return res.status(200).json(updated);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du taux de change:', error);
      return res.status(500).json({ message: 'Impossible de mettre à jour le taux de change.' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée.' });
}

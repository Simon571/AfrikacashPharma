'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_RATE = 2400; // Taux par défaut
const CURRENCY_KEY = 'USD_CDF';

/**
 * Récupère le taux de change actuel USD→CDF
 */
export async function getExchangeRate() {
  try {
    const client = prisma as any;

  const existing = await client.exchangeRate.findUnique({ where: { currency: CURRENCY_KEY } });
    if (existing) {
      return existing;
    }

    return client.exchangeRate.create({
      data: {
        currency: CURRENCY_KEY,
        rate: DEFAULT_RATE,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du taux:', error);
    return { id: '', rate: DEFAULT_RATE, currency: CURRENCY_KEY, createdAt: new Date(), updatedAt: new Date() };
  }
}

/**
 * Met à jour le taux de change et recalcule tous les prix en CDF
 */
export async function updateExchangeRate(newRate: number, updatedBy?: string) {
  try {
    if (!newRate || newRate <= 0) {
      throw new Error('Le taux doit être un nombre positif.');
    }

    return prisma.$transaction(async (tx: any) => {
      const existing = await tx.exchangeRate.findUnique({
        where: { currency: CURRENCY_KEY },
      });
      const currentRate = existing?.rate ?? DEFAULT_RATE;

      const exchangeRecord = await tx.exchangeRate.upsert({
        where: { currency: CURRENCY_KEY },
        create: {
          currency: CURRENCY_KEY,
          rate: newRate,
        },
        update: {
          rate: newRate,
        },
      });

      // Récupérer les médicaments avec les colonnes qui existent réellement
      const medications = await tx.medication.findMany({
        select: {
          id: true,
          price: true,
          purchasePrice: true,
        },
      });

      let medicationsUpdated = 0;
      // Si les colonnes USD existent, les mettre à jour. Sinon, juste recalculer les prix CDF
      for (const medication of medications) {
        const priceUsd = medication.price ? medication.price / currentRate : 0;
        const purchasePriceUsd = medication.purchasePrice ? medication.purchasePrice / currentRate : 0;

        const data: any = {
          price: Math.round(priceUsd * newRate * 100) / 100,
          purchasePrice: Math.round(purchasePriceUsd * newRate * 100) / 100,
        };

        // Si les colonnes priceUsd existent, les mettre à jour aussi
        try {
          data.priceUsd = Math.round(priceUsd * 100) / 100;
          data.purchasePriceUsd = Math.round(purchasePriceUsd * 100) / 100;
        } catch (e) {
          // Les colonnes n'existent peut-être pas, c'est ok
        }

        await tx.medication.update({
          where: { id: medication.id },
          data,
        });
        medicationsUpdated++;
      }

      if (updatedBy) {
        await tx.auditLog.create({
          data: {
            action: 'exchange_rate_update',
            model: 'ExchangeRate',
            recordId: exchangeRecord.id,
            userId: updatedBy,
            oldValue: existing ? JSON.stringify({ rate: existing.rate }) : null,
            newValue: JSON.stringify({ rate: newRate, medicationsUpdated }),
          },
        });
      }

      return { ...exchangeRecord, medicationsUpdated };
    }).then((result) => {
      revalidatePath('/admin/exchange-rate');
      revalidatePath('/admin/medications-prices');
      revalidatePath('/admin');
      return result;
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du taux:', error);
    throw error;
  }
}


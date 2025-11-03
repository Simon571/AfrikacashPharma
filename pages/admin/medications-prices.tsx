import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/nextauth-config';
import { MedicationPriceDisplay } from '@/components/MedicationPriceDisplay';
import { prisma } from '@/lib/prisma';
import Head from 'next/head';
import { Loader2 } from 'lucide-react';

interface MedicationsPricesPageProps {
  medications: Array<{
    id: string;
    name: string;
    price: number | null;
    purchasePrice: number | null;
  }>;
  exchangeRate: number;
}

export default function MedicationsPricesPage({ medications, exchangeRate }: MedicationsPricesPageProps) {
  if (!medications) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Prix des Médicaments | AfrikaPharma</title>
      </Head>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prix des Médicaments</h1>
            <p className="text-gray-600">
              Visualisez les prix en USD et CDF pour tous les médicaments
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Taux actuel:</strong> 1 USD = {exchangeRate.toLocaleString()} CDF
              </p>
            </div>
          </div>

          {/* Liste des médicaments */}
          {medications.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-500">Aucun médicament disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((medication) => (
                <div key={medication.id} className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {medication.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Prix CDF</p>
                      <p className="text-lg font-semibold text-green-900">
                        {medication.price?.toLocaleString()} CDF
                      </p>
                    </div>
                    {medication.purchasePrice && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs text-orange-600 mb-1">Achat CDF</p>
                        <p className="text-lg font-semibold text-orange-900">
                          {medication.purchasePrice?.toLocaleString()} CDF
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<MedicationsPricesPageProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Rediriger si non authentifié
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Vérifier le rôle admin
  if ((session.user as any)?.role !== 'admin') {
    return {
      notFound: true,
    };
  }

  try {
    // Récupérer le taux actuel
    let exchangeRate = 2800; // Valeur par défaut
    try {
      const rate = await (prisma as any).exchangeRate.findUnique({
        where: { currency: 'USD' },
      });
      if (rate) {
        exchangeRate = rate.rate;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du taux:', error);
    }

    // Récupérer les médicaments
    const medications = await prisma.medication.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        purchasePrice: true,
      },
      orderBy: { name: 'asc' },
      take: 100,
    });

    return {
      props: {
        medications,
        exchangeRate,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Erreur getServerSideProps:', error);
    return {
      props: {
        medications: [],
        exchangeRate: 2800,
      },
      revalidate: 60,
    };
  }
};


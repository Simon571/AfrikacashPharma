import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/nextauth-config';
import { ExchangeRateManager } from '@/components/ExchangeRateManager';
import Head from 'next/head';

export default function ExchangeRatePage() {
  return (
    <>
      <Head>
        <title>Gestion du Taux de Change | AfrikaPharma</title>
      </Head>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <ExchangeRateManager />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Rediriger si non authentifié
  if (!session) {
    return {
      redirect: {
        destination: `/login-admin?callbackUrl=${encodeURIComponent('/admin/exchange-rate')}`,
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

  return {
    props: {
      session,
    },
  };
};

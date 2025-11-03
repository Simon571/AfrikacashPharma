import './globals.css';
import { AuthProvider } from './providers';

export const metadata = {
  title: 'PharmaSuite - Solution de Gestion de Pharmacie',
  description: 'Plateforme générique et personnalisable pour la gestion de pharmacies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-slate-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
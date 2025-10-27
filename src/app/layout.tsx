import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { PWAInstaller } from "@/components/pwa-installer";

import { ConditionalHeader } from "@/components/layout/conditional-header";
import ProgressBar from "@/components/ProgressBar";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AFRIKA PHARMA",
  description: "Système de gestion de pharmacie moderne pour l'Afrique",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-72.png", sizes: "72x72", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-384.png", sizes: "384x384", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-57.png", sizes: "57x57", type: "image/png" },
      { url: "/apple-touch-icon-60.png", sizes: "60x60", type: "image/png" },
      { url: "/apple-touch-icon-72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-touch-icon-76.png", sizes: "76x76", type: "image/png" },
      { url: "/apple-touch-icon-114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-touch-icon-120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AFRIKA PHARMA",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/icon-144.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <Suspense>
              <ProgressBar />
            </Suspense>
            <ConditionalHeader />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <PWAInstaller />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}


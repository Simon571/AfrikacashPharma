'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import React from 'react';

interface Props {
  children: React.ReactNode;
  session?: any;
}

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}

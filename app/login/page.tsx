import React, { Suspense } from 'react';
import LoginContent from './login-content';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginContent />
    </Suspense>
  );
}

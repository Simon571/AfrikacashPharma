'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './Login.module.css';

export default function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError('Nom d\'utilisateur ou mot de passe invalide');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Soumettre le formulaire directement à NextAuth (form-based)
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('callbackUrl', '/dashboard');

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError('Nom d\'utilisateur ou mot de passe invalide');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erreur de connexion');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    // Pour le moment, juste un alert
    alert('Fonctionnalité "Mot de passe oublié" à implémenter');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Connexion Admin</h1>
          <p className={styles.subtitle}>Accédez à votre espace d'administration</p>
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert" aria-live="polite">
            <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
              autoComplete="username"
              aria-describedby={error ? "error-message" : undefined}
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
                aria-describedby={error ? "error-message" : undefined}
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={0}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !username || !password}
            aria-describedby="submit-description"
          >
            {isLoading && <span className={styles.loadingSpinner} aria-hidden="true"></span>}
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
          <div id="submit-description" className="sr-only">
            Cliquez pour vous connecter avec vos identifiants
          </div>
        </form>

        <div className={styles.backLink}>
          <Link href="/">
            <span>← Retour à l'accueil</span>
          </Link>
        </div>

        <div className={styles.forgotPassword}>
          <a
            href="#"
            className={styles.forgotPasswordLink}
            onClick={handleForgotPassword}
            role="button"
            aria-label="Récupérer votre mot de passe oublié"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      {/* Styles pour screen readers */}
      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}

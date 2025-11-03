'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Settings, ShieldCheck, Pill, Zap, BarChart3, Lock, TrendingUp, ArrowRight, ChevronRight, Check } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgStyle: React.CSSProperties = {
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#000'
  };

  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: scrollY > 20 ? 'rgba(0,0,0,0.8)' : 'transparent',
    backdropFilter: scrollY > 20 ? 'blur(10px)' : 'none'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '0 16px'
  };

  const gradientText: React.CSSProperties = {
    background: 'linear-gradient(to right, #4ade80, #2dd4bf)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const featureCards = [
    {
      title: 'Multi-pharmacies',
      description: 'Gérez plusieurs pharmacies',
      href: '/dashboard',
      icon: Building2
    },
    {
      title: 'Gestion Equipe',
      description: 'Gérez utilisateurs et permissions',
      href: '/clients',
      icon: Users
    },
    {
      title: 'Personnalisable',
      description: 'Adaptez à vos besoins',
      href: '/setup',
      icon: Settings
    },
    {
      title: 'Analytics',
      description: 'Suivez les performances',
      href: '/dashboard',
      icon: BarChart3
    },
    {
      title: 'Securite',
      description: 'Authentification 2FA',
      href: '/totp',
      icon: Lock
    },
    {
      title: 'Performance',
      description: 'Infrastructure rapide',
      href: '/dashboard',
      icon: Zap
    }
  ];

  return (
    <div style={bgStyle}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -10, background: 'linear-gradient(to bottom, #0f172a 0%, #0f172a 50%, #000 100%)' }} />

      <header style={headerStyle}>
        <div style={{ ...containerStyle, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ height: '40px', width: '40px', borderRadius: '8px', background: 'linear-gradient(to br, #10b981, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill className="h-6 w-6" color="white" />
            </div>
            <div>
              <div style={{ ...gradientText, fontSize: '18px', fontWeight: 'bold' }}>PharmaSuite</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pharmacie moderne</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
            <Link href="/setup" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>Configuration</Link>
            <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
            <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>Tableau</Link>
          </nav>
        </div>
      </header>

      <section style={{ paddingTop: '80px', paddingBottom: '128px', textAlign: 'center' }}>
        <div style={containerStyle}>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', width: '80px', margin: '0 auto 32px', borderRadius: '24px', background: 'linear-gradient(to br, rgba(16,185,129,0.2), rgba(20,184,166,0.2))', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Pill className="h-10 w-10" color="#4ade80" />
          </div>
          
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', lineHeight: 1.2 }}>
            <span style={gradientText}>Plateforme de gestion</span>
            <br />
            <span style={{ color: '#e2e8f0' }}>pour pharmacies modernes</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '42rem', margin: '24px auto', lineHeight: 1.6 }}>
            Centralisez vos opérations, optimisez votre productivité
          </p>

          <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderRadius: '12px', background: 'linear-gradient(to right, #059669, #0d9488)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
              Commencer <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderRadius: '12px', border: '1px solid #475569', color: '#e2e8f0', fontWeight: 600, textDecoration: 'none' }}>
              <ShieldCheck className="h-5 w-5" /> Accès
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 16px' }}>
        <div style={containerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div style={{ background: 'linear-gradient(to br, rgba(30,41,59,0.5), rgba(15,23,42,0.5))', border: '1px solid #334155', borderRadius: '16px', padding: '32px' }}>
              <Building2 className="h-6 w-6" color="#4ade80" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4ade80', margin: '12px 0 8px' }}>500+</div>
              <div style={{ color: '#94a3b8' }}>Pharmacies</div>
            </div>
            <div style={{ background: 'linear-gradient(to br, rgba(30,41,59,0.5), rgba(15,23,42,0.5))', border: '1px solid #334155', borderRadius: '16px', padding: '32px' }}>
              <Users className="h-6 w-6" color="#4ade80" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4ade80', margin: '12px 0 8px' }}>10k+</div>
              <div style={{ color: '#94a3b8' }}>Utilisateurs</div>
            </div>
            <div style={{ background: 'linear-gradient(to br, rgba(30,41,59,0.5), rgba(15,23,42,0.5))', border: '1px solid #334155', borderRadius: '16px', padding: '32px' }}>
              <TrendingUp className="h-6 w-6" color="#4ade80" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4ade80', margin: '12px 0 8px' }}>99.9%</div>
              <div style={{ color: '#94a3b8' }}>Disponibilité</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 16px' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', ...gradientText, marginBottom: '64px', textAlign: 'center' }}>Fonctionnalités</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {featureCards.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    background: 'linear-gradient(to br, rgba(30,41,59,0.5), rgba(15,23,42,0.5))',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    padding: '32px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  <feature.icon className="h-8 w-8" color="#4ade80" />
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#e2e8f0', margin: '16px 0 12px' }}>{feature.title}</h3>
                  <p style={{ color: '#94a3b8' }}>{feature.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px', color: '#38bdf8', fontWeight: 500 }}>
                    Découvrir <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 16px', textAlign: 'center' }}>
        <div style={{ ...containerStyle, maxWidth: '56rem', background: 'linear-gradient(to right, rgba(16,185,129,0.1), rgba(20,184,166,0.1))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '24px', padding: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#e2e8f0' }}>Prêt à commencer ?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '18px' }}>Transformez votre pharmacie dès aujourd hui</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', borderRadius: '12px', background: 'linear-gradient(to right, #059669, #0d9488)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
              Démarrer <ChevronRight className="h-5 w-5" />
            </Link>
            <Link href="/login" style={{ padding: '16px 32px', borderRadius: '12px', border: '1px solid #475569', color: '#e2e8f0', fontWeight: 600, textDecoration: 'none' }}>
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #334155', background: 'linear-gradient(to b, rgba(15,23,42,0.5), #000)', padding: '64px 16px 32px' }}>
        <div style={containerStyle}>
          <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>© 2024 PharmaSuite. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

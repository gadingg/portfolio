'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => emailRef.current?.focus(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Belum bisa masuk. Coba lagi, ya.');
      router.replace('/admintgadink/dashboard');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Belum bisa masuk. Coba lagi, ya.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <p className="admin-kicker">Gading Admin</p>
      <h1 id="admin-login-title">Masuk CMS</h1>
      <p className="admin-login-intro">Login dulu, lalu lanjut rapikan portfolio kamu.</p>

      <form onSubmit={handleSubmit} className="admin-login-form">
        <label htmlFor="admin-email">Email</label>
        <input
          ref={emailRef}
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className="admin-form-error" role="alert">{error}</p>}

        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? 'Masuk dulu…' : 'Masuk CMS'}
        </button>
      </form>
    </section>
  );
}

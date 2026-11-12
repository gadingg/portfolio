'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (!response.ok) throw new Error(data.error || 'Belum bisa masuk. Coba lagi.');
      router.replace('/admintgadink/dashboard');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Belum bisa login. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <h1 id="admin-login-title">Masuk ke admin</h1>

      <form onSubmit={handleSubmit} className="admin-login-form" aria-busy={loading}>
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
        <div className="admin-password-field"><input
          id="admin-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        /><button type="button" className="admin-password-toggle" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} aria-controls="admin-password" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>
          {showPassword ? <EyeOff size={20} aria-hidden="true"/> : <Eye size={20} aria-hidden="true"/>}
        </button></div>

        {error && <p className="admin-form-error" role="alert">{error}</p>}

        <button type="submit" className="button button--primary admin-login-submit" disabled={loading}>
          {loading && <LoaderCircle className="admin-login-spinner" size={20} aria-hidden="true"/>}
          <span role="status">{loading ? 'SEDANG MASUK...' : 'MASUK'}</span>
        </button>
      </form>
    </section>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import { PinLoginForm } from '@/components/admin/PinLoginForm';

export const metadata: Metadata = {
  title: 'Admin Access | Gading Portfolio',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-hero)',
      }}
    >
      <PinLoginForm />
    </div>
  );
}

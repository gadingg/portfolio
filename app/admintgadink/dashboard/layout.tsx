import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { verifyAdminSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Gading Portfolio CMS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await verifyAdminSession())) redirect('/admintgadink');

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}

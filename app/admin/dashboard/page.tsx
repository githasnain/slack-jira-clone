'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main admin page
    router.replace('/admin');
  }, [router]);

  return null;
}
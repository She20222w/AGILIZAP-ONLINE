
import { AdminClient } from '@/components/admin-client';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserById } from '@/services/user-service';
import { cookies } from 'next/headers';

export default async function AdminPage() {
  // The client component will handle client-side auth checks.
  // This page is now protected by checking if the logged-in user has the 'reseller' status.
  return <AdminClient />;
}

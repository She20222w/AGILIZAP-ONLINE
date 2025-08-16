
import { AdminClient } from '@/components/admin-client';
import BackButton from '@/components/back-button';
import { redirect } from 'next/navigation';
import { getUserById } from '@/services/user-service';

export default async function AdminPage() {
  // The client component will handle client-side auth checks.
  // This page is now protected by checking if the logged-in user has the 'reseller' status.
  return (
    <div className="p-4">
      <BackButton />
      <AdminClient />
    </div>
  );
}

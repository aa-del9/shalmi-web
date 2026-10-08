import { Metadata } from 'next';
import { AdminWhatsappUnrecognized } from '@/modules/admin/admin-whatsapp-unrecognized';

export const metadata: Metadata = {
  title: 'Shalmi - Unrecognized WhatsApp messages',
  description:
    'Queue of inbound WhatsApp messages from phone numbers not yet onboarded.',
};

// Reads from the database via TanStack Query — keep dynamic.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <AdminWhatsappUnrecognized />;
}

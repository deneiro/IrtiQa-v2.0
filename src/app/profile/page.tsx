export const dynamic = 'force-dynamic';

import { ProfileView } from '@/views/profile'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Identity Profile | IrtiQa',
  description: 'Character intelligence and longitudinal activity history.',
}

export default function ProfilePage() {
  return <ProfileView />
}

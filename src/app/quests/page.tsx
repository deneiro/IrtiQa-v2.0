export const dynamic = 'force-dynamic';

import { QuestsPage } from '@/views/quests'

export const metadata = {
  title: 'Quests - Irtiqa',
  description: 'Manage your active expeditions and missions',
}

export default function Page() {
  return <QuestsPage />
}

export const dynamic = 'force-dynamic';

import { HallOfFameView } from '@/views/achievements/ui/HallOfFameView'

export const metadata = {
  title: 'Hall of Fame | IrtiQa v2.0',
  description: 'Track your legacy and milestones across all life domains.',
}

export default function AchievementsPage() {
  return <HallOfFameView />
}

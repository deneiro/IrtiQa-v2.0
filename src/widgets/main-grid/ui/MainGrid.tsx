import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { 
  Swords, 
  Sparkles, 
  BookOpenText, 
  Users, 
  Store, 
  Coins,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useDashboardSettingsStore } from '@/features/dashboard-settings'

const MENU_ITEMS = [
  { id: 'quests', title: 'Quests', icon: Swords, color: 'text-attribute-development', bg: 'bg-attribute-development/10', href: '/quests' },
  { id: 'habits', title: 'Habits', icon: Sparkles, color: 'text-attribute-health', bg: 'bg-attribute-health/10', href: '/habits' },
  { id: 'journal', title: 'Journal', icon: BookOpenText, color: 'text-attribute-spirituality', bg: 'bg-attribute-spirituality/10', href: '/journal' },
  { id: 'social', title: 'Social Hub', icon: Users, color: 'text-attribute-friends', bg: 'bg-attribute-friends/10', href: '/social' },
  { id: 'market', title: 'Market', icon: Store, color: 'text-attribute-brightness', bg: 'bg-attribute-brightness/10', href: '/market' },
  { id: 'finances', title: 'Finances', icon: Coins, color: 'text-attribute-money', bg: 'bg-attribute-money/10', href: '/finances' },
]

export function MainGrid() {
  const { mainGridColumns } = useDashboardSettingsStore()

  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[mainGridColumns] || 'md:grid-cols-2'

  return (
    <div className={cn("grid grid-cols-1 gap-6", gridColsClass)}>
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <Link href={item.href} key={item.id} className="outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl">
            <Card className="group cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-full">
              {/* Subtle glow effect on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.bg}`} />
              
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-display font-semibold tracking-tight">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 text-sm text-muted-foreground">
                 Click to open module.
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

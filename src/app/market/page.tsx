import { MarketView } from '@/views/market'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Black Market - Irtiqa',
  description: 'Buy power-ups and potions for your life RPG journey.',
}

export default function MarketPage() {
  return <MarketView />
}

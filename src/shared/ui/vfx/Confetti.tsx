"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface ParticleProps {
  color: string
}

function Particle({ color }: ParticleProps) {
  const angle = Math.random() * Math.PI * 2
  const velocity = Math.random() * 8 + 4
  const size = Math.random() * 6 + 4
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), [])

  return (
    <motion.div
      key={id}
      initial={{ 
        opacity: 1, 
        x: '50vw', 
        y: '50vh', 
        scale: 0,
        rotate: 0 
      }}
      animate={{ 
        opacity: [1, 1, 0],
        x: `calc(50vw + ${Math.cos(angle) * velocity * 50}px)`,
        y: `calc(50vh + ${Math.sin(angle) * velocity * 50}px)`,
        scale: [0, 1.5, 0.5],
        rotate: Math.random() * 360 * 2
      }}
      transition={{ 
        duration: 2 + Math.random() * 1.5,
        ease: "easeOut",
        times: [0, 0.7, 1]
      }}
      className="fixed pointer-events-none z-[2000] rounded-sm"
      style={{
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}`
      }}
    />
  )
}

interface ConfettiProps {
  count?: number
  colors?: string[]
}

export function Confetti({ 
  count = 60, 
  colors = ['#ec4899', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#6ef0ff'] 
}: ConfettiProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
  }, [count, colors])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1900]">
      {particles.map((p) => (
        <Particle key={p.id} color={p.color} />
      ))}
    </div>
  )
}

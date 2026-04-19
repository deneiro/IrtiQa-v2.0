"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface RadarData {
  key: string
  label: string
  value: number // 0 to 100
  color: string
}

interface RadarChartProps {
  data: RadarData[]
  size?: number
  className?: string
  showGrid?: boolean
  showLabels?: boolean
}

export function RadarChart({ 
  data, 
  size = 300, 
  className,
  showGrid = true,
  showLabels = true
}: RadarChartProps) {
  const center = size / 2
  const radius = (size / 2) * 0.7 // Leave space for labels
  const angleStep = (Math.PI * 2) / 8

  // Helper to get coordinates for a specific value on an axis
  const getCoords = (index: number, val: number, offset = 0) => {
    const angle = angleStep * index - Math.PI / 2 // Start from Top
    const dist = (val / 100) * radius + offset
    return {
      x: center + Math.cos(angle) * dist,
      y: center + Math.sin(angle) * dist
    }
  }

  // Generate grid lines
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1]
  const gridPaths = gridLevels.map(level => {
    return Array.from({ length: 9 }).map((_, i) => {
      const coords = getCoords(i % 8, level * 100)
      return `${i === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`
    }).join(' ')
  })

  // Generate axis lines
  const axisPaths = Array.from({ length: 8 }).map((_, i) => {
    const end = getCoords(i, 100)
    return `M ${center} ${center} L ${end.x} ${end.y}`
  })

  // Generate the main data polygon path
  const dataPath = data.map((d, i) => {
    const coords = getCoords(i, d.value)
    return `${i === 0 ? 'M' : 'L'} ${coords.x} ${coords.y}`
  }).join(' ') + ' Z'

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Definition for Gradients / Filters */}
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tactical Background Grid */}
        {showGrid && (
          <g className="opacity-20">
            {gridPaths.map((path, i) => (
              <path key={i} d={path} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
            ))}
            {axisPaths.map((path, i) => (
              <path key={i} d={path} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
            ))}
          </g>
        )}

        {/* Background Glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#radar-glow)" />

        {/* Main Data Polygon */}
        <motion.path
          d={dataPath}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className="text-primary fill-primary/10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        />

        {/* Attribute Vertices (Interactive Dots) */}
        {data.map((d, i) => {
          const coords = getCoords(i, d.value)
          return (
            <motion.circle
              key={d.key}
              cx={coords.x}
              cy={coords.y}
              r="4"
              fill={d.color}
              initial={false}
              animate={{ cx: coords.x, cy: coords.y }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              className="shadow-xl"
              style={{ filter: `drop-shadow(0 0 8px ${d.color})` }}
            />
          )
        })}

        {/* Labels Layer */}
        {showLabels && data.map((d, i) => {
          const labelCoords = getCoords(i, 115) // Position labels further out
          return (
            <g key={`label-${d.key}`} className="select-none pointer-events-none">
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-black uppercase tracking-tighter fill-foreground/60 font-display"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

import { useEffect, useState } from 'react'

interface ProgressRingProps {
  /** 0-100 */
  value: number
  /** Diameter in px. */
  size?: number
  strokeWidth?: number
  tone?: 'verdant' | 'brass' | 'ink'
  /** Center label; defaults to the percentage. */
  label?: string
  sublabel?: string
}

const toneColors = {
  verdant: 'var(--color-verdant-500)',
  brass: 'var(--color-brass-500)',
  ink: 'var(--color-ink-700)',
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  tone = 'verdant',
  label,
  sublabel,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  // Animate from 0 on mount.
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDisplay(clamped))
    return () => cancelAnimationFrame(raf)
  }, [clamped])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - display / 100)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'progress'}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ink-100)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneColors[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-2xl font-semibold tabular-nums text-ink-950">
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel && (
          <span className="font-mono text-[10px] tracking-wide text-ink-500 uppercase">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import Card from './Card'

interface StatTileProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'success' | 'brass' | 'danger'
}

const valueTones = {
  default: 'text-ink-950',
  success: 'text-verdant-600',
  brass: 'text-brass-600',
  danger: 'text-signal-600',
}

export default function StatTile({
  label,
  value,
  hint,
  tone = 'default',
}: StatTileProps) {
  return (
    <Card className="px-4 py-3">
      <div className="t-label text-ink-500">{label}</div>
      <div
        className={`font-display mt-1 text-2xl font-semibold tabular-nums ${valueTones[tone]}`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 font-mono text-[11px] text-ink-500">{hint}</div>}
    </Card>
  )
}

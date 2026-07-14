import type { HTMLAttributes } from 'react'

type Tone = 'neutral' | 'success' | 'brass' | 'danger' | 'ink'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const toneClasses: Record<Tone, string> = {
  neutral: 'text-ink-600',
  success: 'text-verdant-600',
  brass: 'text-brass-600',
  danger: 'text-signal-600',
  ink: 'text-ink-950',
}

/** Terminal status tag: bracketed mono text, no pill, no fill. */
export default function Badge({
  tone = 'neutral',
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-1 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      <span aria-hidden className="text-ink-500">
        [
      </span>
      {children}
      <span aria-hidden className="text-ink-500">
        ]
      </span>
    </span>
  )
}

interface ProgressBarProps {
  /** 0-100 */
  value: number
  tone?: 'verdant' | 'brass' | 'ink' | 'signal'
  className?: string
  label?: string
}

const toneClasses = {
  verdant: 'bg-verdant-500',
  brass: 'bg-brass-500',
  ink: 'bg-ink-600',
  signal: 'bg-signal-600',
}

/** Flat terminal meter: square fill with a hairline notch texture. */
export default function ProgressBar({
  value,
  tone = 'verdant',
  className = '',
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`relative h-1.5 w-full overflow-hidden bg-ink-100 ${className}`}
    >
      <div
        className={`h-full transition-[width] duration-500 ease-out ${toneClasses[tone]}`}
        style={{ width: `${clamped}%` }}
      />
      {/* 10% tick marks cut into the fill */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, transparent, transparent calc(10% - 1px), var(--color-paper-raised) calc(10% - 1px), var(--color-paper-raised) 10%)',
        }}
      />
    </div>
  )
}

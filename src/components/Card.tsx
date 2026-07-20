import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  /** Optional mono uppercase header bar, terminal-panel style. */
  title?: string
  /** Right-aligned content in the header bar (badges, values). */
  titleRight?: ReactNode
  /** Panel code rendered as a Bloomberg yellow-key chip (e.g. "PORT"). */
  code?: string
}

export default function Card({
  hover = false,
  title,
  titleRight,
  code,
  className = '',
  children,
  ...rest
}: CardProps) {
  // Glass panel: rounded, translucent, blurred, with a soft top highlight.
  const frame = `overflow-hidden rounded-card border border-paper-edge/70 bg-paper-raised/75 shadow-card backdrop-blur-md ${
    hover ? 'transition-[border-color,box-shadow] duration-150 hover:border-ink-400 hover:shadow-card-hover' : ''
  }`
  if (title === undefined) {
    return (
      <div className={`${frame} ${className}`} {...rest}>
        {children}
      </div>
    )
  }
  return (
    <div className={frame} {...rest}>
      <div className="flex items-center justify-between gap-2 border-b border-paper-edge/70 bg-ink-50/60 px-4 py-1.5">
        <span className="t-label text-cyan-600">
          <span aria-hidden className="mr-2 text-ink-500">
            ▮
          </span>
          {title}
        </span>
        <span className="flex items-center gap-2">
          {titleRight}
          {code && (
            <span className="rounded-[1px] bg-brass-600 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.08em] text-paper">
              {code}
            </span>
          )}
        </span>
      </div>
      <div className={className}>{children}</div>
    </div>
  )
}

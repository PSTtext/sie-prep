import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  /** Optional mono uppercase header bar, terminal-panel style. */
  title?: string
  /** Right-aligned content in the header bar (badges, values). */
  titleRight?: ReactNode
}

export default function Card({
  hover = false,
  title,
  titleRight,
  className = '',
  children,
  ...rest
}: CardProps) {
  const frame = `panel-brackets rounded-card border border-paper-edge bg-paper-raised ${
    hover ? 'transition-colors duration-150 hover:border-ink-400' : ''
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
      <div className="flex items-center justify-between gap-2 border-b border-paper-edge bg-ink-50 px-4 py-1.5">
        <span className="t-label text-brass-600">
          <span aria-hidden className="mr-2 text-ink-500">
            ▮
          </span>
          {title}
        </span>
        {titleRight}
      </div>
      <div className={className}>{children}</div>
    </div>
  )
}

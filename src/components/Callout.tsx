import type { ReactNode } from 'react'

type Variant = 'keyTerm' | 'examTip' | 'warning'

interface CalloutProps {
  variant: Variant
  title?: string
  children: ReactNode
}

const config: Record<
  Variant,
  { defaultTitle: string; wrapper: string; heading: string; icon: string }
> = {
  keyTerm: {
    defaultTitle: 'Key Term',
    wrapper: 'border-ink-400 bg-ink-50',
    heading: 'text-ink-700',
    icon: '◆',
  },
  examTip: {
    defaultTitle: 'Exam Tip',
    wrapper: 'border-brass-500 bg-brass-50',
    heading: 'text-brass-700',
    icon: '★',
  },
  warning: {
    defaultTitle: 'Watch Out',
    wrapper: 'border-signal-600 bg-signal-50',
    heading: 'text-signal-700',
    icon: '▲',
  },
}

export default function Callout({ variant, title, children }: CalloutProps) {
  const c = config[variant]
  return (
    <aside className={`border-l-2 px-4 py-3 ${c.wrapper}`}>
      <div className={`t-label mb-1 flex items-center gap-1.5 ${c.heading}`}>
        <span aria-hidden>{c.icon}</span>
        {title ?? c.defaultTitle}
      </div>
      <div className="text-sm leading-relaxed text-ink-800">{children}</div>
    </aside>
  )
}

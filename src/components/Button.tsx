import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  // Terminal function key: solid amber, black legend.
  primary:
    'border-brass-600 bg-brass-600 text-black hover:border-brass-700 hover:bg-brass-700 active:bg-brass-500',
  secondary:
    'border-brass-600 bg-transparent text-brass-600 hover:bg-brass-50 active:bg-brass-100',
  ghost:
    'border-paper-edge bg-transparent text-ink-600 hover:border-ink-400 hover:text-ink-900',
  danger:
    'border-signal-600 bg-signal-50 text-signal-700 hover:bg-signal-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs',
  lg: 'px-6 py-2.5 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm border font-mono font-semibold tracking-[0.08em] uppercase transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600 disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

import { Link } from 'react-router-dom'

/** The one empty-state idiom: ruled terminal line + optional action link. */
export default function EmptyState({
  label = 'no data',
  action,
}: {
  label?: string
  action?: { to: string; text: string }
}) {
  return (
    <div className="py-6 text-center font-mono text-xs tracking-[0.3em] text-ink-500 uppercase">
      ── {label} ──
      {action && (
        <Link
          to={action.to}
          className="mt-3 block font-semibold tracking-[0.08em] text-brass-600 hover:underline"
        >
          ▸ {action.text}
        </Link>
      )}
    </div>
  )
}

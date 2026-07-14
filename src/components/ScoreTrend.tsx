import { useState } from 'react'
import type { QuizResult } from '../types'

interface ScoreTrendProps {
  /** Exam attempts, oldest first. */
  attempts: QuizResult[]
}

const W = 560
const H = 160
const PAD = { top: 14, right: 44, bottom: 22, left: 34 }

/** Score trend across practice-exam attempts, with the 70 pass line. */
export default function ScoreTrend({ attempts }: ScoreTrendProps) {
  const [hover, setHover] = useState<number | null>(null)
  const scores = attempts.map(
    (a) => (a.correctCount / a.questionCount) * 100,
  )
  if (scores.length === 0) return null

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) =>
    PAD.left + (scores.length === 1 ? innerW / 2 : (i / (scores.length - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / 100) * innerH
  const path = scores
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
  const last = scores.length - 1

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Practice exam score trend across ${scores.length} attempts; latest ${Math.round(scores[last])}%`}
      >
        {/* Recessive gridlines at 0/50/100 */}
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-ink-100)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(v) + 3.5}
              textAnchor="end"
              className="fill-ink-400 text-[10px]"
            >
              {v}
            </text>
          </g>
        ))}
        {/* Pass threshold */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(70)}
          y2={y(70)}
          stroke="var(--color-brass-500)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <text
          x={W - PAD.right + 6}
          y={y(70) + 3.5}
          className="fill-brass-600 text-[10px] font-semibold"
        >
          pass 70
        </text>

        <path d={path} fill="none" stroke="var(--color-verdant-600)" strokeWidth={2} />
        {scores.map((v, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(v)}
              r={i === last || i === hover ? 5 : 3.5}
              fill="var(--color-verdant-600)"
              stroke="var(--color-paper-raised)"
              strokeWidth={2}
            />
            {/* Oversized invisible hit target */}
            <circle
              cx={x(i)}
              cy={y(v)}
              r={14}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {(i === hover || (hover === null && i === last)) && (
              <text
                x={x(i)}
                y={y(v) - 10}
                textAnchor="middle"
                className="fill-ink-900 text-[11px] font-bold"
              >
                {Math.round(v)}%
              </text>
            )}
          </g>
        ))}
        {/* X labels: attempt numbers, thinned */}
        {scores.map((_, i) =>
          scores.length <= 10 || i % Math.ceil(scores.length / 10) === 0 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              className="fill-ink-400 text-[10px]"
            >
              {i + 1}
            </text>
          ) : null,
        )}
      </svg>
      {hover !== null && (
        <div className="mt-1 text-xs text-ink-600">
          Attempt {hover + 1}: {attempts[hover].correctCount}/
          {attempts[hover].questionCount} correct ·{' '}
          {new Date(attempts[hover].completedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

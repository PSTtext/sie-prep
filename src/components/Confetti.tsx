import { useEffect, useState } from 'react'

const COLORS = ['#0e8563', '#12a578', '#d0951f', '#b47a14', '#3dbf95', '#556588']
const PIECE_COUNT = 90

// Generated once at module load so rendering stays pure.
const PIECES = Array.from({ length: PIECE_COUNT }, (_, i) => ({
  left: Math.random() * 100,
  delay: Math.random() * 1.2,
  duration: 2.2 + Math.random() * 1.8,
  size: 6 + Math.random() * 6,
  color: COLORS[i % COLORS.length],
  round: Math.random() > 0.6,
}))

/** Lightweight CSS confetti burst; renders for a few seconds, then unmounts. */
export default function Confetti() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 5000)
    return () => clearTimeout(t)
  }, [])

  if (done) return null

  return (
    <div
      data-confetti
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.45),
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in both`,
          }}
        />
      ))}
    </div>
  )
}

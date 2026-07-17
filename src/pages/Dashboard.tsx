import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ActivityChart from '../components/ActivityChart'
import ProgressBar from '../components/ProgressBar'
import ScoreTrend from '../components/ScoreTrend'
import { chapters, finraSections, getChapter } from '../data'
import { allFlashcards } from '../data/flashcards'
import { isDue, todayISO } from '../lib/srs'
import { useProgress } from '../hooks/useProgress'
import { setExamDate } from '../lib/progress'
import { exportProgressFile, importProgressFile } from '../lib/backup'
import {
  bestChapterScore,
  chapterReadFraction,
  dailyActivity,
  daysUntilExam,
  overallProgressPct,
  readinessScore,
  sectionDayChange,
  sectionReadiness,
  suggestedWeeklyPace,
} from '../lib/stats'
import type { FinraSectionId } from '../types'

/** Trading-desk ticker symbols + short names for the four exam sections. */
const sectionMeta: Record<FinraSectionId, { ticker: string; name: string }> = {
  1: { ticker: 'MKT', name: 'Capital Markets' },
  2: { ticker: 'PRD', name: 'Products & Risks' },
  3: { ticker: 'TRD', name: 'Trading & Accounts' },
  4: { ticker: 'REG', name: 'Regulatory Framework' },
}

/** Segmented block meter, terminal style. */
function Meter({ value, label }: { value: number | null; label: string }) {
  const cells = 16
  const filled = value === null ? 0 : Math.round((value / 100) * cells)
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value === null ? 0 : Math.round(value)}
      className="flex items-center gap-[2px]"
    >
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-[5px] ${i < filled ? 'bg-brass-600' : 'bg-ink-200'}`}
        />
      ))}
    </div>
  )
}

/** Signed day-change readout: green up, red down, grey when no basis. */
function DayChange({ value }: { value: number | null }) {
  if (value === null)
    return <span className="font-mono text-xs text-ink-400">--</span>
  const flat = Math.abs(value) < 0.05
  return (
    <span
      className={`font-mono text-xs font-semibold tabular-nums ${
        flat ? 'text-ink-500' : value > 0 ? 'text-verdant-600' : 'text-signal-600'
      }`}
    >
      {value > 0 ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  )
}

function StatCell({
  label,
  value,
  tone = 'default',
  sub,
}: {
  label: string
  value: string
  tone?: 'default' | 'up' | 'warn'
  sub?: ReactNode
}) {
  const toneClass =
    tone === 'up'
      ? 'text-verdant-600'
      : tone === 'warn'
        ? 'text-brass-600'
        : 'text-ink-950'
  return (
    <div className="flex-1 px-5 py-4">
      <div className="t-label text-ink-500">{label}</div>
      <div
        className={`font-display mt-1 text-2xl font-semibold tabular-nums sm:text-3xl ${toneClass}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 font-mono text-[11px] text-ink-500">{sub}</div>}
    </div>
  )
}

function DataCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  )

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const result = await importProgressFile(file)
    setMessage(
      result.ok
        ? { ok: true, text: 'Backup restored — all progress replaced.' }
        : { ok: false, text: result.error },
    )
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Card
      title="Your data"
      titleRight={<span className="font-mono text-[10px] text-ink-500">DATA</span>}
      className="p-5"
    >
      <p className="mb-4 text-sm text-ink-600">
        All progress lives on this device — nothing is sent to a server. Export
        a backup before clearing your browser or to move to another device.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={exportProgressFile}>
          Export backup
        </Button>
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          Import backup…
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Import backup file"
          onChange={(e) => onImport(e.target.files?.[0])}
        />
        {message && (
          <span
            role="status"
            className={`font-mono text-xs ${message.ok ? 'text-verdant-600' : 'text-signal-600'}`}
          >
            {message.text}
          </span>
        )}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const progress = useProgress()
  const overall = overallProgressPct(progress)
  const readiness = readinessScore(progress)
  const days = daysUntilExam(progress)
  const pace = suggestedWeeklyPace(progress)
  const perSection = sectionReadiness(progress)
  const dayChange = sectionDayChange(progress)
  const today = todayISO()
  const dueCount = allFlashcards.filter((c) =>
    isDue(progress.flashcards[c.id], today),
  ).length
  const activity = dailyActivity(progress, 30)
  const lastRead = progress.lastRead && getChapter(progress.lastRead.chapterId)
  const lastReadSection = lastRead?.sections.find(
    (s) => s.id === progress.lastRead!.sectionId,
  )

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="t-label text-brass-600">Overview</div>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
            Dashboard
          </h1>
        </div>
        <div className="font-mono text-[11px] tracking-wide text-ink-500 uppercase">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </header>

      {/* Stat strip */}
      <Card className="mb-4 flex flex-col divide-y divide-paper-edge sm:flex-row sm:divide-x sm:divide-y-0">
        <StatCell
          label="Material"
          value={`${Math.round(overall)}%`}
          tone={overall > 0 ? 'up' : 'default'}
          sub="of content read + tested"
        />
        <StatCell
          label="Readiness"
          value={readiness !== null ? `${Math.round(readiness)}%` : '--'}
          tone={readiness !== null ? (readiness >= 70 ? 'up' : 'warn') : 'default'}
          sub={
            readiness !== null
              ? readiness >= 70
                ? '▲ above pass line (70)'
                : '▼ below pass line (70)'
              : 'take a test to populate'
          }
        />
        <StatCell
          label="T-minus"
          value={days !== null ? `${days}d` : '--'}
          tone={days !== null && days <= 7 ? 'warn' : 'default'}
          sub={
            <span className="block">
              <label className="flex items-center gap-2">
                exam date
                <input
                  type="date"
                  value={progress.examDate ?? ''}
                  onChange={(e) => setExamDate(e.target.value || undefined)}
                  className="border border-paper-edge bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-800 focus:outline-2 focus:outline-brass-600"
                />
              </label>
              {pace !== null && (
                <span className="mt-1 block text-brass-600">
                  pace: ~{pace} section{pace === 1 ? '' : 's'}/week to finish
                  reading
                </span>
              )}
            </span>
          }
        />
        <StatCell
          label="Cards due"
          value={String(dueCount)}
          tone={dueCount > 0 ? 'warn' : 'up'}
          sub={
            <Link to="/flashcards" className="text-brass-600 hover:underline">
              {dueCount > 0 ? '→ open flashcards' : 'all caught up'}
            </Link>
          }
        />
      </Card>

      {/* Bloomberg-style panel grid: left = tables, right = trend/session */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-7">
      {/* Portfolio: per-section mastery table */}
      <Card
        title="Portfolio — Exam Mastery"
        titleRight={<span className="font-mono text-[10px] text-ink-500">PORT</span>}
        className="overflow-x-auto"
      >
        <table className="w-full font-mono text-[13px]">
          <thead>
            <tr className="t-label border-b border-paper-edge text-left text-ink-500">
              <th className="px-4 py-2 font-semibold">Ticker</th>
              <th className="px-2 py-2 font-semibold">Section</th>
              <th className="px-2 py-2 font-semibold">Wt</th>
              <th className="px-2 py-2 font-semibold">Mastery</th>
              <th className="px-2 py-2 font-semibold">Day chg</th>
              <th className="hidden px-2 py-2 font-semibold sm:table-cell">Meter</th>
              <th className="px-4 py-2 text-right font-semibold">
                <span className="sr-only">Drill</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {finraSections.map((fs) => {
              const score = perSection[fs.id]
              const chg = dayChange[fs.id]
              const meta = sectionMeta[fs.id]
              return (
                <tr
                  key={fs.id}
                  className="border-b border-paper-edge last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-ink-950">
                    {meta.ticker}
                  </td>
                  <td className="max-w-52 px-2 py-3 text-ink-700" title={fs.title}>
                    {meta.name}
                  </td>
                  <td className="px-2 py-3 text-ink-500 tabular-nums">
                    {fs.weightPct}%
                  </td>
                  <td className="px-2 py-3 font-semibold text-ink-950 tabular-nums">
                    {score !== null ? `${score.toFixed(1)}%` : '--'}
                  </td>
                  <td className="px-2 py-3">
                    <DayChange value={chg} />
                  </td>
                  <td className="hidden px-2 py-3 sm:table-cell">
                    <Meter value={score} label={`${meta.name} mastery`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/drill/${fs.id}`}
                      className="font-mono text-[11px] font-semibold whitespace-nowrap text-brass-600 hover:underline"
                    >
                      Drill →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* 30-day study volume */}
      <Card
        title="Activity — 30d study volume"
        titleRight={<span className="font-mono text-[10px] text-ink-500">ACTV</span>}
        className="p-4"
      >
        <ActivityChart days={activity} />
      </Card>

      {/* Chapter list */}
      <Card
        title="Chapters"
        titleRight={<span className="font-mono text-[10px] text-ink-500">CHPT</span>}
        className="max-h-[26rem] overflow-y-auto"
      >
        {chapters.map((ch) => {
          const readPct = chapterReadFraction(progress, ch) * 100
          const best = bestChapterScore(progress, ch.id)
          return (
            <Link
              key={ch.id}
              to={`/chapters/${ch.id}`}
              className="flex items-center gap-4 border-b border-paper-edge px-4 py-2.5 transition-colors last:border-b-0 hover:bg-ink-50"
            >
              <span className="w-10 shrink-0 font-mono text-xs text-ink-500 tabular-nums">
                CH{String(ch.id).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink-900">
                {ch.title}
              </span>
              <span className="hidden w-28 shrink-0 sm:block">
                <ProgressBar value={readPct} label={`${ch.title} reading`} />
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-ink-600 tabular-nums">
                {Math.round(readPct)}%
              </span>
              <span className="w-20 shrink-0 text-right">
                {best !== null ? (
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      best >= 70 ? 'text-verdant-600' : 'text-signal-600'
                    }`}
                  >
                    {best >= 70 ? '▲' : '▼'} {Math.round(best)}%
                  </span>
                ) : (
                  <span className="font-mono text-xs text-ink-400">--</span>
                )}
              </span>
            </Link>
          )
        })}
      </Card>
        </div>

        {/* Right column: risk, trend, session, data */}
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-5">
          <Card
            title="Risk — Exam Readiness"
            titleRight={<span className="font-mono text-[10px] text-ink-500">RISK</span>}
            className="p-5"
          >
            {readiness !== null ? (
              <div className="flex flex-wrap items-center gap-6">
                {/* Conic dial: readiness vs the 70 pass line */}
                <div
                  role="meter"
                  aria-label="Overall exam readiness"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(readiness)}
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--color-brass-600) 0% ${readiness}%, var(--color-ink-200) ${readiness}% 100%)`,
                  }}
                >
                  <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-paper-raised">
                    <span className="t-readout text-2xl text-brass-600">
                      {Math.round(readiness)}
                    </span>
                  </div>
                </div>
                <dl className="min-w-0 flex-1 font-mono text-[12px] leading-7">
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="text-ink-500 uppercase">Readiness</dt>
                    <dd
                      className={`font-semibold tabular-nums ${
                        readiness >= 70 ? 'text-verdant-600' : 'text-brass-600'
                      }`}
                    >
                      {readiness.toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="text-ink-500 uppercase">Pass line</dt>
                    <dd className="text-ink-900 tabular-nums">70.0%</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="text-ink-500 uppercase">Margin</dt>
                    <dd
                      className={`font-semibold tabular-nums ${
                        readiness >= 70 ? 'text-verdant-600' : 'text-signal-600'
                      }`}
                    >
                      {readiness >= 70 ? '+' : ''}
                      {(readiness - 70).toFixed(1)} pts
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="py-6 text-center font-mono text-xs tracking-[0.3em] text-ink-500 uppercase">
                ── no data ──
              </div>
            )}
          </Card>

          <Card
            title="Practice exam trend"
            titleRight={
              <span className="font-mono text-[10px] text-ink-500">
                {progress.examHistory.length > 0
                  ? `${progress.examHistory.length} ATT`
                  : 'TRND'}
              </span>
            }
            className="p-4"
          >
            {progress.examHistory.length > 0 ? (
              <ScoreTrend attempts={progress.examHistory} />
            ) : (
              <div className="py-8 text-center font-mono text-xs tracking-[0.3em] text-ink-500 uppercase">
                ── no data ──
              </div>
            )}
          </Card>

          <Card
            title="Session"
            titleRight={<span className="font-mono text-[10px] text-ink-500">SESS</span>}
          >
            {lastRead && lastReadSection ? (
              <Link
                to={`/chapters/${lastRead.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-ink-50"
              >
                <div className="min-w-0">
                  <span className="t-label text-brass-600">Resume ›</span>
                  <span className="ml-3 font-mono text-sm font-semibold text-ink-950">
                    CH{String(lastRead.id).padStart(2, '0')}
                  </span>
                  <span className="mt-1 block truncate text-sm text-ink-800">
                    {lastRead.title}
                    <span className="text-ink-500"> / {lastReadSection.title}</span>
                  </span>
                </div>
                <span aria-hidden className="font-mono text-brass-600">
                  →
                </span>
              </Link>
            ) : (
              <div className="py-6 text-center font-mono text-xs tracking-[0.3em] text-ink-500 uppercase">
                ── no session ──
              </div>
            )}
          </Card>

          <DataCard />
        </div>
      </div>
    </div>
  )
}

import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ActivityChart from '../components/ActivityChart'
import EmptyState from '../components/EmptyState'
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

/** ASCII block meter (█░), colored by section identity. */
function Meter({
  value,
  label,
  colorVar,
}: {
  value: number | null
  label: string
  colorVar: string
}) {
  const cells = 16
  const filled = value === null ? 0 : Math.round((value / 100) * cells)
  return (
    <span
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value === null ? 0 : Math.round(value)}
      className="font-mono text-[12px] tracking-[0.05em] whitespace-nowrap"
    >
      <span style={{ color: `var(${colorVar})` }}>{'█'.repeat(filled)}</span>
      <span className="text-ink-200">{'░'.repeat(cells - filled)}</span>
    </span>
  )
}

/** P&L-style day change: +x.x green, (x.x) red, grey when no basis. */
function DayChange({ value }: { value: number | null }) {
  if (value === null)
    return <span className="font-mono text-xs text-ink-500">--</span>
  const flat = Math.abs(value) < 0.05
  return (
    <span
      className={`font-mono text-[13px] font-semibold tabular-nums ${
        flat ? 'text-ink-500' : value > 0 ? 'text-verdant-600' : 'text-signal-600'
      }`}
    >
      {value < -0.05 ? `(${Math.abs(value).toFixed(1)})` : `+${value.toFixed(1)}`}
    </span>
  )
}

/** P&L status word: ▲ PASS / ▼ BELOW / NO DATA. */
function PassStatus({ value }: { value: number | null }) {
  if (value === null)
    return (
      <span className="font-mono text-[11px] font-bold text-ink-500">
        NO DATA
      </span>
    )
  return value >= 70 ? (
    <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-verdant-600">
      ▲ PASS
    </span>
  ) : (
    <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-signal-600">
      ▼ BELOW
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
    <div className="flex-1 px-5 py-3">
      <div className="t-label text-ink-600">{label}</div>
      <div
        className={`font-display mt-1 text-4xl font-bold tabular-nums sm:text-[2.75rem] sm:leading-none ${toneClass}`}
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
      code="DATA"
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
      {/* Stat strip in a titled terminal panel (mockup: Overview / DASH) */}
      <Card
        title="Overview"
        titleRight={
          <span className="font-mono text-[10px] text-ink-500 uppercase">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        }
        code="DASH"
        className="mb-4 flex flex-col divide-y divide-paper-edge sm:flex-row sm:divide-x sm:divide-y-0"
      >
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
            readiness !== null ? (
              <span
                className={`font-semibold ${
                  readiness >= 70 ? 'text-verdant-600' : 'text-signal-600'
                }`}
              >
                {readiness >= 70 ? '▲ PASS' : '▼ BELOW'} ·{' '}
                {readiness >= 70 ? '+' : ''}
                {(readiness - 70).toFixed(1)} vs pass line
              </span>
            ) : (
              'take a test to populate'
            )
          }
        />
        <StatCell
          label="T-minus"
          value={days !== null ? `${days}d` : '--'}
          tone={days !== null && days <= 7 ? 'warn' : 'default'}
          sub={
            <span className="block">
              {/* Unset exam date is a first-run setup action — promote it. */}
              <label
                className={`flex items-center gap-2 ${
                  progress.examDate
                    ? ''
                    : 'w-fit cursor-pointer border border-brass-600 px-2 py-1 font-semibold tracking-[0.08em] text-brass-600 uppercase hover:bg-brass-50'
                }`}
              >
                {progress.examDate ? 'exam date' : '▸ Set exam date'}
                <input
                  type="date"
                  value={progress.examDate ?? ''}
                  onChange={(e) => setExamDate(e.target.value || undefined)}
                  className={`border border-paper-edge bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-800 focus:outline-2 focus:outline-brass-600 ${
                    progress.examDate ? '' : 'max-w-28'
                  }`}
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
              {dueCount > 0 ? '▸ Open flashcards' : 'all caught up'}
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
        code="PORT"
        className="overflow-x-auto"
      >
        <table className="w-full font-mono text-[13px]">
          <thead>
            <tr className="t-label border-b border-paper-edge text-left text-ink-500">
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Ticker</th>
              <th className="px-2 py-2 font-semibold whitespace-nowrap">Section</th>
              <th className="px-2 py-2 font-semibold whitespace-nowrap">Wt</th>
              <th className="px-2 py-2 font-semibold whitespace-nowrap">Mastery</th>
              <th className="px-2 py-2 font-semibold whitespace-nowrap">Chg</th>
              <th className="hidden px-2 py-2 font-semibold whitespace-nowrap lg:table-cell">
                Meter
              </th>
              <th className="hidden px-2 py-2 font-semibold whitespace-nowrap xl:table-cell">
                Status
              </th>
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
                  <td
                    className="px-4 py-3 font-bold"
                    style={{ color: `var(--color-chart-${fs.id})` }}
                  >
                    {meta.ticker}
                  </td>
                  <td
                    className="max-w-52 px-2 py-3 text-ink-800 italic whitespace-nowrap"
                    title={fs.title}
                  >
                    {meta.name}
                  </td>
                  <td className="px-2 py-3 text-ink-600 tabular-nums">
                    {fs.weightPct}%
                  </td>
                  <td className="px-2 py-3 text-[15px] font-bold text-ink-950 tabular-nums">
                    {score !== null ? score.toFixed(1) : '--'}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <DayChange value={chg} />
                  </td>
                  <td className="hidden px-2 py-3 lg:table-cell">
                    <Meter
                      value={score}
                      label={`${meta.name} mastery`}
                      colorVar={`--color-chart-${fs.id}`}
                    />
                  </td>
                  <td className="hidden px-2 py-3 whitespace-nowrap xl:table-cell">
                    <PassStatus value={score} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/drill/${fs.id}`}
                      className="font-mono text-[11px] font-semibold whitespace-nowrap text-brass-600 hover:underline"
                    >
                      ▸ Drill
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
        code="ACTV"
        className="p-4"
      >
        <ActivityChart days={activity} />
      </Card>

      {/* Chapter list */}
      <Card
        title="Chapters"
        code="CHPT"
        className="max-h-64 overflow-y-auto"
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
            code="RISK"
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
                    background: `conic-gradient(${
                      readiness >= 70
                        ? 'var(--color-verdant-600)'
                        : 'var(--color-signal-600)'
                    } 0% ${readiness}%, var(--color-ink-200) ${readiness}% 100%)`,
                  }}
                >
                  <div className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full bg-paper-raised">
                    <span className="t-readout text-2xl text-ink-950">
                      {Math.round(readiness)}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold tracking-[0.15em] ${
                        readiness >= 70 ? 'text-verdant-600' : 'text-signal-600'
                      }`}
                    >
                      {readiness >= 70 ? 'PASS' : 'BELOW'}
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
              <EmptyState action={{ to: '/exam', text: 'Take a practice exam' }} />
            )}
          </Card>

          <Card
            title="Practice exam trend"
            titleRight={
              progress.examHistory.length > 0 ? (
                <span className="font-mono text-[10px] text-ink-600">
                  {progress.examHistory.length} ATT
                </span>
              ) : undefined
            }
            code="TRND"
            className="p-4"
          >
            {progress.examHistory.length > 0 ? (
              <ScoreTrend attempts={progress.examHistory} />
            ) : (
              <EmptyState action={{ to: '/exam', text: 'Take a practice exam' }} />
            )}
          </Card>

          <Card
            title="Session"
            code="SESS"
          >
            {lastRead && lastReadSection ? (
              <Link
                to={`/chapters/${lastRead.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-ink-50"
              >
                <div className="min-w-0">
                  <span className="t-label text-brass-600">▸ Resume</span>
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
              <EmptyState
                label="no session"
                action={{ to: '/chapters', text: 'Start reading' }}
              />
            )}
          </Card>

          <DataCard />
        </div>
      </div>
    </div>
  )
}

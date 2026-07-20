import { lazy, Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { applyTheme, getTheme, type Theme } from '../lib/theme'

// Loaded on first open so the search index (questions + content) stays out of
// the main bundle.
const SearchPalette = lazy(() => import('./SearchPalette'))
const TickerTape = lazy(() => import('./TickerTape'))

const navItems = [
  { to: '/', label: 'Dashboard', code: 'DASH' },
  { to: '/chapters', label: 'Chapters', code: 'CHPT' },
  { to: '/exam', label: 'Practice Exam', code: 'EXAM' },
  { to: '/flashcards', label: 'Flashcards', code: 'FLSH' },
  { to: '/review', label: 'Review Bank', code: 'BANK' },
  { to: '/glossary', label: 'Glossary', code: 'GLOS' },
]

const SIDEBAR_KEY = 'sie-prep-sidebar'

function getCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
  } catch {
    return false
  }
}

function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`font-mono font-bold tracking-tight text-ink-950 ${small ? 'text-base' : 'text-xl'}`}
    >
      SIE<span className="text-brass-600">/</span>PREP
      <span aria-hidden className="animate-cursor ml-1 text-brass-600">
        ▮
      </span>
    </div>
  )
}

function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => getTheme())
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={`Switch to ${next} mode`}
      title={theme === 'dark' ? 'Day mode' : 'Night mode'}
      className={`flex w-full items-center gap-2 border border-paper-edge px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-600 uppercase transition-colors hover:border-ink-400 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brass-500 ${
        collapsed ? 'justify-center px-0' : ''
      }`}
    >
      <span aria-hidden className="text-brass-600">
        ◐
      </span>
      {!collapsed && (theme === 'dark' ? 'Day mode' : 'Night mode')}
    </button>
  )
}

function BuilderCredit({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div
        className="border-t border-paper-edge py-3 text-center font-mono text-[10px] font-bold tracking-widest text-brass-600"
        title="Designed & built by Jake Jennings"
      >
        JJ
      </div>
    )
  }
  return (
    <div className="border-t border-paper-edge px-5 py-4 font-mono text-[10px] leading-relaxed tracking-wide text-ink-500 uppercase">
      <div className="flex items-baseline gap-2">
        <span aria-hidden className="text-brass-600">
          ▪
        </span>
        <span>
          Designed &amp; built by{' '}
          <span className="font-bold text-brass-600">Jake Jennings</span>
        </span>
      </div>
      <div className="mt-2 text-ink-400">
        Free &amp; open source
        <br />
        Not affiliated with FINRA
      </div>
    </div>
  )
}

function SidebarContent({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  onSearch,
}: {
  collapsed?: boolean
  onNavigate?: () => void
  onToggleCollapse?: () => void
  onSearch?: () => void
}) {
  return (
    <>
      <div
        className={`border-b border-paper-edge pt-6 pb-5 ${collapsed ? 'px-0 text-center' : 'px-5'}`}
      >
        {collapsed ? (
          <div className="font-mono text-base font-bold text-ink-950">
            S<span className="text-brass-600">/</span>P
          </div>
        ) : (
          <>
            <Wordmark />
            <div className="mt-1 font-mono text-[10px] font-medium tracking-[0.22em] text-ink-500 uppercase">
              Securities Essentials
            </div>
          </>
        )}
      </div>
      {onSearch && (
        <div className={collapsed ? 'px-2 pt-3' : 'px-4 pt-3'}>
          <button
            type="button"
            onClick={onSearch}
            className={`flex w-full items-center gap-2 border border-paper-edge px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-600 uppercase transition-colors hover:border-ink-400 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brass-500 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <span aria-hidden className="text-brass-600">
              /
            </span>
            {!collapsed && (
              <>
                Search
                <kbd className="ml-auto border border-paper-edge px-1 py-0.5 text-[9px] tracking-normal normal-case">
                  Ctrl K
                </kbd>
              </>
            )}
          </button>
        </div>
      )}
      <nav className="flex flex-col px-0 pt-2" aria-label="Main">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-baseline border-l-2 py-2.5 font-mono text-[13px] font-medium tracking-wide transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass-500 ${
                collapsed ? 'justify-center px-0' : 'gap-3 px-5'
              } ${
                isActive
                  ? 'border-brass-500 bg-ink-50 text-brass-600'
                  : 'border-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-950'
              }`
            }
          >
            {collapsed ? (
              <span className="text-[11px] font-semibold tracking-[0.08em]">{item.code}</span>
            ) : (
              <>
                <span aria-hidden className="text-[10px] text-ink-400 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="uppercase">{item.label}</span>
                <span aria-hidden className="ml-auto text-[10px] tracking-[0.08em] text-ink-400">
                  {item.code}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className={`mt-auto pb-3 ${collapsed ? 'px-2' : 'px-4'}`}>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`mb-2 flex w-full items-center gap-2 border border-paper-edge px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-600 uppercase transition-colors hover:border-ink-400 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brass-500 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <span aria-hidden className="text-brass-600">
              {collapsed ? '»' : '«'}
            </span>
            {!collapsed && 'Collapse'}
          </button>
        )}
        <ThemeToggle collapsed={collapsed} />
      </div>
      <BuilderCredit collapsed={collapsed} />
    </>
  )
}

export default function AppShell() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => getCollapsed())
  const [searchOpen, setSearchOpen] = useState(false)

  // Global Ctrl/Cmd+K opens the search palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded')
      } catch {
        // preference just won't persist
      }
      return next
    })
  }

  const sidebarWidth = collapsed ? 'w-16' : 'w-60'
  const mainMargin = collapsed ? 'lg:ml-16' : 'lg:ml-60'

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 hidden flex-col border-r border-paper-edge bg-paper-raised transition-[width] duration-150 lg:flex ${sidebarWidth}`}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onSearch={() => setSearchOpen(true)}
        />
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-paper-edge bg-paper-raised px-4 py-3 lg:hidden">
        <Wordmark small />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="border border-paper-edge px-2.5 py-2 font-mono text-sm text-ink-700 hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-brass-500"
          >
            /
          </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          className="border border-paper-edge p-2 text-ink-700 hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-brass-500"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          </button>
        </div>
      </header>

      {/* Search palette (Ctrl+K) */}
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchPalette onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-60 flex-col border-r border-paper-edge bg-paper-raised shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-3 border border-transparent p-1.5 font-mono text-ink-500 hover:border-paper-edge hover:text-ink-900"
            >
              ✕
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <main
        className={`flex flex-1 flex-col pt-14 lg:pt-0 ${mainMargin} transition-[margin] duration-150`}
      >
        {/* Bloomberg-style tape across the top of the work area */}
        <Suspense fallback={null}>
          <TickerTape />
        </Suspense>
        <div className="flex-1 px-4 pt-4 pb-8 sm:px-6 lg:px-8 lg:pt-6">
          <div key={location.pathname} className="animate-page mx-auto max-w-7xl">
            <Suspense
              fallback={
                <div
                  className="flex items-center justify-center gap-2 py-24 font-mono text-xs tracking-[0.2em] text-ink-500 uppercase"
                  role="status"
                >
                  Loading
                  <span aria-hidden className="animate-cursor text-brass-600">
                    ▮
                  </span>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </div>

        {/* Bottom system strip */}
        <div className="hidden items-center justify-between border-t border-paper-edge bg-paper-raised px-8 py-1.5 lg:flex">
          <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.14em] text-ink-500 uppercase">
            <span>
              SYS <span className="text-verdant-600">OK</span>
            </span>
            <span>Data · Local device</span>
            <span>14 chapters · 3 exam functions</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.14em] text-ink-500 uppercase">
            SIE/PREP <span className="text-ink-700">v1.1</span> · © 2026 Jake
            Jennings
          </div>
        </div>
      </main>
    </div>
  )
}

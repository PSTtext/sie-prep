export type Theme = 'light' | 'dark'

const THEME_KEY = 'sie-prep-theme'

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // fall through to default
  }
  // The terminal look is dark-first; only honor an explicit light preference.
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('light', theme === 'light')
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // preference just won't persist
  }
}

/** Apply the saved/system theme before first paint. Call once at startup. */
export function initTheme(): Theme {
  const theme = getTheme()
  document.documentElement.classList.toggle('light', theme === 'light')
  return theme
}

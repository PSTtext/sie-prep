import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'

// Route-level code splitting keeps the initial bundle small — the question
// bank and chapter content only load with the pages that use them.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chapters = lazy(() => import('./pages/Chapters'))
const ChapterReader = lazy(() => import('./pages/ChapterReader'))
const UnitTest = lazy(() => import('./pages/UnitTest'))
const PracticeExam = lazy(() => import('./pages/PracticeExam'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const ReviewBank = lazy(() => import('./pages/ReviewBank'))
const Glossary = lazy(() => import('./pages/Glossary'))
const SectionDrill = lazy(() => import('./pages/SectionDrill'))
const Styleguide = lazy(() => import('./pages/Styleguide'))

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-24" role="status">
      <div
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brass-600"
      />
      <span className="sr-only">Loading page</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/chapters/:id" element={<ChapterReader />} />
          <Route path="/chapters/:id/test" element={<UnitTest />} />
          <Route path="/exam" element={<PracticeExam />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/review" element={<ReviewBank />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/drill/:section" element={<SectionDrill />} />
          <Route path="/styleguide" element={<Styleguide />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

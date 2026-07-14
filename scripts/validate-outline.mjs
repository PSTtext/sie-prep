// Structural validation of src/data/outline.json against the content schema.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outline = JSON.parse(
  readFileSync(join(root, 'src/data/outline.json'), 'utf8'),
)

const errors = []
const fail = (msg) => errors.push(msg)

// FINRA sections
if (!Array.isArray(outline.finraSections) || outline.finraSections.length !== 4)
  fail('finraSections must have exactly 4 entries')
const weights = outline.finraSections.map((s) => s.weightPct)
const weightSum = weights.reduce((a, b) => a + b, 0)
if (weightSum !== 100) fail(`section weights sum to ${weightSum}, expected 100`)
for (const s of outline.finraSections) {
  if (![1, 2, 3, 4].includes(s.id)) fail(`bad finraSection id ${s.id}`)
  if (typeof s.title !== 'string' || !s.title) fail(`section ${s.id} missing title`)
}

// Chapters
if (!Array.isArray(outline.chapters) || outline.chapters.length !== 14)
  fail(`expected 14 chapters, got ${outline.chapters?.length}`)
const seenChapterIds = new Set()
const seenSectionIds = new Set()
const blockTypes = new Set([
  'heading', 'paragraph', 'keyTerm', 'examTip', 'warning', 'example', 'list', 'table',
])
for (const ch of outline.chapters ?? []) {
  if (seenChapterIds.has(ch.id)) fail(`duplicate chapter id ${ch.id}`)
  seenChapterIds.add(ch.id)
  if (![1, 2, 3, 4].includes(ch.finraSection))
    fail(`chapter ${ch.id}: bad finraSection ${ch.finraSection}`)
  if (typeof ch.title !== 'string' || !ch.title) fail(`chapter ${ch.id}: missing title`)
  if (typeof ch.summary !== 'string' || !ch.summary) fail(`chapter ${ch.id}: missing summary`)
  if (!Array.isArray(ch.sections) || ch.sections.length === 0)
    fail(`chapter ${ch.id}: no sections`)
  for (const sec of ch.sections ?? []) {
    if (seenSectionIds.has(sec.id)) fail(`duplicate section id ${sec.id}`)
    seenSectionIds.add(sec.id)
    if (!sec.id.startsWith(`${ch.id}-`))
      fail(`section ${sec.id} id should start with "${ch.id}-"`)
    if (typeof sec.title !== 'string' || !sec.title) fail(`section ${sec.id}: missing title`)
    if (!Array.isArray(sec.blocks)) fail(`section ${sec.id}: blocks must be an array`)
    for (const b of sec.blocks ?? []) {
      if (!blockTypes.has(b.type)) fail(`section ${sec.id}: unknown block type "${b.type}"`)
    }
  }
}

// Chapter reading-content files
import { readdirSync as readdir2, existsSync as exists2 } from 'node:fs'
const chDir = join(root, 'src/data/chapters')
let contentSections = 0
if (exists2(chDir)) {
  for (const file of readdir2(chDir).filter((f) => f.endsWith('.json'))) {
    const cf = JSON.parse(readFileSync(join(chDir, file), 'utf8'))
    if (!outline.chapters.some((c) => c.id === cf.chapterId))
      fail(`${file}: unknown chapterId ${cf.chapterId}`)
    for (const s of cf.sections ?? []) {
      contentSections++
      if (!seenSectionIds.has(s.id)) fail(`${file}: unknown section id ${s.id}`)
      if (!Array.isArray(s.blocks) || s.blocks.length === 0)
        fail(`${file}: section ${s.id} has no blocks`)
      for (const b of s.blocks ?? []) {
        if (!blockTypes.has(b.type))
          fail(`${file}: section ${s.id} unknown block type "${b.type}"`)
        if (b.type === 'table' && b.rows.some((r) => r.length !== b.headers.length))
          fail(`${file}: section ${s.id} table row/header mismatch`)
      }
    }
  }
}

// Question files
import { readdirSync, existsSync } from 'node:fs'
const validSectionIds = seenSectionIds
const qDir = join(root, 'src/data/questions')
let questionCount = 0
if (existsSync(qDir)) {
  const seenQids = new Set()
  const seenStems = new Set()
  for (const file of readdirSync(qDir).filter((f) => f.endsWith('.json'))) {
    const qs = JSON.parse(readFileSync(join(qDir, file), 'utf8'))
    if (!Array.isArray(qs)) { fail(`${file}: not an array`); continue }
    for (const q of qs) {
      questionCount++
      if (seenQids.has(q.id)) fail(`${file}: duplicate question id ${q.id}`)
      seenQids.add(q.id)
      if (seenStems.has(q.question)) fail(`${file}: duplicate stem "${q.question.slice(0, 50)}..."`)
      seenStems.add(q.question)
      if (!outline.chapters.some((c) => c.id === q.chapterId))
        fail(`${q.id}: unknown chapterId ${q.chapterId}`)
      if (!validSectionIds.has(q.sectionTag))
        fail(`${q.id}: unknown sectionTag ${q.sectionTag}`)
      if (!Array.isArray(q.choices) || q.choices.length !== 4)
        fail(`${q.id}: must have exactly 4 choices`)
      if (![0, 1, 2, 3].includes(q.correctIndex))
        fail(`${q.id}: correctIndex out of range`)
      if (!['easy', 'medium', 'hard'].includes(q.difficulty))
        fail(`${q.id}: bad difficulty "${q.difficulty}"`)
      if (typeof q.explanation !== 'string' || q.explanation.length < 20)
        fail(`${q.id}: explanation missing or too short`)
    }
  }
}

// Flashcards
const fcPath = join(root, 'src/data/flashcards.json')
let flashcardCount = 0
if (existsSync(fcPath)) {
  const cards = JSON.parse(readFileSync(fcPath, 'utf8'))
  if (!Array.isArray(cards)) fail('flashcards.json: not an array')
  const seenFcIds = new Set()
  const seenFronts = new Set()
  for (const c of cards ?? []) {
    flashcardCount++
    if (seenFcIds.has(c.id)) fail(`flashcards: duplicate id ${c.id}`)
    seenFcIds.add(c.id)
    if (seenFronts.has(c.front)) fail(`flashcards: duplicate front "${c.front.slice(0, 40)}..."`)
    seenFronts.add(c.front)
    if (!outline.chapters.some((ch) => ch.id === c.chapterId))
      fail(`${c.id}: unknown chapterId ${c.chapterId}`)
    if (typeof c.front !== 'string' || !c.front) fail(`${c.id}: missing front`)
    if (typeof c.back !== 'string' || c.back.length < 10)
      fail(`${c.id}: back missing or too short`)
  }
}

if (errors.length) {
  console.error(`outline.json INVALID (${errors.length} error(s)):`)
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}
console.log(
  `outline.json valid: ${outline.chapters.length} chapters, ` +
    `${outline.chapters.reduce((n, c) => n + c.sections.length, 0)} sections, weights sum 100; ` +
    `${questionCount} questions, ${flashcardCount} flashcards valid.`,
)

/** FINRA SIE exam function areas (the four weighted sections). */
export type FinraSectionId = 1 | 2 | 3 | 4

export interface FinraSection {
  id: FinraSectionId
  title: string
  /** Exam weight as a percentage (16, 44, 31, 9). */
  weightPct: number
}

/** A block of readable content inside a chapter section. */
export type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'keyTerm'; term: string; definition: string }
  | { type: 'examTip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'example'; title?: string; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }

export interface ChapterSection {
  /** Unique within the chapter, e.g. "1-2". */
  id: string
  title: string
  blocks: ContentBlock[]
}

export interface Chapter {
  /** 1-14 */
  id: number
  title: string
  /** Which FINRA function area this chapter maps to. */
  finraSection: FinraSectionId
  /** Short description shown on chapter cards. */
  summary: string
  sections: ChapterSection[]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  /** Globally unique, e.g. "ch1-q001". */
  id: string
  chapterId: number
  /** ChapterSection id the question is tagged to, e.g. "1-2". */
  sectionTag: string
  question: string
  /** Exactly four answer choices. */
  choices: [string, string, string, string]
  /** Index into choices (0-3). */
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  difficulty: Difficulty
}

export interface Flashcard {
  /** Globally unique, e.g. "fc-001". */
  id: string
  chapterId: number
  front: string
  back: string
}

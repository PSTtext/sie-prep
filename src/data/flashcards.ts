import type { Flashcard } from '../types'
import flashcardsJson from './flashcards.json'

export const allFlashcards = flashcardsJson as Flashcard[]

export const allFlashcardIds = allFlashcards.map((c) => c.id)

export function flashcardsForChapter(chapterId: number): Flashcard[] {
  return allFlashcards.filter((c) => c.chapterId === chapterId)
}

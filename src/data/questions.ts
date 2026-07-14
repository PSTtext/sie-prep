import type { Question } from '../types'

// Eagerly load every per-chapter question file in /src/data/questions.
const modules = import.meta.glob<{ default: Question[] }>(
  './questions/ch*.json',
  { eager: true },
)

export const allQuestions: Question[] = Object.values(modules).flatMap(
  (m) => m.default,
)

const byId = new Map(allQuestions.map((q) => [q.id, q]))

export function getQuestion(id: string): Question | undefined {
  return byId.get(id)
}

export function questionsForChapter(chapterId: number): Question[] {
  return allQuestions.filter((q) => q.chapterId === chapterId)
}

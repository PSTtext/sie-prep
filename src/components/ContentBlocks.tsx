import Callout from './Callout'
import type { ContentBlock } from '../types'

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return block.level === 2 ? (
        <h2 className="font-display mt-10 mb-3 text-2xl font-bold text-ink-950">
          {block.text}
        </h2>
      ) : (
        <h3 className="font-display mt-8 mb-2 text-xl font-semibold text-ink-900">
          {block.text}
        </h3>
      )
    case 'paragraph':
      return <p className="my-4 leading-relaxed text-ink-800">{block.text}</p>
    case 'keyTerm':
      return (
        <div className="my-5">
          <Callout variant="keyTerm" title={`Key Term — ${block.term}`}>
            {block.definition}
          </Callout>
        </div>
      )
    case 'examTip':
      return (
        <div className="my-5">
          <Callout variant="examTip">{block.text}</Callout>
        </div>
      )
    case 'warning':
      return (
        <div className="my-5">
          <Callout variant="warning">{block.text}</Callout>
        </div>
      )
    case 'example':
      return (
        <div className="my-5 rounded-card bg-ink-50 px-5 py-4 [box-shadow:var(--shadow-inset-edge)]">
          <div className="mb-1 text-xs font-bold tracking-widest text-ink-500 uppercase">
            {block.title ?? 'Example'}
          </div>
          <p className="text-sm leading-relaxed text-ink-800">{block.text}</p>
        </div>
      )
    case 'list':
      return block.ordered ? (
        <ol className="my-4 list-decimal space-y-1.5 pl-6 leading-relaxed text-ink-800">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="my-4 list-disc space-y-1.5 pl-6 leading-relaxed text-ink-800">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="my-5 overflow-x-auto rounded-card [box-shadow:var(--shadow-inset-edge)]">
          <table className="w-full text-sm">
            {block.caption && (
              <caption className="bg-ink-50 px-4 py-2 text-left text-xs font-bold tracking-widest text-ink-500 uppercase">
                {block.caption}
              </caption>
            )}
            <thead>
              <tr className="bg-ink-900 text-left text-paper">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 1 ? 'bg-ink-50' : 'bg-paper-raised'}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 align-top text-ink-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export default function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) {
    return (
      <p className="my-6 rounded-card bg-ink-50 px-5 py-4 text-sm text-ink-500 italic">
        Content for this section is coming soon.
      </p>
    )
  }
  return (
    <div>
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  )
}

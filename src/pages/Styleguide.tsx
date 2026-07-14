import Badge from '../components/Badge'
import Button from '../components/Button'
import Callout from '../components/Callout'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import ProgressRing from '../components/ProgressRing'
import StatTile from '../components/StatTile'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <h2 className="font-display mb-4 text-xl font-bold text-ink-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function Styleguide() {
  return (
    <div>
      <header className="mb-10">
        <div className="t-label text-brass-600">Internal</div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          Design System
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-600">
          Terminal: true-black surfaces, amber chrome, ticker green and red
          reserved for data, hairline panels, sharp corners. IBM Plex Mono
          everywhere.
        </p>
      </header>

      <Section title="Palette">
        <div className="flex flex-wrap gap-3">
          {[
            ['Ink 950', 'bg-ink-950'],
            ['Ink 700', 'bg-ink-700'],
            ['Ink 300', 'bg-ink-300'],
            ['Ink 100', 'bg-ink-100'],
            ['Paper', 'bg-paper [box-shadow:var(--shadow-inset-edge)]'],
            ['Verdant 600', 'bg-verdant-600'],
            ['Verdant 100', 'bg-verdant-100'],
            ['Brass 500', 'bg-brass-500'],
            ['Signal 600', 'bg-signal-600'],
          ].map(([name, cls]) => (
            <div key={name} className="text-center">
              <div className={`h-16 w-24 rounded-lg ${cls}`} />
              <div className="mt-1 text-xs font-medium text-ink-600">{name}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <Card className="space-y-3 p-6">
          <div className="font-display text-3xl font-bold text-ink-950">
            Chapter 6 — Debt Instruments
          </div>
          <div className="font-display text-xl font-semibold text-ink-800">
            Municipal Bonds: GO vs Revenue
          </div>
          <p className="max-w-prose leading-relaxed text-ink-700">
            A general obligation bond is backed by the full faith, credit, and
            taxing power of the issuer, while a revenue bond is repaid only from
            the income of the facility it finances — a toll road, airport, or
            stadium.
          </p>
        </Card>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Take Unit Test</Button>
          <Button variant="secondary">Continue Reading</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Reset Progress</Button>
          <Button variant="primary" size="lg">
            Start 75-Question Exam
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Chapter 3</Badge>
          <Badge tone="success">Best 88%</Badge>
          <Badge tone="brass">44% of exam</Badge>
          <Badge tone="danger">Weak area</Badge>
          <Badge tone="ink">Exam mode</Badge>
        </div>
      </Section>

      <Section title="Progress">
        <div className="flex flex-wrap items-center gap-10">
          <ProgressRing value={72} sublabel="overall" />
          <ProgressRing value={45} tone="brass" size={96} sublabel="Sec. 2" />
          <ProgressRing value={90} size={80} strokeWidth={8} />
          <div className="min-w-64 flex-1 space-y-4">
            <ProgressBar value={72} label="reading progress" />
            <ProgressBar value={45} tone="brass" label="section 2 readiness" />
            <ProgressBar value={90} tone="ink" label="chapter 1" />
          </div>
        </div>
      </Section>

      <Section title="Callouts">
        <div className="max-w-prose space-y-4">
          <Callout variant="keyTerm" title="Key Term — Prospectus">
            The formal disclosure document that describes a new securities
            offering, required under the Securities Act of 1933.
          </Callout>
          <Callout variant="examTip">
            The SIE loves testing the difference between monetary policy (the
            Fed) and fiscal policy (Congress). If the question says "taxes" or
            "government spending," the answer is fiscal.
          </Callout>
          <Callout variant="warning">
            Regular-way settlement for corporate securities is T+1 — older
            materials citing T+2 are out of date.
          </Callout>
        </div>
      </Section>

      <Section title="Stat Tiles">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Overall Progress" value="72%" hint="weighted by exam %" />
          <StatTile label="Readiness" value="Pass" tone="success" hint="last 3 tests avg 81%" />
          <StatTile label="Days to Exam" value="23" tone="brass" hint="Aug 3, 2026" />
          <StatTile label="Cards Due" value="14" tone="danger" hint="review today" />
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid max-w-2xl grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="text-sm font-semibold text-ink-900">Static card</div>
            <p className="mt-1 text-sm text-ink-600">Raised paper surface.</p>
          </Card>
          <Card hover className="cursor-pointer p-5">
            <div className="text-sm font-semibold text-ink-900">Hover card</div>
            <p className="mt-1 text-sm text-ink-600">Lifts on hover.</p>
          </Card>
        </div>
      </Section>
    </div>
  )
}

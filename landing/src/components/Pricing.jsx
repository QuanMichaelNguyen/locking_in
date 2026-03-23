const CWS_URL = 'https://chrome.google.com/webstore'

const features = [
  'Tab locking',
  'Reliable timer',
  'Navigation guard',
  'Emergency unlock',
  'Crash recovery',
  'Blocklist mode (block domains)',
  'Pomodoro / break cycles',
  'Session presets',
  'Focus history & streaks',
  'Password-protected unlock',
  'Scheduled sessions',
  'Sync across devices',
  'No account required',
]

export default function Pricing() {
  return (
    <section className="py-24 px-6 bg-[#0d0d0d]" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">100% free. No catch.</h2>
          <p className="text-neutral-500">Every feature, forever free. No account, no subscription, no upsell.</p>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="rounded-xl border border-green-800 bg-[#111] p-8 flex flex-col">
            <div className="text-sm text-green-400 font-semibold mb-2 uppercase tracking-wide">Everything included</div>
            <div className="text-5xl font-bold text-white mb-1">
              $0 <span className="text-lg text-neutral-500 font-normal">/forever</span>
            </div>
            <p className="text-neutral-500 text-sm mt-2 mb-6">Open source. Runs entirely in your browser.</p>
            <ul className="space-y-2.5 flex-1">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={CWS_URL}
              target="_blank" rel="noopener"
              className="mt-8 block text-center py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
            >
              Add to Chrome — Free
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

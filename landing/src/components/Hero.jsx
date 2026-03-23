const CWS_URL = 'https://chrome.google.com/webstore'

const SAFE_TABS = [
  { safe: true,  label: 'Gmail — Inbox' },
  { safe: true,  label: 'Notion — Sprint Board' },
  { safe: true,  label: 'GitHub — Pull Requests' },
  { safe: false, label: 'YouTube' },
  { safe: false, label: 'Reddit' },
]

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-950 text-green-400 border border-green-800 mb-6">
          Chrome Extension &mdash; Free
        </span>

        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Lock your tabs.<br />Own your focus.
        </h1>

        <p className="text-lg text-neutral-400 max-w-xl mx-auto mb-8">
          Pick the tabs you need. Set a timer. FocusTab Locker pins you to your
          work and blocks every distraction until the session ends.
          No willpower required.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <a
            href={CWS_URL}
            target="_blank" rel="noopener"
            className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
          >
            Add to Chrome — It's Free
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3 rounded-full border border-white/20 hover:border-white/40 text-neutral-300 hover:text-white font-semibold transition-colors"
          >
            See how it works
          </a>
        </div>

        <p className="text-xs text-neutral-600 mb-14">
          Works on Chrome &amp; Chromium browsers &middot; No account needed
        </p>

        {/* Popup preview */}
        <div className="mx-auto w-72 rounded-xl border border-white/10 bg-[#111] overflow-hidden shadow-2xl text-left">
          {/* title bar */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-neutral-500">FocusTab Locker</span>
          </div>
          {/* body */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10px] text-neutral-500 mb-1">Session duration (minutes)</p>
              <div className="px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-white/10 text-sm text-white">25</div>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 mb-1">Select your Safe Tabs</p>
              <ul className="rounded-md border border-white/10 overflow-hidden">
                {SAFE_TABS.map((t) => (
                  <li
                    key={t.label}
                    className={`flex items-center gap-2 px-3 py-2 text-xs border-b border-white/5 last:border-0 ${t.safe ? 'bg-green-950/40 text-green-300' : 'text-neutral-500'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${t.safe ? 'border-green-600 bg-green-700 text-white' : 'border-white/20'}`}>
                      {t.safe ? '✓' : ''}
                    </span>
                    {t.label}
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full py-2 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors">
              Start Session
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: '🔒',
    title: 'Tab Locking',
    desc: 'Pick your safe tabs, hit Start. Any attempt to switch away snaps you back instantly.',
  },
  {
    icon: '⏱️',
    title: 'Reliable Timer',
    desc: "Built on Chrome's Alarm API — the countdown keeps running even if you minimize the browser or close the popup.",
  },
  {
    icon: '🚫',
    title: 'Navigation Guard',
    desc: 'Typing a distracting URL into a safe tab? Blocked. You stay exactly where you need to be.',
  },
  {
    icon: '🚨',
    title: 'Emergency Hatch',
    desc: (
      <>
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-xs font-mono">Ctrl+Shift+P</kbd> any
        time for an instant unlock. Real emergencies don't wait.
      </>
    ),
  },
  {
    icon: '🔄',
    title: 'Crash Recovery',
    desc: 'Browser crash? Reopen Chrome and the session picks up right where it left off.',
  },
  {
    icon: '🔕',
    title: 'No Account. No Data.',
    desc: "Everything stays in your browser. We don't have a server. We can't see anything.",
  },
]

export default function Features() {
  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-neutral-500">
            Built to be invisible when you're working and instant when you need out.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-[#111] p-6 hover:border-green-800 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

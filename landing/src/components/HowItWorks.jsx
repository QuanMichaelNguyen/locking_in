const steps = [
  {
    num: '1',
    title: 'Install the extension',
    desc: 'One click from the Chrome Web Store. No signup, no permissions beyond your own tabs.',
  },
  {
    num: '2',
    title: 'Pick your Safe Tabs',
    desc: 'Open the popup, check the tabs you need for this session, and set a duration.',
  },
  {
    num: '3',
    title: 'Start and focus',
    desc: 'Hit Start. The extension locks you in and handles everything else automatically.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-[#0d0d0d]" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14">
          Up and running in 30 seconds
        </h2>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-white/10" />

          {steps.map((s) => (
            <div key={s.num} className="rounded-xl border border-white/10 bg-[#111] p-8 text-center relative">
              <div className="w-14 h-14 rounded-full bg-green-950 border border-green-800 text-green-400 text-xl font-bold flex items-center justify-center mx-auto mb-5">
                {s.num}
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

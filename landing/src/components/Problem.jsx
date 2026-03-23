const stats = [
  { num: '3 min',  label: 'average time before a browser distraction' },
  { num: '23 min', label: 'to regain deep focus after switching' },
  { num: '2 hrs',  label: 'of real work lost per day to tab hopping' },
]

export default function Problem() {
  return (
    <section className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug mb-5">
            Your brain is not the problem.<br />Your browser is.
          </h2>
          <p className="text-neutral-400 leading-relaxed mb-4">
            The average knowledge worker switches tasks every 3 minutes.
            Every YouTube rabbit hole, every Twitter scroll, every "just one Reddit thread"
            costs you 23 minutes of recovery time.
          </p>
          <p className="text-neutral-400 leading-relaxed">
            Productivity apps tell you to try harder. FocusTab Locker just{' '}
            <span className="text-white font-medium">closes the door</span>.
          </p>
        </div>

        <div className="grid gap-5">
          {stats.map((s) => (
            <div key={s.num} className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="text-4xl font-bold text-green-400 mb-1">{s.num}</div>
              <div className="text-sm text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const shots = [
  { label: 'Pick your safe tabs before the session starts',  placeholder: 'Tab selection UI' },
  { label: 'Live countdown while your session runs',          placeholder: 'Active countdown' },
  { label: 'A notification when your focus session ends',     placeholder: 'Session complete' },
]

export default function Screenshots() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14">
          See it in action
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {shots.map((s) => (
            <figure key={s.placeholder} className="group">
              {/* Replace this div with an <img> once you have real screenshots */}
              <div className="aspect-video rounded-xl border border-white/10 bg-[#111] flex items-center justify-center text-xs text-neutral-600 group-hover:border-green-800 transition-colors mb-3">
                {s.placeholder}
              </div>
              <figcaption className="text-sm text-neutral-500 text-center">{s.label}</figcaption>
            </figure>
          ))}
        </div>

        <p className="text-center text-xs text-neutral-700 mt-8">
          Add real screenshots by saving them to <code className="text-neutral-500">landing/public/screenshots/</code> and updating the src above.
        </p>
      </div>
    </section>
  )
}

const items = [
  'Trusted by focused people',
  '⭐⭐⭐⭐⭐  5.0 on Chrome Web Store',
  'Zero data collected',
  'Open source',
]

export default function ProofBar() {
  return (
    <div className="border-y border-white/10 bg-[#111] py-3 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-neutral-500">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6">
            {item}
            {i < items.length - 1 && <span className="text-white/10">|</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

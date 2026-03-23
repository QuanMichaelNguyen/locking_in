const CWS_URL = 'https://chrome.google.com/webstore'

export default function Footer() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#0d0d0d] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to actually get things done?
          </h2>
          <p className="text-neutral-500 mb-8">Free. No account. One click to install.</p>
          <a
            href={CWS_URL}
            target="_blank" rel="noopener"
            className="inline-block px-8 py-3.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold text-lg transition-colors"
          >
            Add to Chrome — Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <span className="flex items-center gap-2 font-medium text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            FocusTab Locker
          </span>
          <nav className="flex gap-5">
            <a href="#features" className="hover:text-neutral-300 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-neutral-300 transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-neutral-300 transition-colors">FAQ</a>
            <a href="https://github.com" target="_blank" rel="noopener" className="hover:text-neutral-300 transition-colors">GitHub</a>
            <a href="mailto:hello@focustablocker.com" className="hover:text-neutral-300 transition-colors">Contact</a>
          </nav>
          <span>&copy; 2026 FocusTab Locker</span>
        </div>
      </footer>
    </>
  )
}

const CWS_URL = 'https://chrome.google.com/webstore'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#4caf50]" />
          FocusTab Locker
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
          <a href="#features"     className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
          <a
            href={CWS_URL}
            target="_blank" rel="noopener"
            className="px-4 py-1.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
          >
            Add to Chrome — Free
          </a>
        </div>
      </div>
    </nav>
  )
}

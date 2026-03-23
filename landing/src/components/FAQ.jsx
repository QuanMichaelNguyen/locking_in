import { useState } from 'react'

const faqs = [
  {
    q: 'Does it work if I close the popup?',
    a: 'Yes. The extension runs as a background service worker. Closing the popup has no effect on the session.',
  },
  {
    q: 'What happens if my browser crashes?',
    a: 'When Chrome reopens, FocusTab Locker detects the active session in storage and immediately resumes enforcing.',
  },
  {
    q: 'Can I add more tabs after a session starts?',
    a: 'Not in the current version. Use the emergency unlock shortcut (Ctrl+Shift+P), adjust your tabs, and start a new session.',
  },
  {
    q: 'Does it block desktop apps or other browsers?',
    a: 'No. FocusTab Locker works within Chrome only. For OS-level blocking, consider pairing it with a tool like Cold Turkey.',
  },
  {
    q: 'What data does it collect?',
    a: 'None. All state is stored locally in your browser via chrome.storage.local. Nothing is sent anywhere.',
  },
  {
    q: 'Does it work on Firefox or Safari?',
    a: 'Not yet. A Firefox port is on the roadmap since the WebExtension API is compatible.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left text-white font-medium hover:text-green-400 transition-colors"
      >
        <span>{q}</span>
        <span className={`ml-4 text-neutral-500 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <p className="pb-5 text-sm text-neutral-500 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="py-24 px-6" id="faq">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Common questions
        </h2>
        <div>
          {faqs.map((f) => <FAQItem key={f.q} {...f} />)}
        </div>
      </div>
    </section>
  )
}

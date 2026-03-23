import Nav         from './components/Nav'
import Hero        from './components/Hero'
import ProofBar    from './components/ProofBar'
import Problem     from './components/Problem'
import Features    from './components/Features'
import HowItWorks  from './components/HowItWorks'
import Screenshots from './components/Screenshots'
import Pricing     from './components/Pricing'
import FAQ         from './components/FAQ'
import Footer      from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] font-sans">
      <Nav />
      <main>
        <Hero />
        <ProofBar />
        <Problem />
        <Features />
        <HowItWorks />
        <Screenshots />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}

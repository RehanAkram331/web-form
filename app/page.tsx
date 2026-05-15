'use client'

// app/page.tsx
import { useState } from 'react'
import ServiceRequestModal from '@/components/ServiceRequestModal'
import { Phone, Mail, Star, Shield, Clock, Wrench, Thermometer, Wind } from 'lucide-react'

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-display text-2xl text-white tracking-wider">ADVANCE</span>
            <span className="text-brand-red font-display text-2xl tracking-wider"> HVAC</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#why-us" className="hover:text-white transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+15191234567" className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Phone className="w-4 h-4" /> (519) 123-4567
            </a>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl
                         hover:bg-brand-red-dark transition-all hover:shadow-lg hover:shadow-red-900/30 active:scale-95"
            >
              Request Service
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px]" />
        </div>

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/30 text-brand-red-light rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red-light animate-pulse" />
              Licensed & Insured — Ontario
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display tracking-wide leading-none">
              COMFORT<br />
              <span className="text-brand-red">DELIVERED</span><br />
              FAST
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Expert heating & cooling service for homes and businesses across Kitchener-Waterloo. 
              Available 24/7 for emergencies.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 bg-brand-red text-white font-bold rounded-2xl text-base
                           hover:bg-brand-red-dark transition-all hover:shadow-xl hover:shadow-red-900/30
                           hover:-translate-y-0.5 active:scale-95"
              >
                Request Service Online →
              </button>
              <a
                href="tel:+15191234567"
                className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl text-base
                           hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call Us Now
              </a>
            </div>

            <div className="flex gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> 24/7 Emergency</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-brand-red" /> Fully Insured</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-brand-red" /> 500+ Reviews</span>
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Why homeowners choose us</p>
                {[
                  { icon: Thermometer, title: 'Precision Diagnostics', desc: 'We find the root cause, not just symptoms' },
                  { icon: Wrench, title: 'Same-Day Repairs', desc: 'Most repairs completed in a single visit' },
                  { icon: Wind, title: 'Certified Technicians', desc: 'TSSA licensed, fully background-checked' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-brand-red/20 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-brand-red-light" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-brand-red rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-white text-xs font-bold">4.9 ★ Rating</p>
                <p className="text-red-200 text-xs">500+ Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-brand-red text-xs font-bold uppercase tracking-widest mb-3">Our Services</p>
          <h2 className="text-4xl font-display tracking-wide">WHAT WE SERVICE</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            'Heating Systems', 'Air Conditioning', 'Heat Pumps', 'Ductless Mini-Splits',
            'Commercial HVAC', 'Emergency Service', 'Preventive Maintenance', 'Indoor Air Quality',
          ].map(service => (
            <button
              key={service}
              onClick={() => setModalOpen(true)}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left
                         hover:bg-white/10 hover:border-brand-red/40 transition-all group"
            >
              <div className="w-8 h-8 bg-brand-red/20 rounded-lg mb-3 group-hover:bg-brand-red/30 transition-colors" />
              <p className="font-semibold text-sm text-white">{service}</p>
              <p className="text-brand-red text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Request service →
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-brand-red rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
          <h2 className="relative text-3xl md:text-4xl font-display tracking-wide mb-4">
            NEED HVAC SERVICE TODAY?
          </h2>
          <p className="relative text-red-100 mb-8">We're ready when you are — request service online or give us a call.</p>
          <div className="relative flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-4 bg-white text-brand-red font-bold rounded-xl hover:bg-red-50 transition-colors"
            >
              Request Service Online
            </button>
            <a
              href="tel:+15191234567"
              className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4" /> (519) 123-4567
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="mb-3">
              <span className="font-display text-xl text-white">ADVANCE</span>
              <span className="text-brand-red font-display text-xl"> HVAC</span>
            </div>
            <p className="text-gray-500 text-sm">Kitchener-Waterloo's trusted heating and cooling experts.</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-white mb-3">Contact</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> (519) 123-4567</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> service@advancehvac.ca</div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm text-white mb-3">Hours</p>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Mon–Fri: 7:00 AM – 8:00 PM</p>
              <p>Sat: 8:00 AM – 5:00 PM</p>
              <p>Emergency: 24/7</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Advance Heating & Cooling. All rights reserved.
        </div>
      </footer>

      {/* ── Modal ── */}
      {modalOpen && <ServiceRequestModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}

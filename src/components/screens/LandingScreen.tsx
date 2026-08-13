import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { ResponsivePassPreview } from '../ResponsivePassPreview';

export function LandingScreen() {
  const setStep = useAppStore((s) => s.setStep);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: 'var(--color-jungle)' }}>

      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-10 py-5 border-b-2 border-dashed"
        style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}>
        <div className="font-display font-bold text-2xl tracking-tight" style={{ color: 'var(--color-secondary)' }}>
          BoardInGoa
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono-data text-xs hidden md:block px-2 py-1 border rounded"
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-outline-variant)', fontFamily: 'var(--font-mono)' }}>
            GOA, INDIA · 28–31 OCT 2026
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-6 md:px-16 py-16 max-w-7xl mx-auto w-full">

        {/* Left: Copy + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-6 w-full md:w-1/2"
        >
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full border"
            style={{ background: 'rgba(16,14,6,0.5)', borderColor: 'var(--color-outline-variant)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-secondary)' }} />
            <span className="font-mono-data text-xs font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
              LIVE CREDENTIALING
            </span>
          </div>

          <h1 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--color-on-surface)' }}>
            Get Your Boarding Pass<br />to HH Goa 2026.
          </h1>

          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1.125rem', lineHeight: '1.7', maxWidth: '30rem', fontFamily: 'var(--font-body)' }}>
            Upload a photo. Get your builder credential. No login, no server.
            Built for hackers, by hackers. ✈️
          </p>

          {/* CTA Button */}
          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97, y: 3 }}
              onClick={() => setStep('upload')}
              className="btn-tactile inline-flex items-center gap-3 px-8 py-4 border-2 font-display font-semibold text-lg tracking-tight"
              style={{
                background: 'var(--color-secondary)',
                borderColor: 'var(--color-secondary)',
                color: 'var(--color-on-secondary-fixed-variant)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Start Check-In
              <span style={{ fontSize: '1.25rem' }}>→</span>
            </motion.button>
          </div>

          {/* Brand data points */}
          <div className="flex flex-wrap gap-x-10 gap-y-3 mt-6 pt-6 border-t-2 border-dashed"
            style={{ borderColor: 'var(--color-outline-variant)' }}>
            {[
              ['LOCATION', 'GOA, INDIA'],
              ['DATE', '28–31 OCT 2026'],
              ['MANTRA', 'LESS NOISE. MORE SIGNAL.'],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="font-mono-data text-xs font-bold tracking-widest uppercase"
                  style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                <span className="font-mono-data font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{val}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Floating Ticket */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full md:w-1/2 flex justify-center items-center relative"
        >
          {/* Glow backdrop */}
          <div className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(160,211,166,0.12)' }} />

          {/* The Ticket */}
          <div className="ticket-tilt relative w-full max-w-[420px]">
             <ResponsivePassPreview className="shadow-2xl" style={{ pointerEvents: 'none' }} />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center px-6 py-4 border-t-2 border-dashed"
        style={{ borderColor: 'var(--color-outline-variant)', background: 'rgba(34,32,23,0.5)' }}>
        <span className="font-mono-data text-xs" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
          © 2026 HH GOA
        </span>
        <span className="font-mono-data text-xs" style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>
          CREDIT: 2:47 PM STUDIO
        </span>
      </footer>

      {/* Bottom wave */}
      <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none animate-wave overflow-hidden"
        style={{ opacity: 0.15, zIndex: 0 }}>
        <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none"
          style={{ fill: 'var(--color-primary)' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.29,19.34,103.54,39.38,158.62,49.25,212.78,58.93,267.75,66.39,321.39,56.44Z" />
        </svg>
      </div>
    </div>
  );
}

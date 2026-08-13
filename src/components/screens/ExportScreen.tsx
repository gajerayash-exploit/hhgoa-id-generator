import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { useAppStore } from '../../store/useAppStore';
import { drawCard, CARD_DIMS } from '../../lib/composite';

const CAPTION = 'Just generated my official @247pmstudio Hacker House Goa 2026 builder pass! 🌴⚡ #FrameInGoa';

function Confetti() {
  const colors = ['#D9A441','#2DD4BF','#a0d3a6','#F5EFE0','#1E4D2B','#f5bd58'];
  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
      {Array.from({ length: 48 }).map((_, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}px`,
            background: colors[Math.floor(Math.random() * colors.length)],
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDuration: `${1.5 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ExportScreen() {
  // Use getState() inside callbacks (no reactivity needed after initial render)
  const setStep   = useAppStore((s) => s.setStep);
  const reset     = useAppStore((s) => s.reset);
  const format    = useAppStore((s) => s.format);
  const skin      = useAppStore((s) => s.skin);
  const squadMode = useAppStore((s) => s.squadMode);
  const name      = useAppStore((s) => s.name);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);

  const renderFinalCard = useCallback(async () => {
    if (!canvasRef.current) return;
    setGenerating(true);
    const s = useAppStore.getState();
    try {
      await drawCard(canvasRef.current, {
        photoSrc:     s.photoSrc,
        name:         s.name,
        stack:        s.stack,
        builderClass: s.builderClass,
        skin:         s.skin,
        format:       s.format,
        panX:         s.panX,
        panY:         s.panY,
        scale:        s.scale,
        squadMode:    s.squadMode,
        teammates:    s.teammates,
      });
      setDone(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } finally {
      setGenerating(false);
    }
  }, []); // stable - reads fresh state inside

  useEffect(() => {
    renderFinalCard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getBlob = (): Promise<Blob> =>
    new Promise((res, rej) => {
      if (!canvasRef.current) return rej(new Error('No canvas'));
      canvasRef.current.toBlob((b) => b ? res(b) : rej(new Error('toBlob failed')), 'image/png');
    });

  const slug = (name || 'builder').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `hhgoa-builder-pass-${slug}.png`;

  const handleDownload = async () => {
    const blob = await getBlob();
    saveAs(blob, filename);
  };

  const handleShareX = async () => {
    const blob = await getBlob();
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ text: CAPTION, files: [file] });
        return;
      } catch { /* fall through */ }
    }
    // Desktop fallback: open X intent
    setShareHint('Download the image first, then attach it manually to your X post!');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(CAPTION)}`;
    window.open(url, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hhgoa.com')}&summary=${encodeURIComponent(CAPTION)}`;
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CAPTION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dims = squadMode ? CARD_DIMS.squad
    : format === 'pfp' ? CARD_DIMS.pfp : CARD_DIMS.builderId;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-jungle)' }}>

      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b-2 border-dashed"
        style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}>
        <span className="font-display font-bold text-xl" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-display)' }}>
          BoardInGoa
        </span>
        <button onClick={() => setStep('customize')}
          className="font-mono-data text-xs hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
          ← Edit
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-10 w-full max-w-6xl mx-auto px-6 py-10">

        {/* Canvas preview */}
        <section className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h1 className="font-display font-bold text-2xl"
              style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
              Your Builder Pass
            </h1>
            <span className="font-mono-data text-xs"
              style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
              {dims.w}×{dims.h}px
            </span>
          </div>

          <div className="relative">
            {generating && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-lg"
                style={{ background: 'rgba(21,19,11,0.7)', backdropFilter: 'blur(8px)' }}>
                <div className="w-12 h-12 border-4 rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-secondary)', borderTopColor: 'transparent' }} />
                <p className="font-mono-data font-bold" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Compositing card...
                </p>
              </div>
            )}
            <motion.canvas
              ref={canvasRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: done ? 1 : 0.95, opacity: done ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full h-auto rounded-lg card-glow"
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          </div>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 justify-center font-mono-data text-xs"
              style={{ color: 'var(--color-tertiary)', fontFamily: 'var(--font-mono)' }}>
              <span className="animate-ping-once">✦</span>
              BOARDING PASS GENERATED — GOA AWAITS
              <span className="animate-ping-once">✦</span>
            </motion.div>
          )}
        </section>

        {/* Actions panel */}
        <section className="w-full lg:w-2/5 flex flex-col gap-6">

          {/* Caption preview */}
          <div className="flex flex-col gap-3">
            <span className="font-mono-data text-xs font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-on-primary-container)', fontFamily: 'var(--font-mono)' }}>
              SHARE CAPTION
            </span>
            <div className="p-4 border-2 border-dashed relative"
              style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface-container)', borderRadius: '4px' }}>
              <p className="font-mono-data text-sm leading-relaxed pr-8"
                style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>
                {CAPTION}
              </p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="absolute top-3 right-3 text-xs px-2 py-1 border font-mono-data"
                style={{
                  borderColor: 'var(--color-outline-variant)',
                  color: copied ? 'var(--color-tertiary)' : 'var(--color-on-surface-variant)',
                  background: 'var(--color-surface-container-high)',
                  fontFamily: 'var(--font-mono)',
                }}>
                {copied ? '✓ Copied' : 'Copy'}
              </motion.button>
            </div>
          </div>

          {/* Share hint */}
          <AnimatePresence>
            {shareHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 border-2 border-dashed font-mono-data text-xs"
                style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                💡 {shareHint}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ y: 2, scale: 0.98 }}
              disabled={!done}
              onClick={handleDownload}
              className="btn-tactile w-full py-4 flex items-center justify-center gap-3 font-display font-semibold text-lg border-2 disabled:opacity-40"
              style={{
                background: 'var(--color-secondary)',
                borderColor: 'var(--color-secondary)',
                color: 'var(--color-on-secondary-fixed-variant)',
                fontFamily: 'var(--font-display)',
              }}>
              ↓ Download PNG
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ y: 2, scale: 0.98 }}
              disabled={!done}
              onClick={handleShareX}
              className="w-full py-4 flex items-center justify-center gap-3 font-display font-semibold border-2 disabled:opacity-40 transition-all hover:opacity-90"
              style={{
                background: 'transparent',
                borderColor: 'var(--color-on-surface)',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-display)',
              }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share to X
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ y: 2, scale: 0.98 }}
              disabled={!done}
              onClick={handleShareLinkedIn}
              className="w-full py-4 flex items-center justify-center gap-3 font-display font-semibold border-2 disabled:opacity-40 transition-all hover:opacity-90"
              style={{
                background: 'transparent',
                borderColor: 'var(--color-tertiary)',
                color: 'var(--color-tertiary)',
                fontFamily: 'var(--font-display)',
              }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share to LinkedIn
            </motion.button>
          </div>

          {/* Redo */}
          <button onClick={() => { reset(); }}
            className="font-mono-data text-xs text-center hover:opacity-80 transition-opacity mt-2"
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
            ← Start over
          </button>

          {/* Specs */}
          <div className="p-4 border border-dashed mt-2"
            style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface-container)' }}>
            <p className="font-mono-data text-xs font-bold mb-2"
              style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>EXPORT SPEC</p>
            {[
              ['FORMAT', squadMode ? 'SQUAD PASS' : format === 'pfp' ? 'PFP' : 'BUILDER ID'],
              ['DIMENSIONS', `${dims.w}×${dims.h}px`],
              ['FILTER', skin.toUpperCase()],
              ['HASHTAG', '#FrameInGoa'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-dashed"
                style={{ borderColor: 'var(--color-outline-variant)' }}>
                <span className="font-mono-data text-xs" style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>{k}</span>
                <span className="font-mono-data text-xs font-bold" style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-mono)' }}>{v}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

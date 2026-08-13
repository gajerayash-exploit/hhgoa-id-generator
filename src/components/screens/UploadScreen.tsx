import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAppStore, type CardFormat } from '../../store/useAppStore';
import { processImageFile } from '../../lib/heic';

export function UploadScreen() {
  const setStep   = useAppStore((s) => s.setStep);
  const setPhoto  = useAppStore((s) => s.setPhoto);
  const setFormat = useAppStore((s) => s.setFormat);
  const format    = useAppStore((s) => s.format);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const src = await processImageFile(file);
      setPhoto(src);
      setStep('customize');
    } catch (e) {
      console.error(e);
      setError('Failed to process image. Please try a JPG or PNG.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropAccepted = useCallback(([file]: File[]) => {
    handleFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropRejected = useCallback(() => {
    setError('Invalid file. Use JPG, PNG, or HEIC.');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.heif'] },
    maxFiles: 1,
    onDropAccepted,
    onDropRejected,
    disabled: loading,
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-jungle)' }}>

      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-10 py-5 border-b-2 border-dashed"
        style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>✈</span>
          <span className="font-display font-bold text-2xl tracking-tight"
            style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-display)' }}>BoardInGoa</span>
        </div>
        <button onClick={() => setStep('landing')}
          className="font-mono-data text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
          ← Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto px-6 py-10 gap-8">

        {/* Devanagari watermark */}
        <div className="fixed top-1/4 right-8 select-none pointer-events-none"
          style={{ fontSize: '10rem', fontWeight: 900, color: 'rgba(160,211,166,0.06)', transform: 'rotate(-12deg)', zIndex: 0, fontFamily: 'var(--font-display)' }}>
          गोवा
        </div>

        <div className="relative z-10 w-full">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-tertiary)' }} />
            <span className="font-mono-data text-xs font-bold tracking-wider uppercase"
              style={{ color: 'var(--color-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Check-In: Step 1 of 3
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>
            Select Your Format
          </h1>
          <p className="mb-8" style={{ color: 'var(--color-on-surface-variant)' }}>
            Choose how you want to be presented at HH Goa 2026.
          </p>

          {/* Format Toggle */}
          <div className="grid grid-cols-2 gap-5 mb-10">
            {([
              { id: 'pfp' as CardFormat, label: 'PFP Frame', sub: 'SQUARE / MINIMAL', dims: '1080 × 1080', icon: '👤' },
              { id: 'builderId' as CardFormat, label: 'Builder ID', sub: 'PORTRAIT / DETAILED', dims: '1080 × 1350', icon: '🪪' },
            ]).map((opt) => (
              <motion.button
                key={opt.id}
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
                onClick={() => setFormat(opt.id)}
                className="paper-grain relative p-5 flex flex-col items-center gap-4 border-2 cursor-pointer rounded-xl"
                style={{
                  borderColor: format === opt.id ? 'var(--color-tertiary)' : 'var(--color-outline-variant)',
                  boxShadow: format === opt.id ? '0 0 0 1px var(--color-tertiary)' : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                {format === opt.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--color-tertiary)', color: 'var(--color-on-tertiary)' }}>✓</div>
                )}

                <div className={`border-2 border-dashed flex flex-col items-center justify-center bg-white/5 relative overflow-hidden ${opt.id === 'pfp' ? 'w-28 h-28' : 'w-20 h-28'}`}
                  style={{ borderColor: format === opt.id ? 'var(--color-tertiary)' : 'var(--color-outline-variant)' }}>
                  <span style={{ fontSize: '2rem', color: format === opt.id ? 'var(--color-tertiary)' : 'var(--color-outline)' }}>{opt.icon}</span>
                  {opt.id === 'builderId' && (
                    <div className="absolute bottom-0 w-full py-0.5 border-t-2 border-dashed text-center"
                      style={{ borderColor: 'var(--color-outline-variant)' }}>
                      <span style={{ fontSize: '6px', color: 'var(--color-surface-container-lowest)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>BUILDER ID</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="font-display font-semibold text-base"
                    style={{ color: 'var(--color-surface-container-lowest)', fontFamily: 'var(--font-display)' }}>{opt.label}</h3>
                  <p className="text-xs mt-0.5"
                    style={{ color: format === opt.id ? 'var(--color-tertiary-container)' : 'rgba(16,14,6,0.5)', fontFamily: 'var(--font-mono)' }}>{opt.sub}</p>
                  <p className="text-xs mt-1"
                    style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>{opt.dims}</p>
                </div>

                <div className="absolute -left-1 top-1/2 w-2 h-4 rounded-r-full" style={{ background: 'var(--color-jungle)' }} />
                <div className="absolute -right-1 top-1/2 w-2 h-4 rounded-l-full" style={{ background: 'var(--color-jungle)' }} />
              </motion.button>
            ))}
          </div>

          {/* Upload Zone */}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
              ATTACHMENT_MODULE
            </div>

            <div {...getRootProps()} className="paper-grain rounded-xl p-1 cursor-pointer">
              <div className="border-2 border-dashed rounded-lg h-52 flex flex-col items-center justify-center gap-4 relative overflow-hidden"
                style={{
                  borderColor: isDragActive ? 'var(--color-secondary)' : 'rgba(217,164,65,0.5)',
                  background: isDragActive ? 'rgba(245,189,88,0.05)' : 'transparent',
                  transition: 'border-color 0.15s, background 0.15s',
                }}>

                <input {...getInputProps()} />

                {/* Corner decorations */}
                {(['top-0 left-0 border-r-2 border-b-2 rounded-br-lg',
                   'top-0 right-0 border-l-2 border-b-2 rounded-bl-lg',
                   'bottom-0 left-0 border-r-2 border-t-2 rounded-tr-lg',
                   'bottom-0 right-0 border-l-2 border-t-2 rounded-tl-lg'] as const).map((pos, i) => (
                  <div key={i} className={`absolute w-6 h-6 ${pos}`}
                    style={{ borderColor: 'rgba(217,164,65,0.35)' }} />
                ))}

                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 animate-spin"
                      style={{ borderColor: 'var(--color-secondary)', borderTopColor: 'transparent' }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Converting...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                      style={{ background: 'rgba(217,164,65,0.1)' }}>
                      🧳
                    </div>
                    <div className="text-center px-4">
                      <p className="font-display font-semibold text-lg mb-1"
                        style={{ color: 'var(--color-surface-container-lowest)', fontFamily: 'var(--font-display)' }}>
                        {isDragActive ? 'Drop it here!' : 'Tap or drag your photo'}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(16,14,6,0.6)', fontFamily: 'var(--font-mono)' }}>
                        JPG, PNG, HEIC — MAX 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-center" style={{ color: '#ffb4ab', fontFamily: 'var(--font-mono)' }}>{error}</p>
            )}

            <p className="text-xs text-center mt-3"
              style={{ color: 'rgba(193,201,190,0.5)', fontFamily: 'var(--font-mono)' }}>
              // nothing uploaded until you share — 100% client-side
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

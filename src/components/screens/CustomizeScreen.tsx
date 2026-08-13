import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAppStore, type SkinFilter } from '../../store/useAppStore';
import { processImageFile } from '../../lib/heic';
import { ResponsivePassPreview } from '../ResponsivePassPreview';


const SKINS: { id: SkinFilter; label: string; emoji: string; desc: string }[] = [
  { id: 'raw',    label: 'RAW',    emoji: '🪵', desc: 'Original' },
  { id: 'sunset', label: 'SUNSET', emoji: '🌅', desc: 'Warm grade' },
  { id: 'glitch', label: 'GLITCH', emoji: '⚡', desc: 'Chromatic' },
  { id: 'jungle', label: 'JUNGLE', emoji: '🌿', desc: 'Duotone' },
  { id: 'cyber',  label: 'CYBER',  emoji: '🔷', desc: 'Chrome' },
  { id: '8bit',   label: '8-BIT',  emoji: '🕹️', desc: 'Pixelated' },
];

export function CustomizeScreen() {
  // Individual primitive selectors — avoids recreating new object reference each render
  const setStep        = useAppStore((s) => s.setStep);
  const setSkin        = useAppStore((s) => s.setSkin);
  const setName        = useAppStore((s) => s.setName);
  const setStack       = useAppStore((s) => s.setStack);
  const setScale       = useAppStore((s) => s.setScale);
  const setPan         = useAppStore((s) => s.setPan);
  const setSquadMode   = useAppStore((s) => s.setSquadMode);
  const addTeammate    = useAppStore((s) => s.addTeammate);
  const removeTeammate = useAppStore((s) => s.removeTeammate);
  const updateTeammate = useAppStore((s) => s.updateTeammate);
  const rerollBC       = useAppStore((s) => s.rerollBuilderClass);

  const name         = useAppStore((s) => s.name);
  const stack        = useAppStore((s) => s.stack);
  const builderClass = useAppStore((s) => s.builderClass);
  const skin         = useAppStore((s) => s.skin);
  const scale        = useAppStore((s) => s.scale);
  const panX         = useAppStore((s) => s.panX);
  const panY         = useAppStore((s) => s.panY);
  const squadMode    = useAppStore((s) => s.squadMode);
  const teammates    = useAppStore((s) => s.teammates);
  const format       = useAppStore((s) => s.format);

  const [rerolling,   setRerolling]   = useState(false);
  const [tmUploadLoading, setTmUploadLoading] = useState<string | null>(null);

  // No need for debounced render since we use React DOM directly
  useEffect(() => {
    // any side effects if needed
  }, []);

  // Canvas pan
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const { panX: px, panY: py, scale: sc } = useAppStore.getState();
    const currentContainerWidth = (e.currentTarget as HTMLElement).getBoundingClientRect().width;
    const dx = (e.clientX - lastPos.current.x) / (currentContainerWidth * sc);
    const dy = (e.clientY - lastPos.current.y) / (currentContainerWidth * (1350/1080) * sc);
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(px + dx, py + dy);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleReroll = () => {
    setRerolling(true);
    rerollBC();
    setTimeout(() => setRerolling(false), 400);
  };

  const handleTmPhoto = async (id: string, file: File) => {
    setTmUploadLoading(id);
    try {
      const src = await processImageFile(file);
      updateTeammate(id, { photoSrc: src });
    } catch {
      alert('Failed to process teammate photo.');
    } finally {
      setTmUploadLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-jungle)' }}>

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b-2 border-dashed sticky top-0 z-40"
        style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}>
        <span className="font-display font-bold text-xl" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-display)' }}>
          BoardInGoa
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono-data text-xs animate-pulse" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
            LIVE PREVIEW
          </span>
          <button onClick={() => setStep('upload')}
            className="font-mono-data text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>← Back</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto px-6 py-10">

        {/* ── Left: Live Preview ── */}
        <section className="w-full lg:w-[52%] lg:sticky lg:top-24 h-fit flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h1 className="font-display font-bold text-2xl"
              style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Digital Artifact</h1>
            <span className="font-mono-data text-xs" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
              Step 2 of 3
            </span>
          </div>

          <ResponsivePassPreview 
            className="shadow-2xl card-glow"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none', cursor: 'grab' }}
          />

          <p className="font-mono-data text-xs text-center"
            style={{ color: 'rgba(193,201,190,0.6)', fontFamily: 'var(--font-mono)' }}>
            Drag to reposition photo · Scroll wheel to zoom
          </p>
        </section>

        {/* ── Right: Form ── */}
        <section className="w-full lg:w-[48%] flex flex-col gap-6">

          {/* Name */}
          <Field label="PASSENGER NAME">
            <input
              type="text"
              placeholder="ENTER FULL NAME"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 outline-none font-mono-data"
              style={{
                background: 'var(--color-inverse-surface)',
                color: 'var(--color-inverse-on-surface)',
                borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--color-outline-variant)',
                fontFamily: 'var(--font-mono)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-secondary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-outline-variant)'}
            />
          </Field>

          {/* Stack */}
          <Field label="STACK / SPECIALTY">
            <input
              type="text"
              placeholder="e.g. RUST / WEBGL / FULL-STACK"
              value={stack}
              maxLength={30}
              onChange={(e) => setStack(e.target.value)}
              className="w-full px-4 py-3 outline-none font-mono-data"
              style={{
                background: 'var(--color-inverse-surface)',
                color: 'var(--color-inverse-on-surface)',
                borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--color-outline-variant)',
                fontFamily: 'var(--font-mono)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-secondary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-outline-variant)'}
            />
          </Field>

          {/* Builder Class */}
          <Field label={<>BUILDER CLASS <span style={{ color: 'var(--color-secondary)' }}>(REROLL)</span></>}>
            <div className="flex gap-2">
              <input
                readOnly
                value={builderClass}
                className="flex-1 px-4 py-3 font-mono-data cursor-not-allowed opacity-80"
                style={{
                  background: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface)',
                  borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--color-outline-variant)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleReroll}
                className="px-4 py-3 border-2 flex items-center justify-center min-w-[52px]"
                style={{
                  background: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                <span className={rerolling ? 'animate-spin-once inline-block' : 'inline-block'} style={{ fontSize: '1.25rem' }}>
                  🎲
                </span>
              </motion.button>
            </div>
          </Field>

          <hr style={{ borderTop: '2px dashed var(--color-outline-variant)', opacity: 0.5 }} />

          {/* Deployment Mode */}
          <Field label="DEPLOYMENT MODE">
            <div className="flex border-2 p-1 gap-1"
              style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface-container-high)' }}>
              {[
                { val: false, label: 'SOLO' },
                { val: true, label: 'SQUAD' },
              ].map(({ val, label }) => (
                <button
                  key={label}
                  onClick={() => setSquadMode(val)}
                  className="flex-1 py-3 text-center font-mono-data font-bold text-xs tracking-widest transition-all border-2"
                  style={{
                    background: squadMode === val ? 'var(--color-secondary)' : 'transparent',
                    color: squadMode === val ? 'var(--color-on-secondary)' : 'var(--color-on-surface-variant)',
                    borderColor: squadMode === val ? 'var(--color-secondary)' : 'transparent',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          {/* Squad member slots */}
          {squadMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-4">
              {teammates.map((tm, idx) => (
                <TeammateSlot
                  key={tm.id}
                  tm={tm}
                  idx={idx}
                  loading={tmUploadLoading === tm.id}
                  onRemove={() => removeTeammate(tm.id)}
                  onPhotoFile={(f) => handleTmPhoto(tm.id, f)}
                  onNameChange={(n) => updateTeammate(tm.id, { name: n })}
                  onStackChange={(s) => updateTeammate(tm.id, { stack: s })}
                />
              ))}
              {teammates.length < 2 && (
                <button onClick={addTeammate}
                  className="py-3 border-2 border-dashed font-mono-data text-xs font-bold tracking-widest uppercase transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                  + ADD TEAMMATE ({teammates.length + 1}/2 added)
                </button>
              )}
            </motion.div>
          )}

          {/* Skin picker */}
          <Field label={<>AESTHETIC / FARE CLASS <span className="font-mono-data text-xs" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>{SKINS.findIndex(s => s.id === skin) + 1}/6</span></>}>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll">
              {SKINS.map((s) => (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSkin(s.id)}
                  className="flex-shrink-0 w-[100px] h-[130px] flex flex-col justify-end p-2 border-2 cursor-pointer relative transition-all"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: skin === s.id ? 'var(--color-gold)' : 'var(--color-outline-variant)',
                    boxShadow: skin === s.id ? '3px 3px 0 0 var(--color-gold-dim)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50">
                    {s.emoji}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="relative z-10 font-mono-data font-bold text-xs"
                    style={{
                      color: skin === s.id ? 'var(--color-gold)' : 'var(--color-on-surface)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                    {s.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </Field>

          {/* Zoom */}
          <Field label="PHOTO ZOOM">
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: 'var(--color-secondary)' }}
            />
            <div className="flex justify-between mt-1">
              <span className="font-mono-data text-xs" style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>0.5×</span>
              <span className="font-mono-data text-xs" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>{scale.toFixed(2)}×</span>
              <span className="font-mono-data text-xs" style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-mono)' }}>3×</span>
            </div>
          </Field>

        </section>
      </main>

      {/* Sticky footer CTA */}
      <footer className="sticky bottom-0 w-full px-6 py-4 border-t-2 border-dashed flex justify-center z-50"
        style={{ borderColor: 'rgba(65,73,65,0.4)', background: 'rgba(21,19,11,0.95)', backdropFilter: 'blur(12px)' }}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98, y: 2 }}
          onClick={() => setStep('export')}
          className="btn-tactile w-full max-w-md flex items-center justify-center gap-3 py-4 font-display font-semibold text-lg border-2"
          style={{
            background: 'var(--color-secondary)',
            borderColor: 'var(--color-secondary)',
            color: 'var(--color-on-secondary-fixed-variant)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Generate Pass →
        </motion.button>
      </footer>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono-data text-xs font-bold tracking-widest uppercase"
        style={{ color: 'var(--color-on-primary-container)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Teammate Slot ────────────────────────────────────────────────────────────
function TeammateSlot({
  tm, idx, loading, onRemove, onPhotoFile, onNameChange, onStackChange,
}: {
  tm: { id: string; photoSrc: string | null; name: string; stack: string };
  idx: number;
  loading: boolean;
  onRemove: () => void;
  onPhotoFile: (f: File) => void;
  onNameChange: (n: string) => void;
  onStackChange: (s: string) => void;
}) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg','.jpeg','.png','.heic'] },
    maxFiles: 1,
    onDropAccepted: ([f]) => onPhotoFile(f),
    disabled: loading,
  });

  return (
    <div className="border-2 p-4 flex flex-col gap-3"
      style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface-container)' }}>
      <div className="flex justify-between items-center">
        <span className="font-mono-data text-xs font-bold"
          style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>TEAMMATE {idx + 1}</span>
        <button onClick={onRemove} className="text-xs hover:opacity-70" style={{ color: 'var(--color-on-surface-variant)' }}>× Remove</button>
      </div>
      <div {...getRootProps()}
        className="h-20 border-2 border-dashed flex items-center justify-center cursor-pointer relative overflow-hidden"
        style={{ borderColor: 'var(--color-outline-variant)' }}>
        <input {...getInputProps()} />
        {tm.photoSrc ? (
          <img src={tm.photoSrc} alt="teammate" className="h-full w-full object-cover" />
        ) : loading ? (
          <div className="w-6 h-6 border-2 animate-spin rounded-full"
            style={{ borderColor: 'var(--color-secondary)', borderTopColor: 'transparent' }} />
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-outline)' }}>Tap to upload photo</span>
        )}
      </div>
      <input type="text" placeholder="NAME" value={tm.name} maxLength={24}
        onChange={(e) => onNameChange(e.target.value)}
        className="px-3 py-2 w-full font-mono-data text-sm outline-none"
        style={{ background: 'var(--color-inverse-surface)', color: 'var(--color-inverse-on-surface)', borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--color-outline-variant)', fontFamily: 'var(--font-mono)' }}
      />
      <input type="text" placeholder="STACK" value={tm.stack} maxLength={24}
        onChange={(e) => onStackChange(e.target.value)}
        className="px-3 py-2 w-full font-mono-data text-sm outline-none"
        style={{ background: 'var(--color-inverse-surface)', color: 'var(--color-inverse-on-surface)', borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--color-outline-variant)', fontFamily: 'var(--font-mono)' }}
      />
    </div>
  );
}

import { forwardRef, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useAppStore } from '../store/useAppStore';

// We need a helper to generate the barcode. Or we can just draw one using divs.
function Barcode() {
  const bars = [5,2,8,3,6,2,9,1,4,7,2,5,8,3,2,6,4,1,7,3,5,2,8,6,1,4,3,7,2,5];
  return (
    <div className="flex h-full w-full opacity-80" style={{ gap: '1px' }}>
      {bars.map((w, i) => (
        <div key={i} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
      ))}
    </div>
  );
}

export const PassTemplate = forwardRef<HTMLDivElement, object>((_, ref) => {
  const { photoSrc, name, stack, builderClass, panX, panY, scale } = useAppStore();
  const qrRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toDataURL('https://hhgoa.com', { margin: 0, color: { dark: '#015B37', light: '#0000' } })
        .then(url => {
          if (qrRef.current) qrRef.current.src = url;
        });
    }
  }, []);

  const displayName = (name || 'YASH').toUpperCase();
  const displayStack = (stack || 'AI').toUpperCase();
  const displayClass = (builderClass || 'TERMINAL WIZARD').toUpperCase();

  return (
    <div
      ref={ref}
      // Fixed aspect ratio box exactly matching 1080x1350
      style={{ width: '1080px', height: '1350px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-cream)' }}
    >
      {/* Background Image */}
      <img
        src="/goa_pass_bg.jpg"
        alt="Pass Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Typography Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center">
        
        {/* HACKER GOA HOUSE Title */}
        <div className="absolute top-[220px] w-full text-center flex items-center justify-center gap-6 drop-shadow-md">
          <span className="text-7xl font-bold" style={{ color: 'var(--color-ocean)', fontFamily: 'Georgia, serif', transform: 'scaleY(1.4)', letterSpacing: '0.05em' }}>HACKER</span>
          <span className="text-8xl font-bold" style={{ color: 'var(--color-neon)', fontFamily: 'Georgia, serif', transform: 'rotate(-5deg) translateY(-5px)', textShadow: `3px 3px 0px var(--color-gold)` }}>गोवा</span>
          <span className="text-7xl font-bold" style={{ color: 'var(--color-ocean)', fontFamily: 'Georgia, serif', transform: 'scaleY(1.4)', letterSpacing: '0.05em' }}>HOUSE</span>
        </div>

        {/* Profile Photo Hole */}
        <div 
          className="absolute rounded-full overflow-hidden border-[12px] shadow-2xl"
          style={{
            top: '380px', 
            left: '50%',
            transform: 'translateX(-50%)',
            width: '450px', 
            height: '450px',
            borderColor: 'var(--color-gold)',
            background: 'var(--color-ocean)'
          }}
        >
          {photoSrc ? (
            <img 
              src={photoSrc} 
              className="w-full h-full object-cover" 
              style={{
                objectPosition: `${50 - panX * 100}% ${50 - panY * 100}%`,
                transform: `scale(${scale})`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-50">
              <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          )}
        </div>

        {/* Name Pill */}
        <div className="absolute top-[850px] flex flex-col items-center w-[800px]">
          <div className="bg-var border-4 rounded-[40px] px-16 py-4 w-full shadow-[6px_6px_0px_0px_var(--color-gold)] relative overflow-hidden flex justify-between items-center transform -rotate-1"
            style={{ background: 'var(--color-cream)', borderColor: 'var(--color-ocean)'}}>
            {/* Corner Stars */}
            <span className="text-[#FF007F] text-3xl">✦</span>
            <span className="text-5xl font-black tracking-widest text-[#015B37] mx-auto font-display">{displayName}</span>
            <span className="text-[#FF007F] text-3xl">✦</span>
            
            {/* Outline highlight effect */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-[#FF007F]" />
          </div>

          {/* Stack Banner */}
          <div className="bg-var w-[500px] h-16 mt-[-10px] rounded-b-xl flex items-center justify-center shadow-md relative z-[-1]"
            style={{ background: 'var(--color-gold)', borderColor: 'var(--color-ocean)', borderStyle: 'solid', borderWidth: '0 4px 4px 0' }}>
             <span className="absolute left-6 text-black text-2xl font-bold">⚡</span>
             <span className="text-3xl font-black" style={{ color: 'var(--color-neon)', letterSpacing: '0.12em' }}>{displayStack}</span>
             <span className="absolute right-6 text-black text-2xl font-bold">⚡</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="absolute top-[1000px] w-full px-20 flex justify-between font-mono">
          {/* Builder Class */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-widest text-[#015B37] mb-2 bg-[#FFE600] px-2 py-1 rounded">✦ BUILDER CLASS ✦</span>
            <span className="text-2xl font-black text-[#FF007F] tracking-widest text-center w-40 leading-tight mt-2">{displayClass}</span>
            {/* QR Code */}
            <div className="mt-4 p-2 rounded-lg" style={{ background: 'var(--color-cream)', boxShadow: '4px 4px 0px 0px var(--color-ocean)', border: '2px solid var(--color-ocean)' }}>
              <img ref={qrRef} className="w-24 h-24" />
            </div>
          </div>

          {/* Beach Bag */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-widest text-[#FAF6EE] mb-4 bg-[#FF007F] px-4 py-1 rounded-full">BEACH BAG</span>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-[#FAF6EE] px-3 py-2 rounded-lg border-2 border-[#015B37] shadow-[3px_3px_0px_0px_#015B37]">
                <span className="text-2xl">🥥</span>
                <span className="font-bold text-md text-[#015B37]">COCONUT</span>
              </div>
              <div className="flex items-center gap-4 bg-[#015B37] px-3 py-2 rounded-lg border-2 border-[#015B37] shadow-[3px_3px_0px_0px_#FFE600]">
                <span className="font-bold text-xl text-[#FFE600]">&lt;/&gt;</span>
                <span className="font-bold text-md text-white">VS CODE</span>
              </div>
              <div className="flex items-center gap-4 bg-[#FAF6EE] px-3 py-2 rounded-lg border-2 border-[#015B37] shadow-[3px_3px_0px_0px_#015B37]">
                <span className="text-2xl">🎧</span>
                <span className="font-bold text-md text-[#015B37]">LO-FI BEATS</span>
              </div>
            </div>
          </div>

          {/* Currently Shipping */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-widest text-[#015B37] mb-2 bg-[#FFE600] px-2 py-1 rounded">✦ SHIPPING ✦</span>
            <span className="text-2xl font-black text-[#FF007F] tracking-widest text-center w-48 leading-tight mt-2">BUILDING<br/>THE FUTURE</span>
            
            <div className="mt-8 flex flex-col items-center w-full p-3 rounded-lg transform rotate-2" style={{ background: 'var(--color-cream)', border: '2px solid var(--color-ocean)', boxShadow: '4px 4px 0px 0px var(--color-ocean)'}}>
               <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-neon)' }}>BUILDER ID</span>
               <span className="text-lg font-bold" style={{ color: 'var(--color-ocean)' }}>#HH-GOA-{Math.floor(Math.random() * 9000 + 1000)}</span>
               <div className="mt-2 h-12 w-full overflow-hidden">
                 <Barcode />
               </div>
            </div>
          </div>
        </div>

        {/* Footer Ribbon */}
        <div className="absolute bottom-12 bg-[#FF007F] text-white font-bold text-3xl tracking-widest px-16 py-3 shadow-[6px_6px_0px_0px_#FFE600] border-4 border-[#015B37] flex items-center gap-4 transform rotate-[-2deg]">
          <span className="text-[#FFE600]">✦</span>
          <span className="font-mono">#FRAMEINGOA</span>
          <span className="text-[#FFE600]">✦</span>
        </div>

      </div>
    </div>
  );
});

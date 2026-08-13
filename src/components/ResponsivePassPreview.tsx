import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { PassTemplate } from './PassTemplate';

interface Props {
  className?: string;
  onPointerDown?: React.PointerEventHandler;
  onPointerMove?: React.PointerEventHandler;
  onPointerUp?: React.PointerEventHandler;
  onPointerCancel?: React.PointerEventHandler;
  style?: React.CSSProperties;
}

export const ResponsivePassPreview = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setScale(w / 1080);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg bg-black/20 ${props.className || ''}`}
      style={{ containerType: 'inline-size', aspectRatio: '1080/1350', ...props.style }}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
      onPointerUp={props.onPointerUp}
      onPointerCancel={props.onPointerCancel}
    >
      <div
        style={{
          width: '1080px',
          height: '1350px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <PassTemplate ref={ref} />
      </div>
    </div>
  );
});

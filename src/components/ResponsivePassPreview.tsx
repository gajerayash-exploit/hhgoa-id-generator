import React, { forwardRef } from 'react';
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
  return (
    <div 
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
          transform: 'scale(calc(100cqi / 1080))', 
          transformOrigin: 'top left' 
        }}
      >
        <PassTemplate ref={ref} />
      </div>
    </div>
  );
});

import type { CSSProperties } from 'react';

export function Crown({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 43" fill="none" aria-hidden="true">
    <path d="m9 12 8 19h30l8-19-13 8L32 5 22 20 9 12Zm8 22h30v5H17z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="m32 19 4 5-4 5-4-5 4-5Z" fill="currentColor"/>
    <circle cx="7" cy="10" r="2.2" fill="currentColor"/><circle cx="32" cy="3" r="2.2" fill="currentColor"/><circle cx="57" cy="10" r="2.2" fill="currentColor"/>
  </svg>;
}

export function Dust({ count = 20 }: { count?: number }) {
  return <div className="dust" aria-hidden="true">{Array.from({ length: count }, (_, i) =>
    <i key={i} style={{ '--x': `${(i * 43 + 13) % 100}%`, '--y': `${(i * 37 + 7) % 100}%`, '--delay': `-${i % 9}s`, '--size': `${1 + i % 3}px` } as CSSProperties}/>,
  )}</div>;
}

export function Engraving({ side }: { side: 'left' | 'right' }) {
  return <svg className="engraving" viewBox="0 0 320 570" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <defs>
      <g id={`flourish-${side}`}>
        <path d="M0 75C3 33 19 8 73 0M7 60C20 47 37 46 46 31 57 12 25 14 30 28c3 7 14 4 12-3M16 42C14 25 28 15 46 12M8 54C6 31 13 15 28 11M17 40C30 43 37 49 35 57c-2 7-11 6-11 0 0-4 5-5 6-2M11 60C18 60 23 66 19 71M44 11C65 12 70 19 62 25c-5 4-10 0-8-4m-33 4 3-12 9-5-4 9m13-5 15-7 9 1-7 6"/>
        <path d="M4 34C0 23 4 17 10 15c5 4 5 10-6 19ZM27 43c10-3 14 1 14 6-7 2-10 0-14-6ZM47 12c8-7 14-8 20-4-5 5-9 6-20 4Z" fill="currentColor" fillOpacity=".24"/>
      </g>
    </defs>
    <rect x="7" y="7" width="306" height="556" rx="5"/>
    <path d="M23 90Q23 37 75 23H245Q296 37 297 90V480Q297 533 245 547H75Q23 533 23 480Z"/>
    <path d="M31 95Q31 48 80 32H240Q289 48 289 95V475Q289 523 240 538H80Q31 523 31 475Z" opacity=".55"/>
    <use href={`#flourish-${side}`} x="25" y="25"/>
    <use href={`#flourish-${side}`} transform="translate(295 25) scale(-1 1)"/>
    <use href={`#flourish-${side}`} transform="translate(25 545) scale(1 -1)"/>
    <use href={`#flourish-${side}`} transform="translate(295 545) scale(-1 -1)"/>
    <path d="m160 63 6 11-6 11-6-11 6-11Zm0 422 6 11-6 11-6-11 6-11Z" fill="currentColor" fillOpacity=".35"/>
    <path d="M111 74h36m26 0h36m-98 422h36m26 0h36" opacity=".5"/>
  </svg>;
}

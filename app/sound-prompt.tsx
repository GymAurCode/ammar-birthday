'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { BirthdayAudio } from './audio';

export function SoundPrompt({ audio }: {
  audio: RefObject<BirthdayAudio | null>;
}) {
  const player = useRef<HTMLAudioElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const shake = useRef<Animation | undefined>(undefined);
  const active = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const clip = player.current;
    const score = audio.current;
    return () => {
      if (active.current) score?.pauseMusic(false);
      active.current = false;
      clip?.pause();
      shake.current?.cancel();
    };
  }, [audio]);

  function finish(ended: boolean, error = false) {
    if (!active.current) return;
    active.current = false;
    shake.current?.cancel();
    audio.current?.pauseMusic(false);
    setPlaying(false);
    setFailed(error);
    if (ended) setRevealed(true);
  }

  function play() {
    const clip = player.current;
    if (!clip || active.current) return;
    active.current = true;
    setPlaying(true);
    setFailed(false);
    audio.current?.unlock();
    audio.current?.pauseMusic(true);
    clip.currentTime = 0;
    // Safari needs play() in the original tap handler.
    void clip.play().catch(() => {
      if (clip.isConnected) finish(false, true);
    });
  }

  function startShake() {
    if (!active.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    shake.current?.cancel();
    shake.current = stage.current?.animate([
      { transform: 'translate3d(0, 0, 0)' },
      { transform: 'translate3d(-3px, 1px, 0)' },
      { transform: 'translate3d(3px, -1px, 0)' },
      { transform: 'translate3d(-2px, 0, 0)' },
      { transform: 'translate3d(1px, 0, 0)' },
      { transform: 'translate3d(0, 0, 0)' },
    ], { duration: 260, easing: 'ease-out' });
  }

  return <section className="scene sound-prompt" aria-label="Sound">
    <div className="sound-prompt-inner" ref={stage}>
      <p className="sound-prompt-copy" aria-live="polite">
        {revealed ? <span className="sound-prompt-reveal">Bas yehi sunana tha, Bhai.</span> : 'Enjoy the full experience with sound.'}
      </p>
      <button type="button" className="button sound-prompt-button" aria-disabled={playing} onClick={play}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M11 5v14l-5-4H3V9h3l5-4ZM15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {revealed ? 'Play Again' : 'Turn Sound On'}
      </button>
      {failed && <p role="status" className="sound-prompt-error">Sound couldn’t play. Try again.</p>}
    </div>
    <audio ref={player} src="/assets/sound.mp3" preload="none"
      onPlaying={startShake} onEnded={() => finish(true)}
      onPause={(event) => { if (!event.currentTarget.ended) finish(false); }}
      onError={() => finish(false, true)} />
  </section>;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Crown, Dust, Engraving } from './art';
import { BirthdayAudio } from './audio';
import { age } from './details';
import { makeFireworks } from './fireworks';
import { MysteryGifts } from './mystery';
import { SoundPrompt } from './sound-prompt';
import { Cake, Finale, Hero, Letter, Level } from './scenes';

function Door({ open, opening, reference }: {
  open: () => void; opening: boolean; reference: React.RefObject<HTMLElement | null>;
}) {
  return <section ref={reference} className="door" aria-labelledby="invitation-title" aria-busy={opening}>
    <div className="door-lobby" aria-hidden="true">
      <div className="door-rays" />
      <div className="door-camera">
        <div className="door-leaf door-left"><Engraving side="left" /><div className="door-handle"><i /></div></div>
        <div className="door-leaf door-right"><Engraving side="right" /><div className="door-handle"><i /></div></div>
      </div>
      <div className="door-architrave" />
      <Dust count={24} />
    </div>
    <div className="invite-frame" aria-hidden="true"><i/><i/><i/><i/></div>
    <div className="invitation">
      <div className="invite-insignia"><Crown /></div>
      <div className="invite-kicker"><span /><p className="eyebrow">Specially made for</p><span /></div>
      <h1 id="invitation-title">Ammar <em>Amir</em></h1>
      <time dateTime="2026-11-26">26 November 2026</time>
      <button className="door-button" type="button" onClick={open} disabled={opening}>
        <span className="key-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M8.5 3.5a4.5 4.5 0 1 0 3.2 7.65L20 19.5m-4-4 2.5-2.5m-.2 4.8 2.4-2.4" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round"/><circle cx="8.5" cy="8" r="1" fill="currentColor"/></svg></span>
        <span>Tap to open your surprise.</span>
      </button>
    </div>
  </section>;
}

function Experience({ replay, focusDoor }: {
  replay: () => void; focusDoor: boolean;
}) {
  const [opening, setOpening] = useState(false);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const door = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<BirthdayAudio | null>(null);
  const fireworks = useRef<ReturnType<typeof makeFireworks>>(undefined);
  const entrance = useRef<gsap.core.Timeline | null>(null);
  const entranceDeadline = useRef<number>(undefined);
  const opened = useRef(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const score = new BirthdayAudio();
    audio.current = score;
    if (canvas.current) fireworks.current = makeFireworks(canvas.current, () => score.play('firework'));
    if (focusDoor) door.current?.querySelector('button')?.focus({ preventScroll: true });
    document.documentElement.dataset.locked = 'true';
    return () => {
      entrance.current?.kill();
      window.clearTimeout(entranceDeadline.current);
      score.dispose();
      fireworks.current?.dispose();
    };
    // A fresh audio engine is created for each replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !root.current) return;
    document.documentElement.dataset.locked = 'false';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((node) => {
        gsap.from(node, {
          opacity: 0, y: 22, duration: .78, ease: 'power2.out',
          scrollTrigger: { trigger: node, start: 'top 96%', once: true },
        });
      });
      const target = root.current?.querySelector('.level-number');
      const value = { number: 0 };
      if (target) {
        target.textContent = '0';
        gsap.to(value, {
          number: age.years, duration: 1.56, ease: 'power2.out',
          scrollTrigger: { trigger: '.level', start: 'top 78%', once: true },
          onUpdate: () => { target.textContent = String(Math.round(value.number)); },
        });
      }
      gsap.to('.portrait--hero picture', {
        y: 26, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    const ambient = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        target.dataset.ambient = String(entry.isIntersecting);
      }
    });
    root.current.querySelectorAll('.hero, .mystery-gifts, .cake-scene').forEach(node => ambient.observe(node));
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      root.current?.querySelector<HTMLElement>('#birthday-title')?.focus({ preventScroll: true });
    });
    return () => { ambient.disconnect(); cancelAnimationFrame(frame); ctx.revert(); };
  }, [ready]);

  function open() {
    if (opened.current || !door.current || !root.current) return;
    opened.current = true;
    setOpening(true);
    const score = audio.current;
    score?.unlock();
    score?.play('unlock');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = door.current;
    const pieces = gsap.utils.selector(target);
    const hero = gsap.utils.selector(root.current);
    const finish = () => { setReady(true); fireworks.current?.launch(); };
    if (reduced) { finish(); return; }

    gsap.set(hero('.hero-reveal'), { autoAlpha: 0, y: 22 });
    gsap.set(hero('.portrait--hero'), { opacity: .32, scale: .96 });
    const completeEntrance = () => {
      window.clearTimeout(entranceDeadline.current);
      gsap.set(hero('.hero-reveal, .portrait--hero'), { clearProps: 'transform,opacity,visibility' });
      finish();
    };
    // Safari can suspend the animation ticker while restoring focus after replay.
    entranceDeadline.current = window.setTimeout(() => {
      entrance.current?.kill();
      completeEntrance();
    }, 2800);
    entrance.current = gsap.timeline({ onComplete: completeEntrance })
      .to(pieces('.door-handle i'), { rotate: 27, duration: .24, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0)
      .to(pieces('.invitation, .invite-frame'), { opacity: 0, scale: .94, duration: .43 }, .14)
      .call(() => score?.play('door'), [], .32)
      .to(pieces('.door-left'), { rotateY: -106, duration: 1.35, ease: 'power3.inOut' }, .36)
      .to(pieces('.door-right'), { rotateY: 106, duration: 1.35, ease: 'power3.inOut' }, .36)
      .to(pieces('.door-rays'), { opacity: .86, scale: 1.18, duration: .86, ease: 'power2.inOut' }, .4)
      .to(pieces('.door-camera'), { scale: 1.42, duration: 1.12, ease: 'power2.in' }, .53)
      .to(target, { opacity: 0, duration: .48 }, 1.34)
      .to(hero('.portrait--hero'), { opacity: 1, scale: 1, duration: .9, ease: 'power2.out' }, 1.21)
      .to(hero('.hero-reveal'), { autoAlpha: 1, y: 0, stagger: .09, duration: .64, ease: 'power3.out' }, 1.43);
  }

  function celebrate() {
    audio.current?.unlock();
    audio.current?.play('celebrate');
    fireworks.current?.launch();
  }

  return <div ref={root} className="experience">
    <main inert={!ready}>
      <Hero />
      {ready && <>
        <Level /><Letter /><MysteryGifts audio={audio} />
        <Cake onCelebrate={celebrate} /><Finale replay={replay} />
        <SoundPrompt audio={audio} />
      </>}
    </main>
    <canvas ref={canvas} className="fireworks" aria-hidden="true" />
    {!ready && <Door open={open} opening={opening} reference={door} />}
  </div>;
}

export default function Birthday() {
  const [run, setRun] = useState(0);
  function replay() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.dataset.locked = 'true';
    setRun((value) => value + 1);
  }
  return <Experience key={run} replay={replay} focusDoor={run > 0} />;
}

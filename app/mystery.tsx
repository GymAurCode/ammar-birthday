'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { Dust } from './art';
import type { BirthdayAudio } from './audio';

type GiftCue = 'banana' | 'pacifier' | 'diaper' | 'chappal';

type Gift = {
  number: string;
  tone: 'onyx' | 'emerald' | 'burgundy' | 'aurum';
  kicker: string;
  name: string;
  description: string;
  caption: string;
  image: string;
  alt: string;
  sound: GiftCue;
  tilt: number;
};

const gifts: Gift[] = [
  {
    number: '01',
    tone: 'onyx',
    kicker: 'Premium imported energy booster',
    name: 'Banana Pro Max',
    description: '23 saal ke ho gaye ho, sehat ka khayal rakha karo.',
    caption: '100% organic. Charger included nahi hai.',
    image: '/assets/gift-banana.webp',
    alt: 'A realistic ripe yellow banana',
    sound: 'banana',
    tilt: -7,
  },
  {
    number: '02',
    tone: 'emerald',
    kicker: 'Advanced emotional support device',
    name: 'Chusni Ultra',
    description: 'Jab ghar wale daantein, toh rona nahi. Yeh use kar lena.',
    caption: 'Suitable for ages 0–23.',
    image: '/assets/gift-pacifier.webp',
    alt: 'A realistic blue baby pacifier',
    sound: 'pacifier',
    tilt: 8,
  },
  {
    number: '03',
    tone: 'burgundy',
    kicker: 'Professional emergency protection kit',
    name: 'Pamper Pro 23',
    description: 'Emergency situations ke liye. Safety first, bhai!',
    caption: 'Extra protection for unexpected situations.',
    image: '/assets/gift-diaper.webp',
    alt: 'A realistic clean white baby diaper',
    sound: 'diaper',
    tilt: -5,
  },
  {
    number: '04',
    tone: 'aurum',
    kicker: 'Long range discipline device',
    name: "Ammi's Wireless Remote — Pro Max",
    description: 'Ammi ki taraf se special gift. Bina Bluetooth ke kaam karti hai.',
    caption: 'Target accuracy: 100%. Escape probability: 0%.',
    image: '/assets/gift-chappal.webp',
    alt: 'A realistic blue Pakistani rubber chappal',
    sound: 'chappal',
    tilt: 6,
  },
];

function GiftBox({ gift, open, focused = false }: { gift: Gift; open: boolean; focused?: boolean }) {
  return <span className={`gbox gbox--${gift.tone}`} data-open={open} aria-hidden={!focused}>
    <span className="gbox-aura" />
    <span className="gbox-shadow" />
    {(open || focused) && <span className="gbox-object">
      <Image src={gift.image} alt={focused ? gift.alt : ""} width={520} height={520} unoptimized
        loading={focused ? "eager" : "lazy"} aria-hidden={!open} draggable={false} />
    </span>}
    <span className="gbox-body">
      <span className="gbox-top" />
      <span className="gbox-side" />
      <span className="gbox-front" />
      <span className="gbox-lid">
        <i className="gbox-lid-top" />
        <i className="gbox-lid-front" />
        <i className="gbox-lid-side" />
      </span>
      <span className="gbox-ribbon gbox-ribbon--v" />
      <span className="gbox-ribbon gbox-ribbon--h" />
      <span className="gbox-bow"><i /><i /><b /><em /><span /></span>
      <span className="gbox-glow" />
      <span className="gbox-tag">{gift.number}</span>
      {focused && <span className="gbox-particles">
        {Array.from({ length: 12 }, (_, i) => <i key={i} style={{
          '--x': `${12 + (i * 37) % 76}%`,
          '--delay': `${(i % 5) * .12}s`,
          '--size': `${2 + i % 3}px`,
        } as CSSProperties} />)}
      </span>}
    </span>
  </span>;
}

function Confetti() {
  return <div className="mystery-confetti" aria-hidden="true">
    {Array.from({ length: 42 }, (_, i) => {
      const angle = (i / 42) * Math.PI * 2 + (i % 3) * .17;
      const distance = 26 + (i * 19) % 42;
      return <i key={i} style={{
        '--x': `${Math.cos(angle) * distance}vw`,
        '--y': `${Math.sin(angle) * distance - 14}vh`,
        '--r': `${(i * 67) % 720}deg`,
        '--delay': `${(i % 7) * .045}s`,
        '--hue': `${i % 3 === 0 ? 44 : i % 3 === 1 ? 160 : 347}`,
      } as CSSProperties} />;
    })}
  </div>;
}

export function MysteryGifts({ audio }: { audio: RefObject<BirthdayAudio | null> }) {
  const [opened, setOpened] = useState([false, false, false, false]);
  const [selection, setSelection] = useState<{ index: number; alreadyOpen: boolean } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const overlay = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const closing = useRef<gsap.core.Timeline>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const count = opened.filter(Boolean).length;
  const gift = selection ? gifts[selection.index] : null;

  useLayoutEffect(() => {
    const scope = overlay.current;
    if (!selection || !scope) return;
    const { index, alreadyOpen } = selection;
    const currentGift = gifts[index];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const q = gsap.utils.selector(scope);
    const giftElement = q('.focus-gift')[0];
    const copy = q('.focus-copy')[0];
    const rect = origin.current?.querySelector('.gbox')?.getBoundingClientRect();
    const documentRoot = document.documentElement;
    scope.showModal();
    documentRoot.dataset.giftFocus = 'true';

    const finish = () => {
      if (!alreadyOpen) {
        setOpened((previous) => previous.map((value, i) => value || i === index));
      }
      setRevealed(true);
    };

    const context = gsap.context(() => {
      if (reduced) {
        gsap.delayedCall(.01, () => {
          finish();
          if (!alreadyOpen) audio.current?.play(currentGift.sound);
        });
        return;
      }

      const target = giftElement.getBoundingClientRect();
      const scale = rect ? rect.width / target.width : .55;
      const x = rect ? rect.left + rect.width / 2 - (target.left + target.width / 2) : 0;
      const y = rect ? rect.top + rect.height / 2 - (target.top + target.height / 2) : 0;
      const timeline = gsap.timeline();
      timeline
        .fromTo(q('.mystery-focus-bg'), { opacity: 0 }, { opacity: 1, duration: .42 }, 0)
        .fromTo(giftElement, { x, y, scale }, { x: 0, y: 0, scale: 1, duration: .66, ease: 'power3.inOut' }, 0);

      if (alreadyOpen) {
        timeline.to(copy, { autoAlpha: 1, duration: .24 }, .38).call(finish);
        return;
      }

      const revealAt = currentGift.sound === 'chappal' ? 2.55 : 2.13;
      timeline
        .call(() => audio.current?.play('unwrap'), [], .58)
        .to(q('.gbox-bow'), { xPercent: 68, yPercent: -34, rotate: 30, duration: .43 }, .58)
        .to(q('.gbox-ribbon--v'), { scaleY: .35, yPercent: -78, rotate: -27, duration: .48 }, .64)
        .to(q('.gbox-ribbon--h'), { scaleX: .4, xPercent: 59, rotate: 18, duration: .48 }, .64)
        .to(q('.gbox-ribbon, .gbox-bow'), { opacity: 0, duration: .29 }, .87)
        .to(q('.gbox-lid'), { yPercent: -14, xPercent: -24, rotate: -10, scale: .9, opacity: 1, duration: 1.05, ease: 'power2.inOut' }, .87)
        .to(q('.gbox-glow'), { opacity: 1, scale: 1.15, duration: .78 }, 1.12)
        .call(() => audio.current?.play('shimmer'), [], 1.18)
        .set(q('.gbox-lid'), { zIndex: 2 }, 1.42)
        .fromTo(q('.gbox-particles i'), { opacity: .88 }, {
          opacity: 0, yPercent: -2700, x: 'random(-36,36)', stagger: .045, duration: 1.13, ease: 'power2.out',
        }, 1.22)
        .fromTo(q('.gbox-object'), { opacity: 0, yPercent: 81, scale: .58 }, {
          opacity: 1, yPercent: 0, scale: 1, rotate: currentGift.tilt, duration: .83, ease: 'power3.out',
        }, revealAt)
        .call(() => audio.current?.play(currentGift.sound), [], revealAt + (currentGift.sound === 'chappal' ? .57 : .24))
        .to(copy, { autoAlpha: 1, duration: .32 }, revealAt + .38)
        .call(finish, [], revealAt + .83)
        .to(q('.gbox-object'), {
          yPercent: -4, rotate: currentGift.tilt + 4, duration: .8, yoyo: true, repeat: 1, ease: 'sine.inOut',
        }, revealAt + .83);

      if (currentGift.sound === 'chappal') {
        timeline.call(() => audio.current?.play('whoosh'), [], 1.9);
        timeline.fromTo(q('.gbox-object img'), { rotateY: -45 }, { rotateY: 0, duration: .68, ease: 'back.out(1.5)' }, revealAt + .13);
      }
    }, scope);

    return () => {
      context.revert();
      closing.current?.kill();
      closing.current = null;
      scope.close();
      delete documentRoot.dataset.giftFocus;
    };
  }, [selection, audio]);

  useEffect(() => {
    if (revealed) nextButton.current?.focus({ preventScroll: true });
  }, [revealed]);

  useEffect(() => {
    if (!confetti) return;
    const timer = window.setTimeout(() => setConfetti(false), 2100);
    return () => window.clearTimeout(timer);
  }, [confetti]);

  function openGift(index: number, node: HTMLButtonElement) {
    if (busy.current) return;
    origin.current = node;
    busy.current = true;
    setSelection({ index, alreadyOpen: opened[index] });
    audio.current?.unlock();
    audio.current?.play('select');
  }

  function close() {
    const scope = overlay.current;
    const giftElement = scope?.querySelector('.focus-gift');
    if (!revealed || closing.current || !scope || !giftElement) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const done = () => {
      if (count === 4 && !selection?.alreadyOpen && !reduced) {
        setConfetti(true);
        audio.current?.play('celebrate');
        window.setTimeout(() => {
          document.querySelector('.mystery-complete')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
      setSelection(null);
      setRevealed(false);
      busy.current = false;
    };
    if (reduced) {
      done();
      return;
    }
    const rect = origin.current?.querySelector('.gbox')?.getBoundingClientRect();
    const target = giftElement.getBoundingClientRect();
    closing.current = gsap.timeline({ onComplete: done })
      .to(scope.querySelector('.focus-copy'), { autoAlpha: 0, duration: .16 }, 0)
      .to(giftElement, {
        x: rect ? rect.left + rect.width / 2 - (target.left + target.width / 2) : 0,
        y: rect ? rect.top + rect.height / 2 - (target.top + target.height / 2) : 0,
        scale: rect ? rect.width / target.width : .55, duration: .48, ease: 'power2.inOut',
      }, 0)
      .to(scope, { opacity: 0, duration: .24 }, .26);
  }

  function continueCelebration() {
    const cake = document.getElementById('cake');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    cake?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  return <>
    <section className="scene mystery-gifts" id="surprise" aria-labelledby="mystery-title">
      <Dust count={13} />
      <header className="mystery-header">
        <div className="mystery-intro">
          <p data-reveal>Wait… The surprises aren&apos;t over yet.</p>
          <p data-reveal>23rd birthday hai, toh ek gift se kaise kaam chalega?</p>
          <p data-reveal>Four special gifts, exclusively for you.</p>
        </div>
        <h2 id="mystery-title" data-reveal>THE BIRTHDAY <em>SURPRISE BOX</em></h2>
        <p className="mystery-subtitle" data-reveal>Choose wisely, birthday boy.</p>
      </header>

      <div className="mystery-grid" data-reveal>
        {gifts.map((item, index) => <button
          key={item.number}
          type="button"
          className="gift-card"
          data-selected={selection?.index === index}
          data-open={opened[index]}
          onClick={(event) => openGift(index, event.currentTarget)}
          aria-label={opened[index] ? `Revisit gift ${index + 1}, ${item.name}` : `Open mystery gift ${index + 1}`}
        >
          <span className="gift-visual"><GiftBox gift={item} open={opened[index]} /></span>
          <span className="gift-label">{opened[index] ? 'Tap to revisit' : 'Tap to Open'}</span>
        </button>)}
      </div>

      <div className="mystery-status">
        <p className="mystery-progress" aria-live="polite"><b>{count}</b> of <b>4</b> gifts opened</p>
        <span className="mystery-dots" aria-hidden="true">
          {opened.map((value, index) => <i key={index} data-open={value} />)}
        </span>
      </div>

      {count === 4 && <div className="mystery-complete" aria-live="polite">
        <h3>Congratulations!</h3>
        <p className="mystery-complete-line">Your complete childhood starter pack is ready.</p>
        <p className="mystery-complete-quip">23 saal ki umar mein bachpan ki yaadein taza karwa di.</p>
        <button className="button button--gold" type="button" onClick={continueCelebration}>Continue the Celebration</button>
      </div>}
    </section>

    {selection && gift && <dialog ref={overlay} className="mystery-focus" aria-label={revealed ? gift.name : `Opening gift ${gift.number}`} onCancel={(event) => { event.preventDefault(); close(); }}>
      <span className="mystery-focus-bg" aria-hidden="true" />
      <div className="mystery-focus-shell">
        <div className="focus-gift"><GiftBox gift={gift} open={opened[selection.index]} focused /></div>
        <div className="focus-copy" data-visible={revealed}>
          <p className="eyebrow">{gift.kicker}</p>
          <h3 id="focus-title">{gift.name}</h3>
          <p className="focus-description">{gift.description}</p>
          <p className="focus-caption">{gift.caption}</p>
          <button ref={nextButton} className="button button--gold focus-next" type="button" onClick={close} disabled={!revealed}>
            Next Gift
          </button>
        </div>
      </div>
    </dialog>}

    {confetti && <Confetti />}
  </>;
}

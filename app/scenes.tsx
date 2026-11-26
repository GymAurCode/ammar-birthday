'use client';

import { useState } from 'react';
import { Crown, Dust } from './art';
import { age, letter } from './details';

export function Portrait({ finale = false }: { finale?: boolean }) {
  return <div className={`portrait ${finale ? 'portrait--final' : 'portrait--hero'}`}>
    <div className="portrait-frame" aria-hidden="true"><span /><i /><i /></div>
    <picture>
      <source srcSet="/assets/ammar-480.webp 480w, /assets/ammar-768.webp 768w, /assets/ammar-1122.webp 1122w" sizes="(max-width: 740px) 90vw, 45vw" type="image/webp" />
      <img src="/assets/ammar-768.webp" width="1122" height="1402" alt="Ammar Amir in a black formal suit and gold-trimmed birthday cap" loading={finale ? 'lazy' : 'eager'} fetchPriority={finale ? 'low' : 'high'} />
    </picture>
  </div>;
}

export function Hero() {
  return <section className="hero" id="birthday" aria-labelledby="birthday-title">
    <div className="hero-frame" aria-hidden="true"><i /><i /><i /><i /></div>
    <Dust count={16} />
    <div className="hero-running"><span>CHAPTER XXIII</span><span>EST. 2003</span></div>
    <div className="hero-composition">
      <Portrait />
      <div className="hero-text">
        <p className="eyebrow hero-reveal" aria-hidden="true"><span /> Happy Birthday</p>
        <h1 aria-label="Happy Birthday Ammar Amir" id="birthday-title" tabIndex={-1} className="hero-reveal">Ammar <em>Amir</em></h1>
        <p className="hero-date hero-reveal">26 November 2026</p>
      </div>
    </div>
    <a className="scroll-cue hero-reveal" href="#level"><i aria-hidden="true" />Scroll down</a>
  </section>;
}

export function Level() {
  return <section className="scene level" id="level" aria-labelledby="level-title">
    <div className="level-inner">
      <div className="level-medallion" data-reveal aria-hidden="true">
        <div className="level-orbit" /><Crown /><span className="level-number">23</span>
      </div>
      <div className="level-content">
        <h2 id="level-title" data-reveal>Level 23 <em>Unlocked</em></h2>
        <p className="level-quip" data-reveal>23 saal ka ho gaya hai. Harkatein abhi bhi wohi hain.</p>
        <p className="level-quip" data-reveal>Ab Eidi lene ki nahi, dene ki umar hai.</p>
        <dl className="stat-line" data-reveal>
          <div><dt>Months</dt><dd>{age.months}</dd></div>
          <div><dt>Days</dt><dd>{age.days.toLocaleString('en-US')}</dd></div>
        </dl>
      </div>
    </div>
  </section>;
}

export function Letter() {
  return <section className="scene letter" aria-label="A personal message">
    <div className="letter-design" aria-hidden="true"><span>AA</span></div>
    <article className="letter-paper">
      <Crown className="letter-crown" />
      {letter.map((paragraph) => <p key={paragraph} data-reveal>{paragraph}</p>)}
    </article>
  </section>;
}

export function Cake({ onCelebrate }: { onCelebrate: () => void }) {
  const [blown, setBlown] = useState(false);
  return <section id="cake" className="scene cake-scene" data-blown={blown} aria-labelledby="cake-title">
    <div className="cake-halo" aria-hidden="true" />
    <h2 id="cake-title" data-reveal>Make a <em>Wish</em></h2>
    <div className="cake-stage" aria-hidden="true">
      <div className="cake-shadow" />
      <div className="cake-plate" />
      <div className="cake-body"><div className="cake-rim" /><div className="cake-leaf" /><div className="cake-leaf" /><div className="cake-leaf" /></div>
      <div className="cake-top" />
      <div className="cake-garnish"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="cake-candles">
        <span><i className="candle-flame" /><i className="candle-smoke" />2</span>
        <span><i className="candle-flame" /><i className="candle-smoke" />3</span>
      </div>
    </div>
    <button className="button button--gold" disabled={blown} onClick={() => { setBlown(true); onCelebrate(); }}>Blow Out the Candles</button>
  </section>;
}

export function Finale({ replay }: { replay: () => void }) {
  const [status, setStatus] = useState('');
  const [showLink, setShowLink] = useState(false);
  const share = async () => {
    const url = new URL(window.location.pathname, window.location.origin).href;
    if (navigator.share) {
      try { await navigator.share({ title: 'Ammar Amir — Chapter 23', url }); return; }
      catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShowLink(false);
      setStatus('Birthday link copied.');
    } catch {
      setShowLink(true);
      setStatus('Select and copy the birthday link.');
    }
  };
  return <footer className="scene finale">
    <div className="finale-inner">
      <Portrait finale />
      <div className="finale-copy">
        <Crown />
        <h2 data-reveal>Chapter <em>23</em></h2>
        <p className="chapter-title" data-reveal>The best is yet to come.</p>
        <p data-reveal>Allah tumhari zindagi khushiyon, kamyabi aur barkat se bhar de. Ameen.</p>
        <p className="signature" data-reveal>Stay Blessed, Bhai.</p>
        <div className="finale-actions">
          <button className="button button--gold" onClick={replay}>Relive the Experience</button>
          <button className="button" onClick={share}>Share Birthday Website</button>
        </div>
        <p className="share-status" role="status">{status}</p>
        {showLink && <input className="share-link" aria-label="Birthday website link" readOnly value={new URL(window.location.pathname, window.location.origin).href} onFocus={(event) => event.target.select()} />}
      </div>
    </div>
  </footer>;
}

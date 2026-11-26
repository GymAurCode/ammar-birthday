type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number; confetti: boolean };
type Rocket = { x: number; y: number; start: number; end: number; target: number; age: number; duration: number; hue: number };

export function makeFireworks(canvas: HTMLCanvasElement, sound: () => void) {
  const context = canvas.getContext('2d');
  if (!context) return;
  let sparks: Spark[] = [];
  let rockets: Rocket[] = [];
  let frame = 0;
  let previous = 0;
  let launchScrollTop = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 700px), (update: slow)');
  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const clear = () => {
    cancelAnimationFrame(frame);
    frame = previous = 0;
    rockets = [];
    sparks = [];
    context.clearRect(0, 0, width, height);
    canvas.dataset.active = 'false';
  };
  const onVisibility = () => { if (document.hidden) clear(); };
  document.addEventListener('visibilitychange', onVisibility);

  function draw(now: number) {
    if (!context) return;
    if (Math.abs(window.scrollY - launchScrollTop) > height * .65) {
      clear();
      return;
    }
    const dt = Math.min(2, previous ? (now - previous) / 16.67 : 1);
    previous = now;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    const remaining: Rocket[] = [];
    for (const rocket of rockets) {
      const oldX = rocket.x;
      const oldY = rocket.y;
      rocket.age += dt;
      if (rocket.age < 0) { remaining.push(rocket); continue; }
      const t = Math.min(rocket.age / rocket.duration, 1);
      rocket.x += (rocket.target - rocket.x) * .065 * dt;
      rocket.y = rocket.start + (rocket.end - rocket.start) * (1 - (1 - t) ** 1.5);
      context.strokeStyle = 'rgba(255,210,115,.85)';
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(rocket.x, rocket.y);
      context.lineTo(rocket.x - (rocket.x - oldX) * 4, rocket.y - (rocket.y - oldY) * 4);
      context.stroke();
      if (t < 1) { remaining.push(rocket); continue; }
      sound();
      const count = compact.matches ? 46 : 86;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = (1 + Math.random() * 3.7) * (compact.matches ? .7 : 1);
        const life = 36 + Math.random() * 43;
        sparks.push({ x: rocket.x, y: rocket.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, max: life, hue: rocket.hue + Math.random() * 17, confetti: false });
      }
    }
    rockets = remaining;
    sparks = sparks.filter((spark) => {
      spark.life -= dt;
      if (spark.life <= 0) return false;
      const alpha = Math.min(spark.life / spark.max * 1.6, .82);
      spark.vx *= .985 ** dt;
      spark.vy += .046 * dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      if (spark.confetti) {
        context.fillStyle = `hsla(${spark.hue}, 78%, 62%, ${alpha})`;
        context.fillRect(spark.x, spark.y, 2 + Math.sin(spark.life / 4) * 2, 3);
      } else {
        context.strokeStyle = `hsla(${spark.hue}, 90%, 69%, ${alpha})`;
        context.lineWidth = .9;
        context.beginPath();
        context.moveTo(spark.x, spark.y);
        context.lineTo(spark.x - spark.vx * 4, spark.y - spark.vy * 4);
        context.stroke();
      }
      return true;
    });
    if (sparks.length || rockets.length) frame = requestAnimationFrame(draw);
    else clear();
  }

  return {
    launch() {
      if (reduced.matches || document.hidden) return;
      clear();
      resize();
      launchScrollTop = window.scrollY;
      canvas.dataset.active = 'true';
      const positions = compact.matches ? [.15, .84, .22] : [.2, .84, .11, .9, .26];
      rockets = positions.map((edge, i) => ({
        x: width * edge * .96, y: height * .8, start: height * .8,
        end: height * (.15 + (i % 3) * .105), target: width * edge,
        age: -i * 14, duration: 30 + i % 3 * 5, hue: 32 + i * 3,
      }));
      sparks = Array.from({ length: compact.matches ? 26 : 48 }, (_, i) => ({
        x: width * (i % 2 ? .85 : .15) + (Math.random() - .5) * width * .14,
        y: Math.random() * height * .36, vx: Math.random() * 1.1 - .55,
        vy: .45 + Math.random(), life: 85, max: 85, hue: 31 + Math.random() * 17, confetti: true,
      }));
      frame = requestAnimationFrame(draw);
    },
    clear,
    dispose() { clear(); document.removeEventListener('visibilitychange', onVisibility); },
  };
}

type Cue = 'unlock' | 'door' | 'firework' | 'select' | 'unwrap' | 'shimmer' | 'banana' | 'pacifier' | 'diaper' | 'chappal' | 'whoosh' | 'celebrate' | 'confetti';

export class BirthdayAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private score?: GainNode;
  private noise?: AudioBuffer;
  private timer?: ReturnType<typeof setInterval>;
  private beat = 0;
  private muted = false;
  private playing = false;

  unlock() {
    const Audio = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    try {
      if (!this.context) {
        this.context = new Audio();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : 0.52;
        this.master.connect(this.context.destination);
        this.score = this.context.createGain();
        this.score.gain.value = 0;
        this.score.connect(this.master);
        this.noise = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
        const samples = this.noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      }
      void this.context.resume().catch(() => {});
    } catch { /* Audio is optional on restricted devices. */ }
  }

  mute(value: boolean) {
    this.muted = value;

    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(value ? 0 : 0.52, this.context.currentTime, 0.035);
    }
  }

  private note(frequency: number, delay: number, duration: number, gain: number, type: OscillatorType = 'sine', target = this.master, end?: number) {
    const context = this.context;
    if (!context || !target) return;
    const time = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    if (end) oscillator.frequency.exponentialRampToValueAtTime(end, time + duration);
    volume.gain.setValueAtTime(0.0001, time);
    volume.gain.exponentialRampToValueAtTime(gain, time + Math.min(0.025, duration / 3));
    volume.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(volume).connect(target);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
    oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
  }

  private rustle(frequency: number, duration: number, gain: number, delay = 0) {
    const context = this.context;
    if (!context || !this.master || !this.noise) return;
    const time = context.currentTime + delay;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const volume = context.createGain();
    source.buffer = this.noise;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency, time);
    filter.frequency.exponentialRampToValueAtTime(frequency / 4, time + duration);
    volume.gain.setValueAtTime(gain, time);
    volume.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter).connect(volume).connect(this.master);
    source.start(time);
    source.stop(time + duration);
    source.onended = () => { source.disconnect(); filter.disconnect(); volume.disconnect(); };
  }

  play(cue: Cue) {
    if (this.muted) return;
    switch (cue) {
      case 'unlock':
        this.rustle(2350, .12, .13);
        this.note(720, 0, .12, .14, 'triangle');
        this.note(440, .1, .22, .14, 'triangle');
        break;
      case 'door':
        this.rustle(390, .8, .26);
        this.note(101, 0, .8, .26, 'triangle', this.master, 43);
        break;
      case 'firework':
        this.rustle(680, .48, .2);
        this.note(68, 0, .38, .18, 'sine', this.master, 35);
        break;
      case 'select':
        this.note(770, 0, .10, .08, 'triangle');
        break;
      case 'unwrap':
        this.rustle(3400, .3, .12);
        this.rustle(2200, .22, .09, .14);
        this.rustle(4600, .18, .06, .3);
        break;
      case 'shimmer':
        [329.63, 493.88, 659.25, 987.77].forEach((pitch, i) => this.note(pitch, i * .11, .65, .07));
        break;
      case 'celebrate':
      case 'confetti':
        [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => this.note(note, i * .09, .62, .15, 'triangle'));
        if (cue === 'confetti') [1318.5, 1567.98].forEach((note, i) => this.note(note, .38 + i * .1, .5, .08, 'sine'));
        break;
      case 'banana':
        this.note(370, 0, .31, .24, 'triangle', this.master, 108);
        this.note(650, .11, .23, .14, 'sine', this.master, 420);
        break;
      case 'pacifier':
        this.note(420, 0, .14, .16, 'triangle', this.master, 710);
        this.note(630, .16, .24, .18, 'triangle', this.master, 345);
        break;
      case 'diaper':
        this.rustle(830, .18, .19);
        this.note(143, 0, .29, .24, 'sawtooth', this.master, 72);
        this.note(243, .15, .14, .11, 'triangle', this.master, 136);
        break;
      case 'chappal':
        this.rustle(4200, .31, .33);
        this.note(530, 0, .26, .13, 'triangle', this.master, 100);
        this.note(118, .20, .12, .15, 'triangle', this.master, 63);
        break;
      case 'whoosh':
        this.rustle(1800, .38, .2);
        this.note(320, 0, .4, .07, 'sine', this.master, 90);
        break;
    }
  }

  music() {
    if (this.playing || !this.score || !this.context) return;
    this.playing = true;
    this.score.gain.setTargetAtTime(1, this.context.currentTime, .4);
    const motif = [392, 440, 523.25, 493.88, 440, 329.63, 392, 0, 349.23, 392, 440, 523.25, 493.88, 392, 440, 0];
    const bass = [130.81, 110, 87.31, 98];
    const tick = () => {
      if (document.hidden) return;
      const i = this.beat++ % motif.length;
      if (motif[i]) this.note(motif[i], .015, 1.05, .065, 'triangle', this.score);
      if (!(i % 4)) {
        this.note(bass[i / 4], 0, 1.9, .085, 'sine', this.score);
        this.note(bass[i / 4] * 1.5, .1, 1.6, .045, 'sine', this.score);
      }
    };
    tick();
    this.timer = setInterval(tick, 520);
  }

  reset() {
    clearInterval(this.timer);
    this.playing = false;
    this.beat = 0;
    if (this.context && this.score) {
      this.score.gain.setTargetAtTime(0, this.context.currentTime, .035);
    }
  }

  dispose() {
    this.reset();
    if (this.context) void this.context.close().catch(() => {});
  }
}

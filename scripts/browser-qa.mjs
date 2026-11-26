import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const url = process.env.BIRTHDAY_URL ?? 'http://localhost:3001';
const engine = process.env.BIRTHDAY_ENGINE ?? 'chromium';
const browser = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
const directory = `artifacts/${engine}`;
await mkdir(directory, { recursive: true });
const errors = [];
async function checkBounds(page, label) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const overflow = document.documentElement.scrollWidth - width;
    const title = document.querySelector('#birthday-title');
    const bounds = title?.getBoundingClientRect();
    const picture = document.querySelector('.portrait--hero img');
    const image = picture?.getBoundingClientRect();
    return {
      width, overflow, innerHeight,
      titleFits: Boolean(bounds && bounds.left >= 0 && bounds.right <= width + 1 && bounds.height > 0),
      portraitFits: Boolean(image && image.left >= -1 && image.right <= width + 1 && image.top >= -1
         && image.top + image.height * .51 < innerHeight && picture.naturalWidth),
    };
  });
  assert.equal(result.overflow, 0, label);
  assert.equal(result.titleFits, true, label);
  assert.equal(result.portraitFits, true, label);
}

function track(page, label) {
  page.on('pageerror', (error) => errors.push(`${label} pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${label} console: ${message.text()} ${message.location().url}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${label} HTTP ${response.status()}: ${response.url()}`);
  });
}

async function hit(page, button) {
  const touch = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  await page.getByRole('button', { name: button })[touch ? 'tap' : 'click']();
}

async function open(page, animated) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('.portrait--hero img').evaluate((image) => image.decode());
  assert.equal(await page.locator('html').getAttribute('data-locked'), 'true');
  await hit(page, 'Tap to open your surprise.');
  if (animated) {
    await page.waitForFunction(() => {
      const leaf = document.querySelector('.door-left');
      return leaf && getComputedStyle(leaf).transform !== 'none';
    });
    assert.equal(await page.locator('html').getAttribute('data-locked'), 'true');
  }
  await page.locator('.door').waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.documentElement.dataset.locked === 'false');
}


async function inspectGift(page, number, name, count, label) {
  if (count === 1) {
    await page.locator('.gift-card').nth(number - 1).scrollIntoViewIfNeeded();
    await page.locator('.gift-card').nth(number - 1).evaluate((button) => {
      button.click();
      button.click();
      button.parentElement.querySelector('.gift-card').click();
    });
  } else {
    await hit(page, `Open mystery gift ${number}`);
  }
  const startPitch = { 1: 370, 2: 420, 3: 143, 4: 530 }[number];
  assert.equal(await page.evaluate((pitch) => window.giftPitches.filter((value) => value === pitch).length, startPitch), 0);
  const dialog = page.getByRole('dialog');
  const image = dialog.locator('.gbox-object img');
  const next = dialog.getByRole('button', { name: 'Next Gift', includeHidden: true });
  assert.equal(await next.isEnabled(), false);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 1);
  await page.waitForFunction(() => {
    const lid = document.querySelector('dialog .gbox-lid');
    const ribbon = document.querySelector('dialog .gbox-ribbon--v');
    const glow = document.querySelector('dialog .gbox-glow');
    return getComputedStyle(lid).transform !== 'none'
      && Number(getComputedStyle(ribbon).opacity) < .1
      && Number(getComputedStyle(glow).opacity) > .65;
  });
  if (label) await page.screenshot({ path: `${directory}/${label}-gift-${number}-opening.png` });
  await next.waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('.focus-next').disabled);
  assert.equal(await dialog.locator('h3').textContent(), name);
  const cueCount = await page.evaluate((pitch) =>
    window.AudioContext || window.webkitAudioContext
      ? window.giftPitches.filter((value) => value === pitch).length
      : null, startPitch);
  if (cueCount !== null) assert.equal(cueCount, 1);
  assert.ok(await image.evaluate(async (img) => {
    await img.decode();
    const bounds = img.getBoundingClientRect();
    return bounds.top >= 0 && bounds.left >= 0 && bounds.right <= innerWidth && bounds.bottom <= innerHeight;
  }));
  assert.equal(await page.locator('.mystery-progress').textContent(), `${count} of 4 gifts opened`);
  if (label) await page.screenshot({ path: `${directory}/${label}-gift-${number}-revealed.png` });
  await next.click();
  await dialog.waitFor({ state: 'detached' });
  assert.equal(await page.locator('.gift-card[data-open="true"]').count(), count);
}

try {
  for (const [width, height] of [[440, 956], [1440, 900]]) {
    const mobile = width < 500;
    const label = mobile ? 'mobile' : 'desktop';
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: mobile });
    await page.addInitScript(() => {
      window.giftPitches = [];
      const audioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) return;
      const create = audioContext.prototype.createOscillator;
      audioContext.prototype.createOscillator = function () {
        const oscillator = create.call(this);
        const set = oscillator.frequency.setValueAtTime.bind(oscillator.frequency);
        oscillator.frequency.setValueAtTime = (pitch, time) => {
          window.giftPitches.push(pitch);
          return set(pitch, time);
        };
        return oscillator;
      };
    });
    track(page, label);
    await open(page, true);
    await checkBounds(page, label);
    await page.locator('#surprise').evaluate((section) => section.scrollIntoView());
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.mystery-grid')).opacity) > .98);
    assert.equal(await page.locator('.gift-card').count(), 4);
    assert.equal(await page.locator('.gbox-object img').count(), 0);
    const columns = await page.locator('.mystery-grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    assert.equal(columns, mobile ? 2 : 4);
    await page.screenshot({ path: `${directory}/${label}-gifts.png` });
    await inspectGift(page, 2, 'Chusni Ultra', 1, label);
    await inspectGift(page, 1, 'Banana Pro Max', 2, label);
    await inspectGift(page, 3, 'Pamper Pro 23', 3, label);
    await inspectGift(page, 4, "Ammi's Wireless Remote \u2014 Pro Max", 4, label);
    await page.locator('.mystery-confetti').waitFor();
    await page.getByText('Your complete childhood starter pack is ready.').waitFor();
    assert.equal(await page.locator('html').evaluate((node) => node.scrollWidth - node.clientWidth), 0);
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.locator('.mystery-progress').textContent(), '4 of 4 gifts opened');
    await hit(page, 'Revisit gift 1, Banana Pro Max');
    await page.getByRole('button', { name: 'Next Gift' }).click();
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.mystery-progress').textContent(), '4 of 4 gifts opened');
    await hit(page, 'Continue the Celebration');
    await page.waitForFunction(() => Math.abs(document.querySelector('#cake').getBoundingClientRect().top) < 3);
    await hit(page, 'Blow Out the Candles');
    await page.getByText('Wish made').waitFor();
    await hit(page, 'Relive the Experience');
    await page.locator('.door').waitFor();
    await page.waitForFunction(() => document.activeElement?.classList.contains('door-button'));
    await hit(page, 'Tap to open your surprise.');
    await page.locator('.door').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.mystery-progress').textContent(), '0 of 4 gifts opened');
    assert.equal(await page.locator('.gift-card[data-open="true"], .mystery-confetti').count(), 0);
    await page.close();
    console.log(`PASS ${engine} ${label}, all four animated gifts, revisit, cake, and replay`);
  }

  for (const [width, height] of [[320, 568], [768, 1024], [956, 440]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, reducedMotion: 'reduce' });
    track(page, `${width}x${height}`);
    await open(page, false);
    await hit(page, 'Open mystery gift 4');
    const next = page.getByRole('button', { name: 'Next Gift' });
    await next.waitFor();
    assert.equal(await page.locator('html').evaluate((node) => node.scrollWidth - node.clientWidth), 0);
    assert.equal(await page.locator('.mystery-focus').evaluate((node) => node.scrollWidth - node.clientWidth), 0);
    const box = await page.locator('dialog .gbox-object img').boundingBox();
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height);
    await next.click();
    assert.equal(await page.locator('.mystery-progress').textContent(), '1 of 4 gifts opened');
    await page.close();
  }
  assert.deepEqual(errors, []);
} catch (error) {
  if (errors.length) console.error(errors.join("\n"));
  throw error;
} finally {
  await browser.close();
}

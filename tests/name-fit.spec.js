import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const NAMES = ['Brittney', 'Alexandria-Rose', 'MMMMMMMMMMMM'];
const SHOTS = ['Great Vibes', 'Cinzel', 'Bebas Neue'];

function phone(testInfo) {
  return testInfo.project.name === 'phone';
}

async function press(locator, testInfo) {
  if (phone(testInfo)) await locator.tap();
  else await locator.click();
}

async function read(page) {
  return page.evaluate(() => window.__bezze.read());
}

function insideCanvas(state) {
  const box = state.canvasBox;
  expect(box, 'selection bounds').toBeTruthy();
  expect(box.left).toBeGreaterThanOrEqual(-1);
  expect(box.top).toBeGreaterThanOrEqual(-1);
  expect(box.right).toBeLessThanOrEqual(state.canvasWidth + 1);
  expect(box.bottom).toBeLessThanOrEqual(state.canvasHeight + 1);
}

test('long names stay whole, on one line, inside the canvas', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('editor.html?mode=custom&names=1');
  await page.waitForSelector('.upper-canvas', { timeout: 15000 });
  await page.waitForFunction(() => window.__bezze);
  await press(page.locator('[data-panel="text"]'), testInfo);
  await press(page.locator('#add-text'), testInfo);
  const field = page.locator('#edit-text');
  await expect(field).toBeVisible();

  for (const name of NAMES) {
    await field.fill(name);
    await field.dispatchEvent('input');
    await field.press('Enter');
    await expect.poll(async () => (await read(page)).text).toBe(name);
    await expect.poll(async () => (await read(page)).lines).toBe(1);

    const count = await page.locator('#sheet-fonts .font-chip').count();
    expect(count).toBeGreaterThan(2);
    for (let index = 0; index < count; index += 1) {
      const chip = page.locator('#sheet-fonts .font-chip').nth(index);
      await chip.scrollIntoViewIfNeeded();
      const fontName = await chip.getAttribute('data-font');
      await press(chip, testInfo);
      await expect.poll(async () => (await read(page)).text).toBe(name);
      await expect.poll(async () => (await read(page)).lines).toBe(1);
      const state = await read(page);
      insideCanvas(state);
      if (name === 'Brittney' && SHOTS.includes(fontName) && testInfo.project.name !== 'short') {
        mkdirSync('test-results', { recursive: true });
        const shot = await page.locator('#art-frame').screenshot();
        const slug = fontName.toLowerCase().replace(/\s+/g, '-');
        writeFileSync(`test-results/brittney-${slug}-${testInfo.project.use.viewport.width}.png`, shot);
      }
    }

    await page.locator('#rotate-step').scrollIntoViewIfNeeded();
    await press(page.locator('#rotate-step'), testInfo);
    await expect.poll(async () => (await read(page)).text).toBe(name);
    await expect.poll(async () => Math.abs((await read(page)).angle)).toBeGreaterThan(4);
    await expect.poll(async () => (await read(page)).lines).toBe(1);
    insideCanvas(await read(page));
  }

  expect(errors, errors.join('\n')).toEqual([]);
});

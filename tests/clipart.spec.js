import { test, expect } from '@playwright/test';

async function read(page) {
  return page.evaluate(() => window.__bezze.read());
}

test('clip art library search adds a piece inside the print area', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('editor.html?mode=custom');
  await page.waitForSelector('.upper-canvas');
  await page.waitForFunction(() => window.__bezze);
  await page.locator('[data-panel="clip"]').click();
  await expect(page.locator('#panel-clip')).toHaveAttribute('data-open', 'true');
  await expect.poll(async () => page.locator('#graphics button[data-library="true"]').count(), { timeout: 20000 }).toBeGreaterThan(0);
  const manifestCount = await page.evaluate(async () => {
    const response = await fetch('clipart/manifest.json');
    const data = await response.json();
    return Array.isArray(data) ? data.length : (data.items || []).length;
  });
  expect(manifestCount).toBeGreaterThanOrEqual(2800);
  await expect(page.locator('#clip-count')).toHaveCount(0);
  await expect(page.locator('#panel-clip').getByText(/^test$/i)).toHaveCount(0);

  const panel = page.locator('#panel-clip');
  await panel.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  expect(await panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(40);
  await page.locator('#shape-q').fill('mermaid');
  await expect.poll(async () => panel.evaluate((el) => el.scrollTop)).toBe(0);
  const results = page.locator('#graphics button[data-tags*="mermaid"]');
  await expect.poll(async () => results.count()).toBeGreaterThan(0);
  await results.first().click();
  await expect.poll(async () => (await read(page)).kind, { timeout: 15000 }).toBe('graphic');
  const fitted = await read(page);
  expect(fitted.selected).toBe(true);
  expect(fitted.canvasBox.right - fitted.canvasBox.left).toBeGreaterThan(8);
  expect(fitted.canvasBox.bottom - fitted.canvasBox.top).toBeGreaterThan(8);
  expect(fitted.canvasBox.left).toBeGreaterThanOrEqual(-1);
  expect(fitted.canvasBox.top).toBeGreaterThanOrEqual(-1);
  expect(fitted.canvasBox.right).toBeLessThanOrEqual(fitted.canvasWidth + 1);
  expect(fitted.canvasBox.bottom).toBeLessThanOrEqual(fitted.canvasHeight + 1);

  await page.locator('#clip-done').click();
  await expect(page.locator('#panel-clip')).toHaveAttribute('data-open', 'false');
  await page.locator('[data-panel="clip"]').click();
  await expect(page.locator('#panel-clip')).toHaveAttribute('data-open', 'true');
  await expect.poll(async () => panel.evaluate((el) => el.scrollTop)).toBe(0);
  expect(errors, errors.join('\n')).toEqual([]);
});

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

async function openLibrary(page) {
  await page.goto('editor.html?mode=custom');
  await page.waitForSelector('.upper-canvas');
  await page.waitForFunction(() => window.__bezze);
  await page.locator('[data-panel="clip"]').click();
  await expect.poll(async () => page.locator('#graphics button[data-library="true"]').count(), { timeout: 20000 }).toBeGreaterThan(0);
}

test('a library graphic corner on the canvas is transparent', async ({ page }) => {
  await openLibrary(page);
  await page.locator('#shape-q').fill('mermaid');
  const tile = page.locator('#graphics button[data-tags*="mermaid"]').first();
  await expect.poll(async () => tile.locator('img').evaluate((img) => img.naturalWidth || 0)).toBeGreaterThan(10);
  const tileCorner = await tile.locator('img').evaluate((img) => {
    const sample = document.createElement('canvas');
    sample.width = img.naturalWidth;
    sample.height = img.naturalHeight;
    const ctx = sample.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, 1, 1).data[3];
  });
  expect(tileCorner).toBe(0);
  await tile.click();
  await expect.poll(async () => (await read(page)).kind, { timeout: 15000 }).toBe('graphic');
  const corners = await page.evaluate(() => window.__bezze.cutoutCorners());
  expect(corners).toEqual([0, 0, 0, 0]);
});

test('numeric library titles are hidden and real titles fit the tile', async ({ page }) => {
  await openLibrary(page);
  await page.locator('#shape-q').fill('mermaid');
  const numbered = page.locator('#graphics button[data-library="true"][data-name="1"]').first();
  await expect(numbered).toBeVisible();
  await expect(numbered.locator('b')).toHaveCount(0);
  await page.locator('#shape-q').fill('airheads');
  const label = page.locator('#graphics button[data-library="true"] b').first();
  await expect(label).toBeVisible();
  await expect(label).not.toHaveText(/^\d+$/);
  const fit = await label.evaluate((el) => ({
    overflow: getComputedStyle(el).textOverflow,
    whiteSpace: getComputedStyle(el).whiteSpace,
    clipped: el.scrollWidth > el.clientWidth + 1,
  }));
  expect(fit.overflow).toBe('ellipsis');
  expect(fit.whiteSpace).toBe('nowrap');
  const inside = await label.evaluate((el) => el.getBoundingClientRect().width <= el.parentElement.getBoundingClientRect().width + 1);
  expect(inside).toBe(true);
});

test('tag chips scroll in one row and skip dull product tags', async ({ page }) => {
  await openLibrary(page);
  const chips = page.locator('#clip-cats');
  await expect(chips.getByRole('button', { name: 'tumbler', exact: true })).toHaveCount(0);
  await expect(chips.getByRole('button', { name: 'drinkware', exact: true })).toHaveCount(0);
  const row = await chips.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      wrap: style.flexWrap,
      overflow: style.overflowX,
      mask: style.maskImage || style.webkitMaskImage,
      scrolls: el.scrollWidth > el.clientWidth + 8,
    };
  });
  expect(row.wrap).toBe('nowrap');
  expect(row.overflow).toBe('auto');
  expect(row.mask).not.toBe('none');
  expect(row.scrolls).toBe(true);
  const typography = chips.getByRole('button', { name: 'typography', exact: true });
  await typography.scrollIntoViewIfNeeded();
  await expect(typography).toHaveText('typography');
  const whole = await typography.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
  expect(whole).toBe(true);
});

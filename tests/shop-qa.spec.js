import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVR42mP8z8Dwn4EIwDiqkQEApy0D/bK4p7wAAAAASUVORK5CYII=',
  'base64',
);

function phone(testInfo) {
  return testInfo.project.name === 'phone';
}

async function press(locator, testInfo) {
  if (phone(testInfo)) await locator.tap();
  else await locator.click();
}

async function quiet(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

async function ready(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.readyState === 'complete');
}

async function editorReady(page) {
  await page.waitForSelector('.upper-canvas', { timeout: 15000 });
  await page.waitForFunction(() => window.__bezze);
}

async function read(page) {
  return page.evaluate(() => window.__bezze.read());
}

async function touchDrag(page, from, to) {
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y, id: 1 }],
  });
  const steps = 8;
  for (let i = 1; i <= steps; i += 1) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y + ((to.y - from.y) * i) / steps,
        id: 1,
      }],
    });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function mouseDrag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

async function drag(page, from, to, testInfo) {
  if (phone(testInfo)) await touchDrag(page, from, to);
  else await mouseDrag(page, from, to);
}

test('shop controls a customer actually uses', async ({ page }, testInfo) => {
  const errors = await quiet(page);
  const mobile = phone(testInfo);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('qa-cleared')) {
      localStorage.clear();
      sessionStorage.setItem('qa-cleared', '1');
    }
  });

  await test.step('home nav and calls to action', async () => {
    await page.goto('index.html');
    await ready(page);
    await expect(page).toHaveTitle(/Bezze/);
    await expect(page.locator('.test-banner')).toContainText('no payment');
    const nav = mobile ? page.locator('.app-nav') : page.locator('.top-links');
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Gallery' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Design' })).toBeVisible();
    await expect(nav.getByRole('link', { name: /^Bag/ })).toBeVisible();
    await press(nav.getByRole('link', { name: 'Gallery' }), testInfo);
    await expect(page).toHaveURL(/gallery\.html/);
    const back = mobile ? page.locator('.app-nav') : page.locator('.top-links');
    await press(back.getByRole('link', { name: 'Home' }), testInfo);
    await expect(page).toHaveURL(/index\.html/);
    await press(page.getByRole('link', { name: 'Design yours' }), testInfo);
    await editorReady(page);
    await press(page.getByRole('link', { name: 'Close' }), testInfo);
    await expect(page).toHaveURL(/gallery\.html/);
    const shop = mobile ? page.locator('.app-nav') : page.locator('.top-links');
    await press(shop.getByRole('link', { name: 'Design' }), testInfo);
    await expect(page).toHaveURL(/editor\.html/);
    await editorReady(page);
    await press(page.getByRole('link', { name: 'Close' }), testInfo);
    await expect(page).toHaveURL(/gallery\.html/);
    await press((mobile ? page.locator('.app-nav') : page.locator('.top-links')).getByRole('link', { name: /^Bag/ }), testInfo);
    await expect(page).toHaveURL(/checkout\.html/);
    await press((mobile ? page.locator('.app-nav') : page.locator('.top-links')).getByRole('link', { name: 'Gallery' }), testInfo);
    await expect(page).toHaveURL(/gallery\.html/);
  });

  await test.step('gallery search, filters, and a design', async () => {
    await page.waitForFunction(() => document.querySelectorAll('.card').length >= 20);
    await expect(page.locator('.test-banner')).toContainText('no payment is taken');
    await expect(page.getByText(/not for sale|Test image/i)).toHaveCount(0);
    await expect.poll(async () => Number.parseInt(await page.locator('#count').innerText(), 10)).toBeGreaterThanOrEqual(20);
    const dropTitles = await page.evaluate(async () => {
      const response = await fetch(new URL('drops/manifest.json', location.href));
      const manifest = await response.json();
      const items = Array.isArray(manifest) ? manifest : (manifest.items || []);
      return items.filter((item) => item.release === 'instant').map((item) => item.title);
    });
    expect(dropTitles.length).toBeGreaterThanOrEqual(8);
    for (const title of dropTitles) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
    const search = page.locator('#q');
    await search.fill('zzzz-no-such-design');
    await expect(page.locator('#empty')).toBeVisible();
    await search.fill('');
    await page.waitForFunction(() => document.querySelectorAll('.card').length >= 20);
    if (mobile) {
      await press(page.locator('#open-filters'), testInfo);
      await expect(page.locator('#filter-sheet')).toBeVisible();
      await press(page.locator('#cats button').nth(1), testInfo);
      await press(page.locator('#apply-filters'), testInfo);
      await press(page.locator('#open-filters'), testInfo);
      await press(page.locator('#cats button').first(), testInfo);
      await press(page.locator('#apply-filters'), testInfo);
    } else {
      await press(page.locator('#cats button').nth(1), testInfo);
      await expect(page.locator('.card').first()).toBeVisible();
      await press(page.locator('#cats button').first(), testInfo);
    }
    await page.waitForFunction(() => document.querySelectorAll('.card').length >= 20);
    await press(page.locator('.card').first(), testInfo);
    await expect(page).toHaveURL(/editor\.html\?design=/);
    await editorReady(page);
  });

  await test.step('design picker', async () => {
    if (await page.locator('#panel-designs').getAttribute('data-open') !== 'true') {
      await press(page.locator('[data-panel="designs"]'), testInfo);
    }
    const dropTitles = await page.evaluate(async () => {
      const response = await fetch(new URL('drops/manifest.json', location.href));
      const manifest = await response.json();
      const items = Array.isArray(manifest) ? manifest : (manifest.items || []);
      return items.filter((item) => item.release === 'instant').map((item) => item.title);
    });
    await expect.poll(async () => page.locator('.design-card').count()).toBeGreaterThanOrEqual(20 + dropTitles.length);
    for (const title of dropTitles) {
      const exact = new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
      await expect(page.locator('.design-card strong').filter({ hasText: exact })).toBeVisible();
    }
    await expect(page.getByText(/not for sale|Test image/i)).toHaveCount(0);
    const swap = page.locator('.design-card button', { hasText: 'Swap' }).nth(1);
    await swap.scrollIntoViewIfNeeded();
    await press(swap, testInfo);
    await expect(page.locator('.design-card[data-current="true"]')).toHaveCount(1);
  });

  await test.step('text, Done, and Enter', async () => {
    await press(page.locator('[data-panel="text"]'), testInfo);
    await press(page.locator('#add-text'), testInfo);
    const field = page.locator('#edit-text');
    await expect(field).toBeVisible();
    await field.fill('Brittney');
    await field.dispatchEvent('input');
    if (mobile) await press(page.locator('#type-done'), testInfo);
    else await page.locator('#type-done').click();
    await expect.poll(async () => (await read(page)).typing).toBe(false);
    await expect.poll(async () => (await read(page)).text).toBe('Brittney');
    await expect.poll(async () => (await read(page)).selected).toBe(true);
    await expect.poll(async () => (await read(page)).focused).not.toBe('edit-text');
    await expect(page.locator('.tabbar')).toBeVisible();
    if (mobile) {
      await expect.poll(async () => (await read(page)).sheetOpen).toBe(true);
      const box = await field.boundingBox();
      const dock = await page.locator('#type-dock').boundingBox();
      expect(box.y).toBeGreaterThan(200);
      expect(dock.y).toBeGreaterThan(200);
    }

    await field.click();
    await field.fill('Brittney Lee');
    await field.dispatchEvent('input');
    await field.press('Enter');
    await expect.poll(async () => (await read(page)).typing).toBe(false);
    await expect.poll(async () => (await read(page)).text).toBe('Brittney Lee');
    await expect.poll(async () => (await read(page)).focused).not.toBe('edit-text');
  });

  await test.step('fonts and colours', async () => {
    if (mobile && !(await read(page)).sheetOpen) {
      await press(page.locator('#keep-edit'), testInfo);
    }
    const font = page.locator('#sheet-fonts .font-chip[data-font="Cinzel"]');
    await font.scrollIntoViewIfNeeded();
    await press(font, testInfo);
    await expect(font).toHaveAttribute('aria-pressed', 'true');
    await expect(font).toHaveText('Brittney Lee');
    const fitted = await read(page);
    expect(fitted.text).toBe('Brittney Lee');
    expect(fitted.lines).toBe(1);
    expect(fitted.controls).not.toContain('ml');
    expect(fitted.controls).toContain('mtr');
    expect(fitted.canvasBox.left).toBeGreaterThanOrEqual(-1);
    expect(fitted.canvasBox.top).toBeGreaterThanOrEqual(-1);
    expect(fitted.canvasBox.right).toBeLessThanOrEqual(fitted.canvasWidth + 1);
    expect(fitted.canvasBox.bottom).toBeLessThanOrEqual(fitted.canvasHeight + 1);
    await press(page.locator('#text-tabs button[data-texttab="colour"]'), testInfo);
    const swatch = page.locator('#ink-swatches button').nth(2);
    await press(swatch, testInfo);
    await expect(page.locator('#ink')).not.toHaveValue('#ffffff');
    await press(page.locator('#text-tabs button[data-texttab="style"]'), testInfo);
    await press(page.locator('#text-toggles [data-toggle="outline"]'), testInfo);
    await page.locator('#outline-width').evaluate((el) => {
      el.value = '14';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.locator('#opacity').evaluate((el) => {
      el.value = '70';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await press(page.locator('#text-tabs button[data-texttab="badge"]'), testInfo);
    await press(page.locator('#plaque-shapes button[data-plaque="round"]'), testInfo);
    await expect.poll(async () => (await read(page)).plaque).toBe('round');
    await expect.poll(async () => (await read(page)).outline).toBe(true);
    await expect.poll(async () => (await read(page)).opacity).toBe(70);
    await expect.poll(async () => (await read(page)).text).toBe('Brittney Lee');
    await expect.poll(async () => (await read(page)).lines).toBe(1);
    const fonts = page.locator('#sheet-fonts .font-chip');
    const fontCount = await fonts.count();
    expect(fontCount).toBeGreaterThanOrEqual(16);
    for (let index = 0; index < fontCount; index += 1) {
      const chip = fonts.nth(index);
      if (!(await chip.isVisible())) continue;
      await chip.scrollIntoViewIfNeeded();
      await press(chip, testInfo);
      await expect.poll(async () => (await read(page)).text).toBe('Brittney Lee');
      await expect.poll(async () => (await read(page)).lines).toBe(1);
      const state = await read(page);
      expect(state.canvasBox.left).toBeGreaterThanOrEqual(-1);
      expect(state.canvasBox.top).toBeGreaterThanOrEqual(-1);
      expect(state.canvasBox.right).toBeLessThanOrEqual(state.canvasWidth + 1);
      expect(state.canvasBox.bottom).toBeLessThanOrEqual(state.canvasHeight + 1);
    }
    if (testInfo.project.name === 'phone' || testInfo.project.name === 'desktop') {
      mkdirSync('test-results', { recursive: true });
      const shot = await page.screenshot();
      writeFileSync(`test-results/qa-${testInfo.project.use.viewport.width}.png`, shot);
    }
  });

  await test.step('monogram', async () => {
    await press(page.locator('[data-panel="mono"]'), testInfo);
    await page.locator('#mono-new').fill('BL');
    await press(page.locator('#mono-pick button', { hasText: 'Vine' }), testInfo);
    await press(page.locator('#add-mono'), testInfo);
    await expect.poll(async () => (await read(page)).kind).toBe('monogram');
    const letters = page.locator('#mono-letters');
    await letters.fill('BZ');
    await letters.dispatchEvent('input');
    if (mobile) await press(page.locator('#type-done'), testInfo);
    else await page.locator('#type-done').click();
    await expect.poll(async () => (await read(page)).typing).toBe(false);
    await expect.poll(async () => (await read(page)).kind).toBe('monogram');
    await expect.poll(async () => (await read(page)).selected).toBe(true);
  });

  await test.step('clip art', async () => {
    await press(page.locator('[data-panel="clip"]'), testInfo);
    await expect(page.locator('#shapes button')).toHaveCount(42);
    await expect.poll(async () => page.locator('#graphics button').count()).toBeGreaterThanOrEqual(30);
    await press(page.locator('#shapes button').first(), testInfo);
    await expect.poll(async () => (await read(page)).kind).toBe('clip');
    await press(page.locator('#sheet-close'), testInfo);
    if (mobile && await page.locator('#panel-clip').getAttribute('data-open') !== 'true') {
      await press(page.locator('[data-panel="clip"]'), testInfo);
    }
    await press(page.locator('#graphics button').first(), testInfo);
    await expect.poll(async () => (await read(page)).kind).toBe('graphic');
    await expect(page.getByText(/not for sale|Test image|test images/i)).toHaveCount(0);
  });

  await test.step('photo upload', async () => {
    await press(page.locator('[data-panel="photo"]'), testInfo);
    await expect(page.locator('#pick-photo')).toBeDisabled();
    await page.locator('#rights').check();
    await expect(page.locator('#pick-photo')).toBeEnabled();
    await page.locator('#photo').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: PNG });
    await expect.poll(async () => (await read(page)).kind, { timeout: 8000 }).toBe('photo');
  });

  await test.step('layers', async () => {
    await press(page.locator('[data-panel="layers"]'), testInfo);
    await expect(page.locator('#layers .layer').first()).toBeVisible();
    const before = await page.locator('#layers .layer').count();
    expect(before).toBeGreaterThan(1);
    await press(page.locator('#layers .layer').nth(1), testInfo);
    await expect.poll(async () => (await read(page)).selected).toBe(true);
  });

  await test.step('drag, scale, and rotate', async () => {
    await press(page.locator('[data-panel="text"]'), testInfo);
    await press(page.locator('#add-text'), testInfo);
    const field = page.locator('#edit-text');
    await field.fill('Move me');
    await field.dispatchEvent('input');
    await field.press('Enter');
    await expect.poll(async () => (await read(page)).text).toBe('Move me');
    if ((await read(page)).sheetOpen) await press(page.locator('#sheet-close'), testInfo);
    await expect.poll(async () => (await read(page)).sheetOpen).toBe(false);
    const start = await read(page);
    await drag(page, { x: start.box.cx, y: start.box.cy }, { x: start.box.cx + 50, y: start.box.cy + 30 }, testInfo);
    const moved = (await read(page)).objects.find((item) => item.text === 'Move me');
    expect(Math.round(moved.left)).not.toBe(Math.round(start.left));
    await press(page.locator('#undo'), testInfo);
    await expect.poll(async () => {
      const item = (await read(page)).objects.find((entry) => entry.text === 'Move me');
      return item ? Math.round(item.left) : null;
    }).toBe(Math.round(start.left));
    await press(page.locator('#redo'), testInfo);
    await expect.poll(async () => {
      const item = (await read(page)).objects.find((entry) => entry.text === 'Move me');
      return item ? Math.round(item.left) : null;
    }).not.toBe(Math.round(start.left));
    await press(page.locator('[data-panel="layers"]'), testInfo);
    await press(page.locator('#layers .layer', { hasText: 'Move me' }), testInfo);
    await press(page.locator('#sheet-close'), testInfo);
    await expect.poll(async () => (await read(page)).sheetOpen).toBe(false);

    const scaled = await read(page);
    await drag(
      page,
      scaled.box.br,
      { x: scaled.box.br.x + 48, y: scaled.box.br.y + 36 },
      testInfo,
    );
    await expect.poll(async () => (await read(page)).scaleX).toBeGreaterThan(scaled.scaleX + 0.05);

    const turned = await read(page);
    await drag(
      page,
      turned.box.mtr,
      { x: turned.box.mtr.x + 56, y: turned.box.mtr.y + 8 },
      testInfo,
    );
    await expect.poll(async () => Math.abs((await read(page)).angle)).toBeGreaterThan(4);
  });

  await test.step('share, fit, wrap and 3D, review, close', async () => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await press(page.locator('#share'), testInfo);
    await expect(page.locator('.toast, .copy-fallback')).toBeVisible();
    await press(page.locator('#fit-view'), testInfo);
    if (mobile) {
      await press(page.locator('#view-3d'), testInfo);
      await expect(page.locator('#view-3d')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#view-stage')).toBeVisible();
      await press(page.locator('#view-flat'), testInfo);
      await expect(page.locator('#view-flat')).toHaveAttribute('aria-pressed', 'true');
      await press(page.locator('#review'), testInfo);
    } else {
      await expect(page.locator('#view-stage')).toBeVisible();
      await press(page.locator('#turn-right'), testInfo);
      await press(page.locator('#add-cart'), testInfo);
    }
    await expect(page).toHaveURL(/checkout\.html/);
    await expect(page.locator('#bag-view')).toBeVisible();
    await expect(page.locator('#line-price')).toContainText('44.99');
    await expect(page.locator('#download')).toHaveCount(0);
    await expect(page.locator('#proof')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /download/i })).toHaveCount(0);
    const lineShot = page.locator('#line-shot');
    await expect(lineShot).toBeVisible();
    await expect.poll(async () => lineShot.evaluate((img) => img.naturalWidth || 0)).toBeGreaterThan(20);
    const reviewSize = await lineShot.evaluate((img) => ({ w: img.naturalWidth, h: img.naturalHeight }));
    expect(reviewSize.w).toBeLessThanOrEqual(800);
    expect(reviewSize.h).toBeLessThanOrEqual(800);
    const bagRaw = await page.evaluate(() => localStorage.getItem('bezze-bag') || sessionStorage.getItem('bezze-bag') || '');
    expect(bagRaw).not.toContain('wrapPng');
    expect(bagRaw).not.toContain('data:image/png');
    expect(bagRaw).toContain('"thumb"');
    expect(bagRaw).toContain('"preview"');
    expect(bagRaw).toContain('data:image/jpeg');
    await press(page.locator('#qty-plus'), testInfo);
    await expect(page.locator('#qty-value')).toHaveText('2');
    await press(page.locator('#pick-ship'), testInfo);
    await page.locator('#name').fill('Leigh Tester');
    await page.locator('#email').fill('leigh@example.com');
    await page.locator('#phone').fill('705-555-0100');
    await press(page.getByRole('button', { name: /Checkout/ }), testInfo);
    await expect(page.locator('#done')).toBeVisible();
    await expect(page.locator('#order-id')).not.toBeEmpty();
    await expect(page.locator('#download')).toHaveCount(0);
    await expect(page.locator('#proof')).toHaveCount(0);
    await expect(page.getByText('Download PNG')).toHaveCount(0);
    const spin = page.locator('#confirm-view');
    await expect(spin).toBeVisible();
    await expect.poll(async () => page.evaluate(() => !!(window.__confirm && window.__confirm.ready))).toBe(true);
    const before = await page.evaluate(() => window.__confirm.angle());
    await page.waitForTimeout(450);
    const after = await page.evaluate(() => window.__confirm.angle());
    expect(after).toBeGreaterThan(before);
    const doneShot = page.locator('#done-shot');
    await expect(doneShot).toBeHidden();
    await expect.poll(async () => doneShot.evaluate((img) => img.naturalWidth || 0)).toBeGreaterThan(20);
    const confirmSize = await doneShot.evaluate((img) => {
      const sample = document.createElement('canvas');
      sample.width = img.naturalWidth;
      sample.height = img.naturalHeight;
      const ctx = sample.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, sample.width, sample.height).data;
      let light = 0;
      for (let i = 0; i < data.length; i += 64) {
        if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) light += 1;
      }
      return { w: img.naturalWidth, h: img.naturalHeight, light };
    });
    expect(confirmSize.w).toBeLessThanOrEqual(800);
    expect(confirmSize.h).toBeLessThanOrEqual(800);
    expect(confirmSize.light).toBeGreaterThan(8);
    const orderRaw = await page.evaluate(() => sessionStorage.getItem('bezze-order') || '');
    expect(orderRaw).not.toContain('wrapPng');
    expect(orderRaw).not.toContain('data:image/png');
    expect(orderRaw).toContain('"preview"');
    expect(orderRaw).toContain('data:image/jpeg');
    if (testInfo.project.name === 'phone' || testInfo.project.name === 'desktop') {
      mkdirSync('test-results', { recursive: true });
      const shot = await page.screenshot();
      writeFileSync(`test-results/confirm-${testInfo.project.use.viewport.width}.png`, shot);
    }

    await page.goto('editor.html?mode=custom');
    await editorReady(page);
    await press(page.getByRole('link', { name: 'Close' }), testInfo);
    await expect(page).toHaveURL(/gallery\.html/);
  });

  expect(errors, errors.join('\n')).toEqual([]);
});

import { test, expect } from '@playwright/test';
import { nextDropAt, publishDrops, isPublicDrop, manifestItems, DROP_RELEASE } from '../js/drops.js';

const JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFhUVFRUYFxUVFRUYFxUVFRUWFxUVFRUYHSggGBolGxUVITEhJSsrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAgACAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAIEBQYHAf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A6gAA/9k=',
  'base64',
);

test('the weekly drop is Friday at 9:00 Toronto time', () => {
  expect(DROP_RELEASE).toMatchObject({ timeZone: 'America/Toronto', weekday: 5, hour: 9, minute: 0 });
  const next = nextDropAt(new Date('2026-11-03T15:00:00Z'));
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(next).map((part) => [part.type, part.value]));
  expect(parts.weekday).toBe('Fri');
  expect(parts.hour).toBe('09');
  expect(parts.minute).toBe('00');
  expect(next.toISOString()).toBe('2026-11-06T14:00:00.000Z');
});

test('instant designs publish immediately and the next drop stays hidden', () => {
  const now = new Date('2026-11-04T15:00:00Z');
  const hidden = {
    drive_file_id: 'hidden-1',
    filename: 'later.jpg',
    title: 'Secret Drop',
    tags: ['later'],
    release: 'next_drop',
    added_at: '2026-11-04T15:00:00Z',
    width: 800,
    height: 800,
    preview: 'previews/hidden-1.jpg',
  };
  const shown = {
    drive_file_id: 'instant-1',
    filename: 'now.jpg',
    title: 'Instant Pine',
    tags: ['pine'],
    release: 'instant',
    added_at: '2026-11-02T15:00:00Z',
    width: 800,
    height: 800,
    preview: 'previews/instant-1.jpg',
  };
  expect(isPublicDrop(hidden, now)).toBe(false);
  expect(isPublicDrop(shown, now)).toBe(true);
  const published = publishDrops([hidden, shown], now);
  expect(published.map((item) => item.name)).toEqual(['Instant Pine']);
  const licensed = publishDrops([{ ...shown, drive_file_id: 'lic-1', title: 'Licensed Hero', licensed: true }], now);
  expect(licensed[0].licensed).toBe(true);
  expect(licensed[0].badge).toBe('Test image, not for sale');
  const wrapped = publishDrops({ last_synced: '2026-11-04T15:00:00.000Z', items: [hidden, shown] }, now);
  expect(wrapped.map((item) => item.name)).toEqual(['Instant Pine']);
  expect(manifestItems({ last_synced: '2026-11-04T15:00:00.000Z', items: [shown] })).toEqual([shown]);
  expect(publishDrops([], now)).toEqual([]);
  expect(publishDrops({ last_synced: '2026-11-04T15:00:00.000Z', items: [] }, now)).toEqual([]);
  expect(publishDrops(null, now)).toEqual([]);
  expect(publishDrops({}, now)).toEqual([]);
});

test('an empty drop feed keeps the sample gallery', async ({ page }, testInfo) => {
  await page.goto('gallery.html');
  await page.waitForFunction(() => document.querySelectorAll('.card').length >= 20);
  const manifest = await page.evaluate(async () => {
    const response = await fetch(new URL('drops/manifest.json', location.href));
    return response.json();
  });
  expect(Array.isArray(manifestItems(manifest))).toBe(true);
  if (testInfo.project.name === 'phone' || testInfo.project.name === 'desktop') {
    const { mkdirSync } = await import('node:fs');
    mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: `test-results/gallery-${testInfo.project.use.viewport.width}.png`, fullPage: true });
  }
});

test('instant feed items show in the gallery and editor, next drop does not', async ({ page }) => {
  const now = new Date();
  const later = nextDropAt(new Date(now.getTime() + 60 * 1000));
  const manifest = {
    last_synced: now.toISOString(),
    items: [
    {
      drive_file_id: 'instant-pine',
      filename: 'instant-pine.jpg',
      title: 'Instant Pine',
      tags: ['pine', 'new'],
      release: 'instant',
      added_at: new Date(now.getTime() - 86400000).toISOString(),
      width: 800,
      height: 800,
      preview: 'previews/instant-pine.jpg',
    },
    {
      drive_file_id: 'secret-drop',
      filename: 'secret-drop.jpg',
      title: 'Secret Drop',
      tags: ['secret'],
      release: 'next_drop',
      added_at: new Date(later.getTime() - 60 * 1000).toISOString(),
      width: 800,
      height: 800,
      preview: 'previews/secret-drop.jpg',
    },
  ],
  };
  await page.route('**/drops/manifest.json', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(manifest),
  }));
  await page.route('**/drops/previews/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/jpeg',
    body: JPEG,
  }));
  await page.goto('gallery.html?drops=1');
  await expect(page.getByRole('heading', { name: 'Instant Pine' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Secret Drop' })).toHaveCount(0);
  await expect.poll(async () => page.locator('.card').count()).toBeGreaterThanOrEqual(21);
  const first = (await page.locator('.card h2').first().textContent())?.trim();
  expect(first).toBe('Instant Pine');
  await page.getByRole('link', { name: /Instant Pine/ }).click();
  await page.waitForSelector('.upper-canvas', { timeout: 15000 });
  await page.waitForFunction(() => window.__bezze);
  if (await page.locator('#panel-designs').getAttribute('data-open') !== 'true') {
    await page.locator('[data-panel="designs"]').click();
  }
  await expect(page.locator('.design-card', { hasText: 'Instant Pine' })).toBeVisible();
  await expect(page.locator('.design-card', { hasText: 'Secret Drop' })).toHaveCount(0);
});

test('a licensed drop can be browsed but not checked out', async ({ page }) => {
  const manifest = {
    last_synced: new Date().toISOString(),
    items: [{
      drive_file_id: 'licensed-hero',
      filename: 'licensed-hero.jpg',
      title: 'Licensed Hero',
      tags: ['character'],
      release: 'instant',
      licensed: true,
      added_at: new Date().toISOString(),
      width: 800,
      height: 800,
      preview: 'previews/licensed-hero.jpg',
    }],
  };
  await page.route('**/drops/manifest.json', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(manifest),
  }));
  await page.route('**/drops/previews/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/jpeg',
    body: JPEG,
  }));
  await page.goto('gallery.html?licensed=1');
  await expect(page.getByRole('heading', { name: 'Licensed Hero' })).toBeVisible();
  await expect(page.getByText('Test image, not for sale').first()).toBeVisible();
  await page.getByRole('link', { name: /Licensed Hero/ }).click();
  await page.waitForSelector('.upper-canvas', { timeout: 15000 });
  await expect(page.locator('#licensed-note')).toBeVisible();
  const buy = page.locator('#add-cart');
  if (await buy.isVisible()) await buy.click();
  else await page.locator('#review').click();
  await expect(page).toHaveURL(/checkout\.html/);
  await expect(page.locator('#licensed-note')).toBeVisible();
  await expect(page.locator('#pay button[type="submit"]')).toBeDisabled();
  await expect(page.locator('#done')).toBeHidden();
});

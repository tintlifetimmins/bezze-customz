import { test, expect } from '@playwright/test';
import { PRINT_MM, SHOP_URL_MARK } from '../js/print.js';

const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFhUVFRUYFxUVFRUYFxUVFRUWFxUVFRUYHSggGBolGxUVITEhJSsrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAgACAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAIEBQYHAf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A6gAA/9k=';

test('the shop url mark is one constant', () => {
  expect(SHOP_URL_MARK).toBe('bezzecustomz.ca');
  expect(PRINT_MM.urlInset).toBeLessThan(PRINT_MM.safe);
});

test('the print url sits below the safe zone', async ({ page }) => {
  await page.goto('checkout.html');
  const result = await page.evaluate(async () => {
    const { PRINT_MM, SHOP_URL_MARK, stampPrintUrl } = await import('./js/print.js');
    const canvas = document.createElement('canvas');
    canvas.width = 252 * 8;
    canvas.height = 217 * 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#102033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const before = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    stampPrintUrl(ctx, canvas.width, canvas.height);
    const after = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const safeTop = canvas.height - (PRINT_MM.safe / PRINT_MM.height) * canvas.height;
    let below = 0;
    let inside = 0;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 4) {
        const i = (y * canvas.width + x) * 4;
        if (before[i] === after[i] && before[i + 1] === after[i + 1] && before[i + 2] === after[i + 2]) continue;
        if (y > safeTop) below += 1;
        else inside += 1;
      }
    }
    return { url: SHOP_URL_MARK, below, inside };
  });
  expect(result.url).toBe('bezzecustomz.ca');
  expect(result.below).toBeGreaterThan(8);
  expect(result.inside).toBe(0);
});

test('confirmation stays still when motion is reduced', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((saved) => {
    sessionStorage.setItem('bezze-order', JSON.stringify(saved));
  }, {
    id: 'BZ-1001',
    title: 'Test tumbler',
    subtitle: '20 oz',
    thumb: JPEG,
    preview: JPEG,
    delivery: 'pickup',
    qty: 1,
    totals: { subtotal: 44.99, total: 44.99 },
    customer: { name: 'Leigh Tester', email: 'leigh@example.com', phone: '7055550100' },
    placedAt: '2026-11-03T19:00:00.000Z',
  });
  await page.goto('checkout.html#confirmed');
  await expect(page.locator('#confirm-view')).toBeVisible();
  await expect(page.locator('#confirm-stage')).toHaveAttribute('data-spin', 'off');
  await expect.poll(() => page.evaluate(() => !!(window.__confirm && window.__confirm.ready))).toBe(true);
  expect(await page.evaluate(() => window.__confirm.reduced)).toBe(true);
  const first = await page.evaluate(() => window.__confirm.angle());
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__confirm.angle())).toBe(first);
});

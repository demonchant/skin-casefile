import { test, expect } from '@playwright/test';
import { deflateSync } from 'node:zlib';

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, name, data, checksum]);
}

function syntheticPng() {
  const width = 480;
  const height = 480;
  const rows = Buffer.alloc(height * (1 + width * 4));
  for (let row = 0; row < height; row += 1) {
    const offset = row * (1 + width * 4);
    rows[offset] = 0;
    for (let col = 0; col < width; col += 1) {
      const pixel = offset + 1 + col * 4;
      rows[pixel] = 172;
      rows[pixel + 1] = 188;
      rows[pixel + 2] = 167;
      rows[pixel + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(rows)), pngChunk('IEND', Buffer.alloc(0))]);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('landing page explains the product and routes into the separate casebook', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your skin has a story/ })).toBeVisible();
  await expect(page.getByText(/not a diagnosis or a product verdict/)).toBeVisible();
  await page.getByRole('link', { name: /Open your casebook/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'No case files yet' })).toBeVisible();
});

test('first visit shows a genuine empty state and privacy disclosure', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'No case files yet' })).toBeVisible();
  await expect(page.getByText('Saved on this device only')).toBeVisible();
  await page.getByRole('button', { name: 'Privacy & limits' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Privacy & limits' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your photo' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('missing API key fails closed and never creates a pretend scan record', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.getByRole('button', { name: 'Open a case' }).click();
  await page.getByLabel('Give this concern a short name').fill('Skin feels different');
  await page.getByLabel(/I agree to send this photo to YouCam/).check();
  // Synthetic input is only used to reach the actual missing-key failure path; it is never analyzed or stored as product data.
  await page.locator('#baselinePhoto').setInputFiles({ name: 'consented-image.png', mimeType: 'image/png', buffer: syntheticPng() });
  await page.getByRole('button', { name: 'Create record with real analysis' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'YOUCAM_API_KEY' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No case files yet' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('skin-casefile.records.v1'))).toBeNull();
  expect(errors).toEqual([]);
});

test('page fits a narrow viewport and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const scrollBehavior = await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior);
  expect(scrollBehavior).toBe('auto');
  await page.getByRole('button', { name: 'Start a new case' }).focus();
  await expect(page.getByRole('button', { name: 'Start a new case' })).toBeFocused();
});

test('all top-level controls have accessible names and the source link is available', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Privacy & limits' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start a new case' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About YouCam Skin Analysis ↗' })).toHaveAttribute('href', 'https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1');
});

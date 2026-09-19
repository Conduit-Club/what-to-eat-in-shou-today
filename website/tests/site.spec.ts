import {test, expect} from '@playwright/test';
import {readFileSync, existsSync} from 'node:fs';
import {basename, join} from 'node:path';
import data from '../src/data/restaurants.json';
import type {Restaurant} from '../src/types/restaurant';

const restaurants = data as Restaurant[];
const onCampusCount = restaurants.filter(item => item.category === 'on-campus').length;

const image = {
  name: 'photo.png', mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMFAAAAAASUVORK5CYII=', 'base64'),
};

test('card data covers every detail and required field without invented dates', () => {
  expect(new Set(restaurants.map(item => item.id)).size).toBe(restaurants.length);
  for (const item of restaurants) {
    expect(['on-campus', 'off-campus']).toContain(item.category);
    for (const field of ['name', 'location', 'taste', 'price'] as const) expect(item[field].trim()).not.toBe('');
    for (const field of ['image', 'openingHours', 'visitedAt', 'updatedAt'] as const) expect(item).toHaveProperty(field);
    for (const field of ['visitedAt', 'updatedAt'] as const) {
      if (item[field] !== null) expect(item[field]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const path = `docs${item.detailPath}.md`;
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8')).toContain(`# ${item.name}`);
    const index = readFileSync(`docs/${item.category}/index.md`, 'utf8');
    expect(index).toContain(`(${basename(path)})`);
    const sidebar = readFileSync('sidebars.ts', 'utf8');
    expect(sidebar).toContain(`'${item.category}/${item.id}'`);
    if (item.image?.startsWith('/img/')) expect(existsSync(join('static', item.image.slice(1)))).toBe(true);
    if (item.image?.startsWith('http')) expect(item.image).toMatch(/^https:\/\//);
  }
});

test('cards are pre-rendered and work under a deployment prefix', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/food/restaurants/');
  await expect(page.locator('.restaurant-card')).toHaveCount(restaurants.length);
  await expect(page.locator('.restaurant-card img').first()).toHaveAttribute('src', '/food/img/restaurant-placeholder.svg');
  await page.getByRole('link', {name: '肠粉', exact: true}).click();
  await expect(page).toHaveURL(/\/food\/on-campus\/changfen\/$/);
  await expect(page.getByRole('heading', {name: '肠粉', exact: true})).toBeVisible();
  await context.close();
});

test('filtering, images, mobile width and dark mode', async ({page}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('restaurants/');
  await page.screenshot({path: testInfo.outputPath('desktop.png'), fullPage: true});
  await page.getByLabel('就餐范围').selectOption('on-campus');
  await expect(page.locator('.restaurant-card')).toHaveCount(onCampusCount);
  await page.getByLabel('就餐范围').selectOption('all');
  await page.getByLabel('搜索名称或位置').fill('肠粉');
  await expect(page.locator('.restaurant-card')).toHaveCount(1);
  await page.getByLabel('搜索名称或位置').fill('不存在的餐厅');
  await expect(page.getByRole('status')).toContainText('共 0 家');
  await page.getByLabel('搜索名称或位置').fill('');
  await page.setViewportSize({width: 375, height: 812});
  await page.emulateMedia({colorScheme: 'dark'});
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({path: testInfo.outputPath('mobile-dark.png'), fullPage: true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.restaurant-card img').first()).toBeVisible();
  expect(await page.locator('.restaurant-card img').first().evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('photo preview, validation, draft export or moderated upload', async ({page}) => {
  await page.goto('submit/');
  await page.getByLabel('餐厅名称').fill('测试餐厅');
  await page.getByLabel('位置', {exact: true}).fill('测试位置');
  await page.getByLabel('口感描述').fill('个人体验');
  await page.getByLabel('营业时间').fill('待补充');
  await page.getByLabel('用餐日期').fill('2026-09-16');
  const fileInput = page.getByLabel('餐厅照片', {exact: false});
  await fileInput.setInputFiles({name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>')});
  await expect(page.getByRole('status')).toContainText('请选择不超过');
  await fileInput.setInputFiles(image);
  await expect(page.getByAltText('所选餐厅照片预览')).toBeVisible();
  await page.getByRole('checkbox').check();
  const endpoint = process.env.TEST_CONTRIBUTION_API_URL;
  if (!endpoint) {
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', {name: '导出信息草稿'}).click();
    const download = await downloadEvent;
    const payload = JSON.parse(readFileSync((await download.path())!, 'utf8'));
    expect(payload).toMatchObject({schemaVersion: 1, name: '测试餐厅', imageFilename: 'photo.png'});
    await expect(page.getByRole('status')).toContainText('尚未上传');
  } else {
    await page.route(endpoint, route => route.fulfill({status: 500, body: 'error'}));
    await page.getByRole('button', {name: '提交审核'}).click();
    await expect(page.getByRole('status')).toContainText('上传未成功');
    await expect(page.getByLabel('餐厅名称')).toHaveValue('测试餐厅');
    await page.unroute(endpoint);
    await page.route(endpoint, route => route.fulfill({status: 201, body: '{}'}));
    await page.getByRole('button', {name: '提交审核'}).click();
    await expect(page.getByRole('status')).toContainText('结果未确认');
    await page.unroute(endpoint);
    await page.route(endpoint, route => route.abort('timedout'));
    await page.getByRole('button', {name: '提交审核'}).click();
    await expect(page.getByRole('status')).toContainText('上传超时');
    await expect(page.getByLabel('餐厅名称')).toHaveValue('测试餐厅');
    await page.unroute(endpoint);
    await page.route(endpoint, async route => {
      expect(route.request().method()).toBe('POST');
      expect(route.request().headers()['content-type']).toContain('multipart/form-data; boundary=');
      const body = route.request().postDataBuffer()!.toString();
      expect(body).toContain('name="metadata"');
      expect(body).toContain('name="image"');
      await route.fulfill({status: 202, body: '{}'});
    });
    await page.getByRole('button', {name: '提交审核'}).click();
    await expect(page.getByRole('status')).toContainText('等待审核');
  }
});

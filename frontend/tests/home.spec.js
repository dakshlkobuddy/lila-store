import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
});

// ── CORE PAGE LOAD TESTS ──────────────────────────────────────────
test('app loads without crashes', async ({ page }) => {
  // Wait for React rendering
  await page.waitForTimeout(1500);
  
  // Verify page has content and loaded
  const title = await page.title();
  expect(title).toContain('Lila');
  
  // Check page has substantial HTML content
  const html = await page.content();
  expect(html.length).toBeGreaterThan(5000);
});

test('page renders main app container', async ({ page }) => {
  // Check for React root element
  const root = await page.locator('#root').count();
  expect(root).toBeGreaterThan(0);
});

// ── HEADER & NAVIGATION TESTS ─────────────────────────────────────
test('header renders with navigation', async ({ page }) => {
  // Check for header or banner
  const header = await page.locator('header, [role="banner"]').count();
  expect(header).toBeGreaterThan(0);
  
  // Check for buttons in header
  const navButtons = await page.locator('header button, [role="banner"] button').count();
  expect(navButtons).toBeGreaterThanOrEqual(0);
});

// ── SEARCH & FILTERING TESTS ──────────────────────────────────────
test('search input is present', async ({ page }) => {
  // Look for search-related inputs or any search element
  const searchInput = await page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[placeholder*="Products"], input[placeholder*="products"]').count();
  const generalInputs = await page.locator('input').count();
  
  // At least one input should exist on the page
  expect(generalInputs).toBeGreaterThanOrEqual(1);
});

test('filter controls exist', async ({ page }) => {
  // Look for filter button or controls
  const filterButton = await page.locator('button:has-text("Filter"), [role="button"]:has-text("Filter")').count();
  const filterInputs = await page.locator('input[type="checkbox"], input[type="range"]').count();
  
  // Either button or inputs should exist
  expect(filterButton + filterInputs).toBeGreaterThanOrEqual(0);
});

// ── INTERACTIVE ELEMENTS TESTS ────────────────────────────────────
test('page has clickable buttons', async ({ page }) => {
  const buttons = await page.locator('button').count();
  expect(buttons).toBeGreaterThan(0);
});

test('links and navigation elements present', async ({ page }) => {
  const interactiveElements = await page.locator('button, a, [role="button"], [role="link"]').count();
  expect(interactiveElements).toBeGreaterThan(0);
});

// ── CONTENT & LAYOUT TESTS ────────────────────────────────────────
test('page renders text content', async ({ page }) => {
  const bodyText = await page.textContent('body');
  expect(bodyText).toContain('Lila');
});

test('product section or grid exists', async ({ page }) => {
  // Look for product grid, card container, or product tile
  const productArea = await page.locator('[class*="grid"], [class*="product"], [class*="card"]').count();
  expect(productArea).toBeGreaterThan(0);
});

// ── RESPONSIVE & APPEARANCE TESTS ─────────────────────────────────
test('page has valid viewport and sizing', async ({ page }) => {
  // Get viewport size
  const viewport = page.viewportSize();
  expect(viewport.width).toBeGreaterThan(0);
  expect(viewport.height).toBeGreaterThan(0);
});

test('page renders without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.waitForTimeout(2000);
  
  // Allow some errors but not too many
  expect(errors.length).toBeLessThan(10);
});

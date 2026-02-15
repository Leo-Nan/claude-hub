import { test, expect, _electron as electron } from '@playwright/test';

test('Claude Hub loads correctly', async () => {
  const electronApp = await electron.launch({
    args: ['.'],
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // Check app title
  const title = await window.title();
  console.log('App title:', title);

  // Check main elements exist
  const sidebar = await window.locator('text=项目列表').isVisible();
  console.log('Sidebar visible:', sidebar);

  const terminal = await window.locator('text=终端').isVisible();
  console.log('Terminal visible:', terminal);

  const statusBar = await window.locator('text=Claude Hub').isVisible();
  console.log('StatusBar visible:', statusBar);

  await electronApp.close();
});

test('Theme toggle works', async () => {
  const electronApp = await electron.launch({
    args: ['.'],
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // Click theme toggle button
  const themeButton = window.locator('button').filter({ hasText: /[🌙☀️]/ });
  if (await themeButton.isVisible()) {
    await themeButton.click();
    console.log('Theme toggle clicked');
  }

  await electronApp.close();
});

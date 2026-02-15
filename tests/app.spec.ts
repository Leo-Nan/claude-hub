import { test, expect } from '@playwright/test';
import { _electron as electron } from '@playwright/test';

test('Claude Hub packaged app loads correctly', async () => {
  // Use the packaged app
  const appPath = 'release/Claude Hub-win32-x64/Claude Hub.exe';

  const electronApp = await electron.launch({
    executablePath: appPath,
    args: [],
  });

  const window = await electronApp.firstWindow();

  // Wait for app to load
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(3000);

  // Get title
  const title = await window.title();
  console.log('App title:', title);

  // Check content
  const content = await window.content();
  const hasProjectList = content.includes('项目列表');
  const hasTerminal = content.includes('终端');
  const hasStatusBar = content.includes('Claude Hub');

  console.log('项目列表 visible:', hasProjectList);
  console.log('终端 visible:', hasTerminal);
  console.log('StatusBar visible:', hasStatusBar);

  // Check for errors
  const errors: string[] = [];
  window.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await window.waitForTimeout(2000);

  if (errors.length > 0) {
    console.log('Console errors:', errors);
  }

  await electronApp.close();

  // Assertions
  expect(hasProjectList || hasTerminal || hasStatusBar).toBe(true);
});

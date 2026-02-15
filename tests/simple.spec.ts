import { test, expect } from '@playwright/test';
import { _electron as electron } from '@playwright/test';

const APP_PATH = 'release/Claude Hub-win32-x64/Claude Hub.exe';

test('应用启动测试', async () => {
  const electronApp = await electron.launch({
    executablePath: APP_PATH,
    args: [],
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(5000);

  const title = await window.title();
  console.log('App title:', title);

  const content = await window.content();
  console.log('Content length:', content.length);

  // 检查关键元素
  const hasProject = content.includes('项目') || content.includes('Project');
  const hasTerminal = content.includes('终端') || content.includes('Terminal');
  const hasStatusBar = content.includes('Status') || content.includes('状态');

  console.log('Has Project:', hasProject);
  console.log('Has Terminal:', hasTerminal);
  console.log('Has StatusBar:', hasStatusBar);

  // 检查错误
  const errors: string[] = [];
  window.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await window.waitForTimeout(2000);
  console.log('Console errors:', errors.length > 0 ? errors : 'None');

  await electronApp.close();

  // 验证基本功能
  expect(title).toContain('Claude Hub');
});

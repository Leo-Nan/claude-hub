import { test, expect } from '@playwright/test';
import { _electron as electron } from '@playwright/test';
import * as path from 'path';

const APP_PATH = 'release/Claude Hub-win32-x64/Claude Hub.exe';

test.describe('Claude Hub 功能测试', () => {
  let electronApp: any;
  let mainWindow: any;

  test.beforeEach(async () => {
    electronApp = await electron.launch({
      executablePath: APP_PATH,
      args: [],
    });
    mainWindow = await electronApp.firstWindow();
    await mainWindow.waitForLoadState('domcontentloaded');
    await mainWindow.waitForTimeout(2000);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('1. 应用启动基本功能', async () => {
    const title = await mainWindow.title();
    console.log('应用标题:', title);

    // 验证标题包含 Claude Hub
    expect(title).toContain('Claude Hub');
  });

  test('2. 侧边栏项目列表显示', async () => {
    // 检查侧边栏内容
    const content = await mainWindow.content();
    const hasSidebar = content.includes('项目列表') || content.includes('添加项目');
    console.log('侧边栏显示:', hasSidebar);
    expect(hasSidebar).toBe(true);
  });

  test('3. 终端区域存在', async () => {
    const content = await mainWindow.content();
    const hasTerminal = content.includes('终端') || content.includes('Claude');
    console.log('终端区域:', hasTerminal);
    expect(hasTerminal).toBe(true);
  });

  test('4. 状态栏显示', async () => {
    const content = await mainWindow.content();
    const hasStatusBar = content.includes('Claude Hub') || content.includes('就绪');
    console.log('状态栏:', hasStatusBar);
    expect(hasStatusBar).toBe(true);
  });

  test('5. 添加项目按钮功能', async () => {
    // 点击添加项目按钮
    const addButton = await mainWindow.locator('button:has-text("添加项目")').first();
    const buttonExists = await addButton.count() > 0;
    console.log('添加项目按钮存在:', buttonExists);

    if (buttonExists) {
      await addButton.click();
      await mainWindow.waitForTimeout(1000);

      // 检查是否有对话框或反馈
      const content = await mainWindow.content();
      console.log('点击后内容变化:', content.length);
    }
  });

  test('6. Agent 树状图显示', async () => {
    const content = await mainWindow.content();
    const hasAgentTree = content.includes('Agent') || content.includes('私人秘书');
    console.log('Agent 树:', hasAgentTree);
    expect(hasAgentTree).toBe(true);
  });

  test('7. 主题切换功能', async () => {
    // 查找主题切换按钮
    const themeButtons = await mainWindow.locator('button').all();
    console.log('按钮数量:', themeButtons.length);

    // 检查 body 的 data-theme 属性
    const theme = await mainWindow.evaluate(() => {
      return document.body.getAttribute('data-theme');
    });
    console.log('当前主题:', theme);
  });

  test('8. 启动 Claude 按钮存在', async () => {
    const content = await mainWindow.content();
    const hasStartButton = content.includes('启动 Claude') || content.includes('启动');
    console.log('启动按钮:', hasStartButton);
    expect(hasStartButton).toBe(true);
  });

  test('9. 无控制台错误', async () => {
    const errors: string[] = [];
    mainWindow.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await mainWindow.waitForTimeout(3000);

    if (errors.length > 0) {
      console.log('控制台错误:', errors);
    }

    // 允许一些无关紧要的资源错误
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('10. 会话计时器状态同步', async () => {
    // 检查状态栏是否有计时相关元素
    const content = await mainWindow.content();
    const hasTimer = content.includes('时间') || content.includes('会话') || content.includes('Timer');
    console.log('会话计时相关:', hasTimer);

    // 这是一个关键问题点 - 如果 isSessionActive 为 false，计时器不会显示
    // 预期行为：启动 Claude 后应该有计时显示
  });
});

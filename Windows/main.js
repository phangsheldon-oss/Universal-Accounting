const { app, BrowserWindow, ipcMain } = require('electron');
const { execFile } = require('node:child_process');
const { createHash } = require('node:crypto');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { promisify } = require('node:util');

const appFile = path.join(__dirname, 'index.html');
const appUrl = pathToFileURL(appFile).href;
const run = promisify(execFile);

async function getDeviceId() {
  const registry = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'reg.exe');
  const { stdout } = await run(registry, [
    'query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid', '/reg:64'
  ], { timeout: 5000, windowsHide: true });
  const match = stdout.match(/^\s*MachineGuid\s+REG_SZ\s+([a-f0-9-]+)\s*$/im);
  if (!match) throw new Error('Windows device identity unavailable');
  return createHash('sha256').update('Universal Accounting windows:' + match[1].toLowerCase()).digest('hex');
}

app.setName('Universal Accounting');
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    const win = new BrowserWindow({
      width: 1280, height: 850, minWidth: 850, minHeight: 600,
      icon: path.join(__dirname, 'icon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });
    ipcMain.handle('licensing:device-id', (event) => {
      if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame
          || event.senderFrame.url.split('#')[0] !== appUrl) {
        throw new Error('Device identity request denied');
      }
      return getDeviceId();
    });
    app.on('second-instance', () => {
      if (win.isMinimized()) win.restore();
      win.focus();
    });
    win.setMenuBarVisibility(false);
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', (event, url) => {
      if (url.split('#')[0] !== appUrl) event.preventDefault();
    });
    win.loadFile(appFile);
  });
}
app.on('window-all-closed', () => app.quit());

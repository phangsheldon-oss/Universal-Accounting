const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

app.setName('Universal Accounting');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280, height: 850, minWidth: 850, minHeight: 600,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

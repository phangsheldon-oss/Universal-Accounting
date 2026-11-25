const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('UALicenceDevice', {
  getDeviceId: () => ipcRenderer.invoke('licensing:device-id')
});

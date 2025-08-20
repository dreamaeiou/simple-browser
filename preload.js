const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadUrl: (url) => ipcRenderer.invoke('load-url', url),
    onUrlLoaded: (callback) => ipcRenderer.on('url-loaded', callback)
});
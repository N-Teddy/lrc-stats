const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: (filename) => ipcRenderer.invoke('db:load', filename),
    saveData: (filename, data) => ipcRenderer.invoke('db:save', { filename, data }),
    ping: () => ipcRenderer.invoke('ping'),
});

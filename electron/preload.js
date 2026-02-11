const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: (filename) => ipcRenderer.invoke('db:load', filename),
    saveData: (filename, data) => ipcRenderer.invoke('db:save', { filename, data }),
    saveImage: (id, base64Data) => ipcRenderer.invoke('db:saveImage', { id, base64Data }),
    ping: () => ipcRenderer.invoke('ping'),
});

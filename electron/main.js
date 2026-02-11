const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

const fs = require('fs').promises;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hidden', // Modern look
        titleBarOverlay: {
            color: '#0a0a0a',
            symbolColor: '#ffffff'
        }
    });

    if (isDev) {
        win.loadURL('http://localhost:3000');
        // win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Database Helpers
const DB_PATH = path.join(app.getPath('userData'), 'db');

async function ensureDbExists() {
    try {
        await fs.mkdir(DB_PATH, { recursive: true });
        const files = ['people.json', 'activities.json', 'attendance.json'];
        for (const file of files) {
            const filePath = path.join(DB_PATH, file);
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, JSON.stringify([]));
            }
        }
    } catch (err) {
        console.error('Failed to initialize DB directory', err);
    }
}

// IPC Handlers
ipcMain.handle('db:load', async (event, filename) => {
    try {
        const filePath = path.join(DB_PATH, `${filename}.json`);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading ${filename}:`, err);
        return [];
    }
});

ipcMain.handle('db:save', async (event, { filename, data }) => {
    try {
        const filePath = path.join(DB_PATH, `${filename}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (err) {
        console.error(`Error saving ${filename}:`, err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('ping', () => 'pong');

app.whenReady().then(async () => {
    await ensureDbExists();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

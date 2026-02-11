const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs').promises;

// Database & Images Paths
const USER_DATA_PATH = app.getPath('userData');
const DB_PATH = path.join(USER_DATA_PATH, 'db');
const IMAGES_PATH = path.join(USER_DATA_PATH, 'images');

// Register custom protocol for images
protocol.registerSchemesAsPrivileged([
    { scheme: 'lrc-img', privileges: { bypassCSP: true, secure: true, supportFetchAPI: true } }
]);

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
async function ensureDbExists() {
    try {
        await fs.mkdir(DB_PATH, { recursive: true });
        await fs.mkdir(IMAGES_PATH, { recursive: true });

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
        console.error('Failed to initialize local storage', err);
    }
}

// IPC Handlers
ipcMain.handle('db:load', async (event, filename) => {
    try {
        const filePath = path.join(DB_PATH, `${filename}.json`);
        console.log(`[IPC] Loading ${filename} from ${filePath}`);
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
        console.log(`[IPC] Saving ${filename} (${data.length} records) to ${filePath}`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (err) {
        console.error(`Error saving ${filename}:`, err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('db:saveImage', async (event, { id, base64Data }) => {
    try {
        // Remove header (data:image/png;base64,)
        const base64Image = base64Data.split(';base64,').pop();
        const fileName = `${id}_${Date.now()}.png`;
        const filePath = path.join(IMAGES_PATH, fileName);

        await fs.writeFile(filePath, base64Image, { encoding: 'base64' });
        console.log(`[IPC] Image saved to ${filePath}`);

        // Return the custom protocol URL
        return { success: true, url: `lrc-img://${fileName}` };
    } catch (err) {
        console.error('Error saving image:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('ping', () => 'pong');

app.whenReady().then(async () => {
    // Register the image protocol handler
    protocol.handle('lrc-img', (request) => {
        const file = request.url.replace('lrc-img://', '');
        return net.fetch('file://' + path.join(IMAGES_PATH, file));
    });

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

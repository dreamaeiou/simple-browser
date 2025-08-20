const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('renderer/index.html');

    // 开发模式下打开开发者工具
    // if (process.argv.includes('--dev')) {
    //     mainWindow.webContents.openDevTools();
    // }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// IPC通信处理
ipcMain.handle('load-url', async (event, url) => {
    try {
        // 这里可以调用浏览器引擎
        const BrowserEngine = require('./browser/engine');
        const engine = new BrowserEngine();
        const result = await engine.loadUrl(url);
        return result;
    } catch (error) {
        return { error: error.message };
    }
});
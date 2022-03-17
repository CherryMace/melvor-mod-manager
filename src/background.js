'use strict'

import {
    app,
    protocol,
    BrowserWindow,
    ipcMain
} from 'electron';
import {
    createProtocol
} from 'vue-cli-plugin-electron-builder/lib';
import installExtension, {
    VUEJS_DEVTOOLS
} from 'electron-devtools-installer';
import windowStateKeeper from 'electron-window-state';
import processHandler from './processHandler';
import fileHandler from './fileHandler';
import modsHandler from './modsHandler';
import path from 'path';
import {
    autoUpdater,
    UpdateCheckResult
} from 'electron-updater';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
    scheme: 'app',
    privileges: {
        secure: true,
        standard: true
    }
}]);

async function createWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    });

    // Create the browser window.
    const win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
    });

    mainWindowState.manage(win);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.removeMenu();
        win.loadURL('app://./index.html');

		// https://nodejs.org/api/process.html
        if (process.platform in ["win32"]) {
            autoUpdater.checkForUpdatesAndNotify().catch(err => {
                console.log("Failed to check for updates, maybe latest.yml is missing? :(");
            });
        } else if (process.platform in ["linux"]) {
            console.log("Currently no Linux latest-linux.yml");
            //autoUpdater.setFeedUrl({
            //provider: 'generic',
            //url: ""
            //})
            //autoUpdater.checkForUpdatesAndNotify().catch(err => {
            //console.log("Failed to check for updates, maybe latest-linux.yml is missing? :(");
            //});
        } else if (process.platform in ["darwin"]) {
            console.log("Currently no Linux latest-mac.yml");
        } else {
            console.log("Auto updates for this version is not supported");
        }
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString());
        }
    }

    ipcMain.handle('process', processHandler);
    ipcMain.handle('file', fileHandler);
    ipcMain.handle('mods', modsHandler);

    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}

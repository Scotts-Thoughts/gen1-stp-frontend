// Modules to control application life and create native browser window
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const { app, shell, BrowserWindow, ipcMain } = require('electron')
const path = require("path");

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            sandbox: false,
            contextIsolation: false,
            nodeIntegration: true,
        },
    });
    const contentBounds = mainWindow.getContentBounds();
    const titleBarHeight = 1080 - contentBounds.height;
    const borderWidth = (1920 - contentBounds.width) / 2;
    if (titleBarHeight > 0 && borderWidth > 0) {
        mainWindow.setSize(1920 + borderWidth * 2, 1080 + titleBarHeight);
    }
    ipcMain.handle('settings_dir', () => app.getPath("userData"))

    mainWindow.on('resize', () => {
        // Get the new size of the window
        const { width } = mainWindow.getContentBounds();
        const { height } = mainWindow.getContentBounds();
        const horizontalZoomFactor = width / 1920;
        const verticalZoomFactor = height / 1080;
        let zoomFactor = 1;
        //take the smaller factor
        if (horizontalZoomFactor > verticalZoomFactor) {
            zoomFactor = verticalZoomFactor;
        }
        else {
            zoomFactor = horizontalZoomFactor;
        }
        if (zoomFactor > 0) {
            mainWindow.webContents.setZoomFactor(zoomFactor);
        }
    })

    mainWindow.on('ready-to-show', () => {
        //zoom the window appropriately before showing
        const { width } = mainWindow.getContentBounds();
        const { height } = mainWindow.getContentBounds();
        const horizontalZoomFactor = width / 1920;
        const verticalZoomFactor = height / 1080;
        let zoomFactor = 1;
        //take the smaller factor
        if (horizontalZoomFactor > verticalZoomFactor) {
            zoomFactor = verticalZoomFactor;
        }
        else {
            zoomFactor = horizontalZoomFactor;
        }
        if (zoomFactor > 0) {
            mainWindow.webContents.setZoomFactor(zoomFactor);
        }
        mainWindow.show();
        // mainWindow.webContents.openDevTools()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    if (is.dev) {
        const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
        installExtension(VUEJS_DEVTOOLS)
            .then((ext) => console.log(`Added Extension:    ${JSON.stringify(ext.name)}`))
            .catch((err) => console.log('An error occurred: ', err));
    }
        // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
        window._userData = app.getPath('userData');
    });
    createWindow();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

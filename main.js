// Modules to control application life and create native browser window
const { app, shell, BrowserWindow } = require('electron')
const path = require('path')
const { electronApp, optimizer } = require('@electron-toolkit/utils')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: true
    },
  })
  const contentBounds = mainWindow.getContentBounds()
    const titleBarHeight = 1080 - contentBounds.height
    const borderWidth = (1920 - contentBounds.width) / 2
    if(titleBarHeight > 0 && borderWidth > 0)
    mainWindow.setSize(1920 + borderWidth * 2, 1080 + titleBarHeight)

  mainWindow.on('resize', () => {
    // Get the new size of the window
    const { width } = mainWindow.getContentBounds();
    const { height } = mainWindow.getContentBounds();
    const horizontalZoomFactor = width / 1920;
    const verticalZoomFactor = height / 1080;
    let zoomFactor = 1;
    //take the smaller factor
    if(horizontalZoomFactor > verticalZoomFactor){
      zoomFactor = verticalZoomFactor;
    }
    else {
      zoomFactor = horizontalZoomFactor;
    }
    mainWindow.webContents.setZoomFactor(zoomFactor);
  })

  mainWindow.on('ready-to-show', () => {
    // const contentBounds = mainWindow.getContentBounds()
    // const titleBarHeight = 1080 - contentBounds.height
    // const borderWidth = (1920 - contentBounds.width) / 2
    // if(titleBarHeight > 0 && borderWidth > 0)
    // mainWindow.setSize(1920 + borderWidth * 2, 1080 + titleBarHeight)
    const { width } = mainWindow.getContentBounds();
    const { height } = mainWindow.getContentBounds();
    const horizontalZoomFactor = width / 1920;
    const verticalZoomFactor = height / 1080;
    let zoomFactor = 1;
    //take the smaller factor
    if(horizontalZoomFactor > verticalZoomFactor){
      zoomFactor = verticalZoomFactor;
    }
    else {
      zoomFactor = horizontalZoomFactor;
    }
    mainWindow.webContents.setZoomFactor(zoomFactor);
    mainWindow.show()
    // mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'app/index.html'))
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

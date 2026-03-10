import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { getSettings } from './store/settings'

let mainWindow: BrowserWindow | null = null
let isQuitting = false

function shouldOpenExternally(url: string) {
  return /^https?:\/\//i.test(url)
}

export function getMainWindow() {
  return mainWindow
}

export function markAppQuitting() {
  isQuitting = true
}

export function showMainWindow() {
  if (!mainWindow) {
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.show()
  mainWindow.focus()
}

export function createMainWindow() {
  if (mainWindow) {
    return mainWindow
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    title: 'Batt Helper',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0b1120',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    const settings = getSettings()
    if (!settings.startInTray) {
      mainWindow?.show()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (shouldOpenExternally(url)) {
      void shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!shouldOpenExternally(url)) {
      return
    }
    event.preventDefault()
    void shell.openExternal(url)
  })

  mainWindow.on('close', (event) => {
    const settings = getSettings()
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

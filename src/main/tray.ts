import { Menu, Tray, app, nativeImage } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { battBridgeService } from './services/batt-bridge'
import { tBatteryStateMain, tMain } from './services/i18n'
import { getSettings } from './store/settings'
import { log } from './services/logger'
import { showMainWindow } from './window'

let tray: Tray | null = null
let pollTimer: NodeJS.Timeout | null = null
const trayLogoFile = 'app-logo-primary.png'

function resolveIcon(name: string) {
  const candidates = [
    join(app.getAppPath(), 'resources/brand', name),
    join(process.resourcesPath, 'app.asar', 'resources/brand', name),
    join(process.resourcesPath, 'resources/brand', name),
    join(process.cwd(), 'resources/brand', name),
  ]

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]
}

function createTrayImage(fileName: string) {
  const iconPath = resolveIcon(fileName)
  const image = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 })

  if (image.isEmpty()) {
    log('tray', 'icon-load-failed', { fileName, iconPath })
    return image
  }

  return image
}

function applyTrayVisual(fallbackTitle = 'BH') {
  if (!tray) {
    return
  }

  const image = createTrayImage(trayLogoFile)
  if (image.isEmpty()) {
    tray.setTitle(fallbackTitle)
    return
  }

  tray.setTitle('')
  tray.setImage(image)
}

export async function refreshTray() {
  if (!tray) {
    return
  }

  const locale = getSettings().locale
  const appName = tMain('common.appName', {}, locale)

  applyTrayVisual()

  try {
    const status = await battBridgeService.getStatus()
    const percent = status.battery.currentChargePercent
    tray.setToolTip(`${appName} · ${percent}% · ${tBatteryStateMain(status.battery.state, locale)}`)

    const menu = Menu.buildFromTemplate([
      { label: tMain('tray.chargePercent', { percent }, locale), enabled: false },
      { label: tMain('tray.status', { status: tBatteryStateMain(status.battery.state, locale) }, locale), enabled: false },
      { type: 'separator' },
      { label: tMain('tray.open', { appName }, locale), click: () => showMainWindow() },
      { label: tMain('tray.refresh', {}, locale), click: () => void refreshTray() },
      { type: 'separator' },
      { label: tMain('tray.set60', {}, locale), click: async () => battBridgeService.setLimit(60) },
      { label: tMain('tray.set80', {}, locale), click: async () => battBridgeService.setLimit(80) },
      { label: tMain('tray.disableLimit', {}, locale), click: async () => battBridgeService.disableLimit() },
      { type: 'separator' },
      { label: tMain('tray.quit', { appName }, locale), click: () => app.quit() },
    ])
    tray.setContextMenu(menu)
  } catch {
    tray.setToolTip(tMain('tray.tooltipDisconnected', { appName }, locale))
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: tMain('tray.notConnected', {}, locale), enabled: false },
        { type: 'separator' },
        { label: tMain('tray.open', { appName }, locale), click: () => showMainWindow() },
        { label: tMain('tray.quit', { appName }, locale), click: () => app.quit() },
      ]),
    )
  }
}

export function createTray() {
  if (tray) {
    return tray
  }

  tray = new Tray(createTrayImage(trayLogoFile))
  tray.setIgnoreDoubleClickEvents(true)
  tray.on('click', () => {
    tray?.popUpContextMenu()
  })

  void refreshTray()
  pollTimer = setInterval(() => void refreshTray(), 15_000)
  return tray
}

export function destroyTray() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  tray?.destroy()
  tray = null
}

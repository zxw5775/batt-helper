import { Menu, type MenuItemConstructorOptions, app, shell } from 'electron'
import { refreshTray } from './tray'
import { tMain } from './services/i18n'
import { getSettings } from './store/settings'
import { hideMainWindow, showMainWindow } from './window'

function buildApplicationMenu(): Menu {
  const locale = getSettings().locale
  const template: MenuItemConstructorOptions[] = []

  const appName = tMain('common.appName', {}, locale)

  if (process.platform === 'darwin') {
    template.push({
      label: tMain('menu.app', { appName }, locale),
      submenu: [
        { label: tMain('menu.about', { appName }, locale), role: 'about' },
        { type: 'separator' },
        { label: tMain('menu.services', {}, locale), role: 'services' },
        { type: 'separator' },
        { label: tMain('menu.hide', { appName }, locale), role: 'hide' },
        { label: tMain('menu.hideOthers', {}, locale), role: 'hideOthers' },
        { label: tMain('menu.showAll', {}, locale), role: 'unhide' },
        { type: 'separator' },
        { label: tMain('menu.quit', { appName }, locale), role: 'quit' },
      ],
    })
  }

  template.push(
    {
      label: tMain('menu.edit', {}, locale),
      submenu: [
        { label: tMain('menu.undo', {}, locale), role: 'undo' },
        { label: tMain('menu.redo', {}, locale), role: 'redo' },
        { type: 'separator' },
        { label: tMain('menu.cut', {}, locale), role: 'cut' },
        { label: tMain('menu.copy', {}, locale), role: 'copy' },
        { label: tMain('menu.paste', {}, locale), role: 'paste' },
        { label: tMain('menu.selectAll', {}, locale), role: 'selectAll' },
      ],
    },
    {
      label: tMain('menu.view', {}, locale),
      submenu: [
        { label: tMain('menu.reload', {}, locale), role: 'reload' },
        { label: tMain('menu.forceReload', {}, locale), role: 'forceReload' },
        { label: tMain('menu.toggleDevTools', {}, locale), role: 'toggleDevTools' },
        { type: 'separator' },
        { label: tMain('menu.resetZoom', {}, locale), role: 'resetZoom' },
        { label: tMain('menu.zoomIn', {}, locale), role: 'zoomIn' },
        { label: tMain('menu.zoomOut', {}, locale), role: 'zoomOut' },
        { type: 'separator' },
        { label: tMain('menu.toggleFullscreen', {}, locale), role: 'togglefullscreen' },
      ],
    },
    {
      label: tMain('menu.window', {}, locale),
      submenu: [
        { label: tMain('menu.openMainWindow', {}, locale), click: () => showMainWindow() },
        { label: tMain('menu.minimize', {}, locale), role: 'minimize' },
        { label: tMain('menu.close', {}, locale), click: () => hideMainWindow() },
        ...(process.platform === 'darwin'
          ? [{ type: 'separator' as const }, { label: tMain('menu.bringAllToFront', {}, locale), role: 'front' as const }]
          : []),
      ],
    },
    {
      label: tMain('menu.help', {}, locale),
      submenu: [
        { label: tMain('menu.refreshStatus', {}, locale), click: () => void refreshTray() },
        { label: tMain('menu.releasePage', {}, locale), click: () => void shell.openExternal('https://github.com/zxw5775/batt-helper/releases') },
      ],
    },
  )

  return Menu.buildFromTemplate(template)
}

export function refreshNativeMenus() {
  app.setName(tMain('common.appName'))
  configureAboutPanel()
  Menu.setApplicationMenu(buildApplicationMenu())
  void refreshTray()
}

export function configureAboutPanel() {
  app.setAboutPanelOptions({
    applicationName: tMain('common.appName'),
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    credits: 'Core powered by batt',
  })
}

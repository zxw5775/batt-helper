import { Notification } from 'electron'

export function notify(title: string, body: string) {
  if (!Notification.isSupported()) {
    return
  }

  new Notification({ title, body }).show()
}

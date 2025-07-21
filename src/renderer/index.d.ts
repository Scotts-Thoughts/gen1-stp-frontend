import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      settings_dir: () => Promise<string>,
    }
  }
}

import { storage } from "#imports"
import type { AppConfig } from "@/types/messages"

const APP_CONFIG_FALLBACK: AppConfig = {
  yesCode: { showUsage: false },
  cursorSettings: { showUsage: false },
  packyCodex: { showUsage: false },
  bookmarks: { items: [] },
  sendCookie: [],
  miniMax: { apiKey: "", showUsage: false },
}

export const appConfig = storage.defineItem<AppConfig>("local:appConfig", {
  fallback: APP_CONFIG_FALLBACK,
})

export async function getAppConfig(): Promise<AppConfig> {
  const stored = await appConfig.getValue()

  return {
    yesCode: Object.assign({}, APP_CONFIG_FALLBACK.yesCode, stored?.yesCode),
    cursorSettings: Object.assign(
      {},
      APP_CONFIG_FALLBACK.cursorSettings,
      stored?.cursorSettings,
    ),
    packyCodex: Object.assign(
      {},
      APP_CONFIG_FALLBACK.packyCodex,
      stored?.packyCodex,
    ),
    bookmarks: Object.assign(
      {},
      APP_CONFIG_FALLBACK.bookmarks,
      stored?.bookmarks,
    ),
    sendCookie: stored?.sendCookie ?? APP_CONFIG_FALLBACK.sendCookie,
    miniMax: Object.assign({}, APP_CONFIG_FALLBACK.miniMax, stored?.miniMax),
  }
}

export async function saveAppConfig(config: Partial<AppConfig>): Promise<void> {
  const current = await appConfig.getValue()
  await appConfig.setValue({ ...current, ...config })
}

export function watchAppConfig(
  callback: (newValue: AppConfig, oldValue: AppConfig) => void,
) {
  return appConfig.watch(callback)
}

export { APP_CONFIG_FALLBACK }

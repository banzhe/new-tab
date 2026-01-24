import { storage } from "#imports"
import type { AppConfig } from "@/types/messages"

const APP_CONFIG_FALLBACK: AppConfig = {
  yesCode: { showUsage: false },
  cursorSettings: { showUsage: false },
  bookmarks: { items: [] },
  sendCookie: [],
  miniMax: { apiKey: "", showUsage: false },
}

export const appConfig = storage.defineItem<AppConfig>("local:appConfig", {
  fallback: APP_CONFIG_FALLBACK,
})

export async function getAppConfig(): Promise<AppConfig> {
  return await appConfig.getValue()
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

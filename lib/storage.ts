import { storage } from "#imports"
import type { SendCookieConfig, YesCodeConfig } from "@/types/messages"

// 定义 YesCode 配置存储项
export const yesCodeConfig = storage.defineItem<YesCodeConfig>(
  "local:yesCodeConfig",
  {
    fallback: {
      apiKey: "",
      showBalance: true,
      showCursorUsage: true,
      bookmarks: [],
    },
  },
)

// 定义 SendCookie 配置存储项（与 yesCodeConfig 平级）
export const sendCookieConfig = storage.defineItem<SendCookieConfig>(
  "local:sendCookieConfig",
  {
    fallback: [],
  },
)

// 便捷方法：获取配置
export async function getConfig(): Promise<YesCodeConfig> {
  return await yesCodeConfig.getValue()
}

// 便捷方法：保存配置
export async function saveConfig(config: YesCodeConfig): Promise<void> {
  await yesCodeConfig.setValue(config)
}

// 便捷方法：监听配置变化
export function watchConfig(
  callback: (newValue: YesCodeConfig, oldValue: YesCodeConfig) => void,
) {
  return yesCodeConfig.watch(callback)
}

// SendCookie 配置便捷方法：获取配置
export async function getSendCookieConfig(): Promise<SendCookieConfig> {
  return await sendCookieConfig.getValue()
}

// SendCookie 配置便捷方法：保存配置
export async function saveSendCookieConfig(
  config: SendCookieConfig,
): Promise<void> {
  await sendCookieConfig.setValue(config)
}

// SendCookie 配置便捷方法：监听配置变化
export function watchSendCookieConfig(
  callback: (newValue: SendCookieConfig, oldValue: SendCookieConfig) => void,
) {
  return sendCookieConfig.watch(callback)
}

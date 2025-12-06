import { storage } from "#imports"
import type { YesCodeConfig } from "@/types/messages"

// 定义 YesCode 配置存储项
export const yesCodeConfig = storage.defineItem<YesCodeConfig>(
  "local:yesCodeConfig",
  {
    fallback: {
      apiKey: "",
      showBalance: true,
      bookmarks: [],
    },
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

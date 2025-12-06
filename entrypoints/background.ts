import { fetchCursorUsage, fetchYesCodeBalance } from "@/lib/api"
import { getConfig, saveConfig } from "@/lib/storage"
import {
  type ExtensionMessage,
  type MessageResponse,
  MessageType,
} from "@/types/messages"

export default defineBackground(() => {
  console.log("Background script initialized", { id: browser.runtime.id })

  // 监听来自前端的消息
  browser.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      _sender,
      sendResponse: (response: MessageResponse) => void,
    ) => {
      // 异步处理消息
      handleMessage(message)
        .then((response) => sendResponse(response))
        .catch((error) =>
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "未知错误",
          }),
        )

      // 返回 true 表示异步响应
      return true
    },
  )

  /**
   * 消息路由处理器
   */
  async function handleMessage(
    message: ExtensionMessage,
  ): Promise<MessageResponse> {
    try {
      switch (message.type) {
        case MessageType.GET_CONFIG: {
          const config = await getConfig()
          return { success: true, data: config }
        }

        case MessageType.SAVE_CONFIG: {
          await saveConfig(message.payload)
          // 广播配置更新通知
          await notifyConfigUpdate()
          return { success: true }
        }

        case MessageType.FETCH_BALANCE: {
          const config = await getConfig()

          if (!config.apiKey) {
            return {
              success: false,
              error: "请先在设置中配置 API Key",
            }
          }

          const balanceData = await fetchYesCodeBalance(config.apiKey)
          return { success: true, data: balanceData }
        }

        case MessageType.FETCH_CURSOR_USAGE: {
          // 获取 cursor.com 的认证 cookie
          const cookies = await browser.cookies.getAll({
            domain: "cursor.com",
          })

          if (!cookies || cookies.length === 0) {
            return {
              success: false,
              error: "请先在浏览器中登录 cursor.com",
            }
          }

          // 将所有 cookie 拼接成字符串
          const cookieString = cookies
            .map((c) => `${c.name}=${c.value}`)
            .join("; ")

          const usageData = await fetchCursorUsage(cookieString)
          return { success: true, data: usageData }
        }

        default: {
          const unknownMessage = message as { type: string }
          return {
            success: false,
            error: `未知的消息类型: ${unknownMessage.type}`,
          }
        }
      }
    } catch (error) {
      console.error("Message handling error:", error)
      throw error
    }
  }

  /**
   * 广播配置更新通知到所有标签页
   */
  async function notifyConfigUpdate() {
    try {
      const tabs = await browser.tabs.query({})

      for (const tab of tabs) {
        if (tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, {
              type: MessageType.CONFIG_UPDATED,
            })
          } catch (error) {
            // 忽略无法接收消息的标签页（例如 chrome:// 页面）
            console.debug(`无法通知标签页 ${tab.id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to notify config update:", error)
    }
  }
})

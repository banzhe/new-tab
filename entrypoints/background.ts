import { fetchCursorUsage, fetchYesCodeBalance } from "@/lib/api"
import {
  getConfig,
  getSendCookieConfig,
  saveConfig,
  saveSendCookieConfig,
} from "@/lib/storage"
import type {
  ExtensionMessage,
  MessageResponse,
  SendCookieConfigItem,
} from "@/types/messages"
import { MessageType } from "@/types/messages"

export default defineBackground(() => {
  console.log("Background script initialized", { id: browser.runtime.id })

  // 定时器管理：使用 Map 存储每个配置项的定时器 ID
  const cookieTimers = new Map<string, number>()

  // 初始化定时器（异步执行，不阻塞）
  ;(async () => {
    try {
      await initializeCookieTimers()
    } catch (error) {
      console.error("Failed to initialize cookie timers:", error)
    }
  })()

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
          const balanceData = await fetchYesCodeBalance()
          return { success: true, data: balanceData }
        }

        case MessageType.FETCH_CURSOR_USAGE: {
          const usageData = await fetchCursorUsage()
          return { success: true, data: usageData }
        }

        case MessageType.GET_SEND_COOKIE_CONFIG: {
          const config = await getSendCookieConfig()
          return { success: true, data: config }
        }

        case MessageType.SAVE_SEND_COOKIE_CONFIG: {
          await saveSendCookieConfig(message.payload)
          // 重新初始化定时器
          await initializeCookieTimers()
          // 广播配置更新通知
          await notifySendCookieConfigUpdate()
          return { success: true }
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

  /**
   * 广播 SendCookie 配置更新通知到所有标签页
   */
  async function notifySendCookieConfigUpdate() {
    try {
      const tabs = await browser.tabs.query({})

      for (const tab of tabs) {
        if (tab.id) {
          try {
            await browser.tabs.sendMessage(tab.id, {
              type: MessageType.SEND_COOKIE_CONFIG_UPDATED,
            })
          } catch (error) {
            // 忽略无法接收消息的标签页（例如 chrome:// 页面）
            console.debug(`无法通知标签页 ${tab.id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("Failed to notify sendCookie config update:", error)
    }
  }

  /**
   * 发送 cookies 到后端 API
   */
  async function sendCookiesToBackend(config: SendCookieConfigItem) {
    try {
      // 获取指定域名的所有 cookie
      const cookies = await browser.cookies.getAll({
        domain: config.domain,
      })

      if (!cookies || cookies.length === 0) {
        console.log(`未找到域名 ${config.domain} 的 cookie`)
        return
      }

      // 转换为 { name, value, domain } 格式
      const cookieData = cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
      }))

      // 发送 POST 请求到后端
      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cookies: cookieData }),
      })

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, statusText: ${response.statusText}`,
        )
      }

      console.log(`成功发送 ${cookieData.length} 个 cookie 到 ${config.apiUrl}`)
    } catch (error) {
      console.error(
        `发送 cookie 到 ${config.apiUrl} 失败:`,
        error instanceof Error ? error.message : error,
      )
    }
  }

  /**
   * 为单个配置项创建定时器
   */
  function createTimerForConfig(config: SendCookieConfigItem) {
    // 如果已存在定时器，先清除
    const existingTimer = cookieTimers.get(config.domain)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 如果未启用，不创建定时器
    if (!config.enabled) {
      return
    }

    // 创建定时器函数
    const scheduleNext = () => {
      // 立即执行一次
      sendCookiesToBackend(config)

      // 设置下次执行
      const timerId = setTimeout(scheduleNext, config.interval)
      cookieTimers.set(config.domain, timerId as unknown as number)
    }

    // 启动定时器
    scheduleNext()
  }

  /**
   * 初始化所有 cookie 定时器
   */
  async function initializeCookieTimers() {
    // 清除所有现有定时器
    for (const timerId of cookieTimers.values()) {
      clearTimeout(timerId)
    }
    cookieTimers.clear()

    // 读取配置
    const configs = await getSendCookieConfig()

    // 为每个启用的配置项创建定时器
    for (const config of configs) {
      if (config.enabled) {
        createTimerForConfig(config)
      }
    }

    console.log(
      `已初始化 ${configs.filter((c) => c.enabled).length} 个 cookie 定时器`,
    )
  }
})

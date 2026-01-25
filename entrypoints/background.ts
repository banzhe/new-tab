import {
  fetchCursorUsage,
  fetchMiniMaxRemains,
  fetchYesCodeBalance,
} from "@/lib/api"
import { getAppConfig, saveAppConfig } from "@/lib/storage"
import type { AppConfig } from "@/types/messages"
import { MessageType } from "@/types/messages"

import "webext-bridge/background"
import { onMessage, sendMessage } from "webext-bridge/background"

export default defineBackground(() => {
  console.log("Background script initialized", { id: browser.runtime.id })

  const cookieTimers = new Map<string, number>()

  ;(async () => {
    try {
      await initializeCookieTimers()
    } catch (error) {
      console.error("Failed to initialize cookie timers:", error)
    }
  })()

  onMessage(MessageType.GET_APP_CONFIG, async () => {
    const config = await getAppConfig()
    return { success: true, data: config }
  })

  onMessage(
    MessageType.SAVE_APP_CONFIG,
    async ({ data }: { data?: Partial<AppConfig> }) => {
      await saveAppConfig(data ?? {})
      await sendMessage(MessageType.APP_CONFIG_UPDATED, null, "options")
      await initializeCookieTimers()
      return { success: true }
    },
  )

  onMessage(MessageType.FETCH_BALANCE, async () => {
    const cookies = await browser.cookies.getAll({
      domain: "yes.vg",
    })

    if (!cookies || cookies.length === 0) {
      return {
        success: false,
        error: "请先在浏览器中登录 yes.vg",
      }
    }

    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ")

    const balanceData = await fetchYesCodeBalance(cookieString)
    return { success: true, data: balanceData }
  })

  onMessage(MessageType.FETCH_CURSOR_USAGE, async () => {
    const cookies = await browser.cookies.getAll({
      domain: "cursor.com",
    })

    if (!cookies || cookies.length === 0) {
      return {
        success: false,
        error: "请先在浏览器中登录 cursor.com",
      }
    }

    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ")

    const usageData = await fetchCursorUsage(cookieString)
    return { success: true, data: usageData }
  })

  onMessage(MessageType.FETCH_MINIMAX_REMAINS, async () => {
    const config = await getAppConfig()

    if (!config.miniMax.apiKey) {
      return {
        success: false,
        error: "请先在设置中配置 MiniMax API Key",
      }
    }

    const remainsData = await fetchMiniMaxRemains(config.miniMax.apiKey)
    return { success: true, data: remainsData }
  })

  async function sendCookiesToBackend(config: {
    domain: string
    apiUrl: string
    interval: number
    enabled: boolean
  }) {
    try {
      const cookies = await browser.cookies.getAll({
        domain: config.domain,
      })

      if (!cookies || cookies.length === 0) {
        console.log(`未找到域名 ${config.domain} 的 cookie`)
        return
      }

      const cookieData = cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
      }))

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

  function createTimerForConfig(config: {
    domain: string
    apiUrl: string
    interval: number
    enabled: boolean
  }) {
    const existingTimer = cookieTimers.get(config.domain)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    if (!config.enabled) {
      return
    }

    const scheduleNext = () => {
      sendCookiesToBackend(config)

      const timerId = setTimeout(scheduleNext, config.interval)
      cookieTimers.set(config.domain, timerId as unknown as number)
    }

    scheduleNext()
  }

  async function initializeCookieTimers() {
    for (const timerId of cookieTimers.values()) {
      clearTimeout(timerId)
    }
    cookieTimers.clear()

    const config = await getAppConfig()
    const configs = config.sendCookie

    for (const c of configs) {
      if (c.enabled) {
        createTimerForConfig(c)
      }
    }

    console.log(
      `已初始化 ${configs.filter((c) => c.enabled).length} 个 cookie 定时器`,
    )
  }
})

import {
  fetchCursorUsage,
  fetchMiniMaxRemains,
  fetchYesCodeBalance,
} from "@/lib/api"
import {
  getConfig,
  getMiniMaxConfig,
  getSendCookieConfig,
  saveConfig,
  saveMiniMaxConfig,
  saveSendCookieConfig,
} from "@/lib/storage"

// 初始化 webext-bridge，必须在其他导入之前
import "webext-bridge/background"
import { onMessage, sendMessage } from "webext-bridge/background"

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

  // ========== 消息处理器 ==========

  onMessage("getConfig", async () => {
    const config = await getConfig()
    return { success: true, data: config }
  })

  onMessage("saveConfig", async ({ data }) => {
    await saveConfig(data)
    // 广播配置更新通知到所有标签页
    await sendMessage("configUpdated", null, "background")
    return { success: true }
  })

  onMessage("fetchBalance", async () => {
    // 获取 yes.vg 的认证 cookie
    const cookies = await browser.cookies.getAll({
      domain: "yes.vg",
    })

    if (!cookies || cookies.length === 0) {
      return {
        success: false,
        error: "请先在浏览器中登录 yes.vg",
      }
    }

    // 将所有 cookie 拼接成字符串
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ")

    const balanceData = await fetchYesCodeBalance(cookieString)
    return { success: true, data: balanceData }
  })

  onMessage("fetchCursorUsage", async () => {
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
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ")

    const usageData = await fetchCursorUsage(cookieString)
    return { success: true, data: usageData }
  })

  onMessage("getSendCookieConfig", async () => {
    const config = await getSendCookieConfig()
    return { success: true, data: config }
  })

  onMessage("saveSendCookieConfig", async ({ data }) => {
    await saveSendCookieConfig(data)
    // 重新初始化定时器
    await initializeCookieTimers()
    // 广播配置更新通知到所有标签页
    await sendMessage("sendCookieConfigUpdated", null, "background")
    return { success: true }
  })

  onMessage("getMiniMaxConfig", async () => {
    const config = await getMiniMaxConfig()
    return { success: true, data: config }
  })

  onMessage("saveMiniMaxConfig", async ({ data }) => {
    await saveMiniMaxConfig(data)
    return { success: true }
  })

  onMessage("fetchMiniMaxRemains", async () => {
    const config = await getMiniMaxConfig()

    if (!config.apiKey) {
      return {
        success: false,
        error: "请先在设置中配置 MiniMax API Key",
      }
    }

    const remainsData = await fetchMiniMaxRemains(config.apiKey)
    return { success: true, data: remainsData }
  })

  // ========== Cookie 定时器相关 ==========

  /**
   * 发送 cookies 到后端 API
   */
  async function sendCookiesToBackend(config: {
    domain: string
    apiUrl: string
    interval: number
    enabled: boolean
  }) {
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
  function createTimerForConfig(config: {
    domain: string
    apiUrl: string
    interval: number
    enabled: boolean
  }) {
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

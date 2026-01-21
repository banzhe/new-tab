import type { CursorUsageData, YesCodeBalanceData, MiniMaxRemainsData } from "@/types/messages"

// 硬编码的 API 配置
const YESCODE_API_URL = "https://co.yes.vg/api/v1/user/balance"

/**
 * 获取 YesCode 余额数据
 * @param cookie 认证 cookie
 * @returns 余额数据
 * @throws 当 cookie 为空时抛出错误
 * @throws 当网络请求失败时抛出错误
 */
export async function fetchYesCodeBalance(
  cookie: string,
): Promise<YesCodeBalanceData> {
  if (!cookie) {
    throw new Error("Cookie 不能为空")
  }

  const response = await fetch(YESCODE_API_URL, {
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data as YesCodeBalanceData
}

// Cursor API 配置
const CURSOR_USAGE_API_URL =
  "https://cursor.com/api/dashboard/get-aggregated-usage-events"

/**
 * 获取 Cursor 每月用量数据
 * @param cookie 认证 cookie
 * @returns 用量数据
 * @throws 当 cookie 为空时抛出错误
 * @throws 当网络请求失败时抛出错误
 */
export async function fetchCursorUsage(
  cookie: string,
): Promise<CursorUsageData> {
  if (!cookie) {
    throw new Error("Cookie 不能为空")
  }

  const response = await fetch(CURSOR_USAGE_API_URL, {
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data as CursorUsageData
}

// MiniMax API 配置
const MINIMAX_API_URL =
  "https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains"

/**
 * 获取 MiniMax 周期用量数据
 * @param apiKey MiniMax API Key
 * @returns 用量数据
 * @throws 当 apiKey 为空时抛出错误
 * @throws 当网络请求失败时抛出错误
 */
export async function fetchMiniMaxRemains(
  apiKey: string,
): Promise<MiniMaxRemainsData> {
  if (!apiKey) {
    throw new Error("API Key 不能为空")
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data as MiniMaxRemainsData
}

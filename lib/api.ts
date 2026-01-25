import type {
  CursorUsageData,
  MiniMaxRemainsData,
  PackyCodexUserInfo,
  YesCodeBalanceData,
} from "@/types/messages"

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

/**
 * HTTP 错误类型，包含状态码和错误信息
 */
export class HttpError extends Error {
  status: number
  message: string

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.message = message
    this.name = "HttpError"
  }
}

// PackyCodex API 配置
const PACKYCODEX_USER_INFO_API_URL =
  "https://codex.packycode.com/api/backend/users/info"

/**
 * 获取 PackyCodex 用户信息
 * @param token Bearer token
 * @param cookie 认证 cookie（附加传递）
 * @returns 用户信息数据
 * @throws 当 token 为空时抛出 Error
 * @throws 当请求失败时抛出 HttpError（包含 status 和 message）
 */
export async function fetchPackyCodexUserInfo(
  token: string,
  _cookie: string,
): Promise<PackyCodexUserInfo> {
  if (!token) {
    throw new Error("Token 不能为空")
  }

  const response = await fetch(PACKYCODEX_USER_INFO_API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `请求失败: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()
  return data as PackyCodexUserInfo
}

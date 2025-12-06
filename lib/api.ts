import type { YesCodeBalanceData } from "@/types/messages"

// 硬编码的 API 配置
const YESCODE_API_URL = "https://co.yes.vg/api/v1/user/balance"

/**
 * 获取 YesCode 余额数据
 * @param apiKey API 密钥
 * @returns 余额数据
 * @throws 当 API Key 为空时抛出错误
 * @throws 当网络请求失败时抛出错误
 */
export async function fetchYesCodeBalance(
  apiKey: string,
): Promise<YesCodeBalanceData> {
  if (!apiKey) {
    throw new Error("API Key 不能为空")
  }

  const response = await fetch(YESCODE_API_URL, {
    headers: {
      Authorization: `${apiKey}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data as YesCodeBalanceData
}

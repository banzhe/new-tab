import { useRequest } from "ahooks"
import { useEffect } from "react"
import { onMessage, sendMessage } from "webext-bridge/content-script"
import { SmallCard } from "./SmallCard"

// 格式化 token 数量
function formatTokens(tokens?: string): string {
  if (!tokens) return "0"
  const num = Number.parseInt(tokens, 10)
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

// 格式化费用（美分转美元）
function formatCost(cents?: number): string {
  if (!cents) return "$0.00"
  return `$${(cents / 100).toFixed(2)}`
}

export function CursorUsage() {
  const cardTitle = "Cursor 每月用量"
  const externalLink = "https://cursor.com/home"
  const {
    data: usageData = {
      aggregations: [],
      totalInputTokens: "0",
      totalOutputTokens: "0",
      totalCacheWriteTokens: "0",
      totalCacheReadTokens: "0",
      totalCostCents: 0,
    },
    loading,
    error,
    refresh: fetchUsage,
  } = useRequest(
    async () => {
      const response = await sendMessage("fetchCursorUsage", null, "background")

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.error || "获取数据失败")
    },
    {
      onError: (err) => {
        console.error("Failed to fetch Cursor usage:", err)
      },
    },
  )

  useEffect(() => {
    onMessage("configUpdated", () => {
      fetchUsage()
    })
  }, [fetchUsage])

  if (error) {
    return (
      <SmallCard title={cardTitle} externalLink={externalLink}>
        <div className="flex h-full items-center justify-center">
          <p className="text-destructive">{error.message}</p>
        </div>
      </SmallCard>
    )
  }

  return (
    <SmallCard loading={loading} title={cardTitle} externalLink={externalLink}>
      {/* 总计统计 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">总费用</p>
          <p className="text-2xl font-bold">
            {formatCost(usageData.totalCostCents)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">输入 Tokens</p>
          <p className="text-lg font-semibold">
            {formatTokens(usageData.totalInputTokens)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">输出 Tokens</p>
          <p className="text-lg font-semibold">
            {formatTokens(usageData.totalOutputTokens)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">缓存写入</p>
          <p className="text-lg font-semibold">
            {formatTokens(usageData.totalCacheWriteTokens)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">缓存读取</p>
          <p className="text-lg font-semibold">
            {formatTokens(usageData.totalCacheReadTokens)}
          </p>
        </div>
      </div>
    </SmallCard>
  )
}

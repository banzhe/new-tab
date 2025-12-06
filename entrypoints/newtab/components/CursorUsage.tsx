import { useRequest } from "ahooks"
import { useEffect } from "react"
import {
  type ConfigUpdatedMessage,
  type CursorUsageResponse,
  MessageType,
} from "@/types/messages"
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
  const {
    data: usageData,
    loading,
    error,
    refresh: fetchUsage,
  } = useRequest(
    async () => {
      const response: CursorUsageResponse = await browser.runtime.sendMessage({
        type: MessageType.FETCH_CURSOR_USAGE,
      })

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
    const handleMessage = (message: ConfigUpdatedMessage) => {
      if (message.type === MessageType.CONFIG_UPDATED) {
        fetchUsage()
      }
    }

    browser.runtime.onMessage.addListener(handleMessage)

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage)
    }
  }, [fetchUsage])

  if (loading) {
    return (
      <SmallCard title={cardTitle}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </SmallCard>
    )
  }

  if (error) {
    return (
      <SmallCard title={cardTitle}>
        <div className="flex h-full items-center justify-center">
          <p className="text-destructive">{error.message}</p>
        </div>
      </SmallCard>
    )
  }

  if (!usageData) {
    return null
  }

  return (
    <SmallCard title={cardTitle}>
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

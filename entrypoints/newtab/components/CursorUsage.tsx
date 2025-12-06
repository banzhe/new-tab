import { useRequest } from "ahooks"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  type ConfigUpdatedMessage,
  type CursorUsageResponse,
  MessageType,
} from "@/types/messages"

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

// 格式化模型名称
function formatModelName(modelIntent: string): string {
  const nameMap: Record<string, string> = {
    default: "Default",
    agent_review: "Agent Review",
    "claude-4.5-opus-high-thinking": "Claude 4.5 Opus",
  }
  return nameMap[modelIntent] || modelIntent
}

export function CursorUsage() {
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cursor 每月用量</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cursor 每月用量</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-destructive">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usageData) {
    return null
  }

  // 过滤掉没有用量数据的模型
  const modelsWithUsage = usageData.aggregations.filter(
    (agg) =>
      agg.totalCents ||
      agg.inputTokens ||
      agg.outputTokens ||
      agg.cacheReadTokens ||
      agg.cacheWriteTokens,
  )

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Cursor 每月用量</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Separator />

        {/* 按模型分类的详细用量 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">模型用量详情</h3>
          <div className="space-y-3">
            {modelsWithUsage.map((agg) => (
              <div
                key={agg.modelIntent}
                className="rounded-lg border bg-muted/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">
                    {formatModelName(agg.modelIntent)}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {formatCost(agg.totalCents)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                  <div>
                    <span className="block text-xs">输入</span>
                    <span>{formatTokens(agg.inputTokens)}</span>
                  </div>
                  <div>
                    <span className="block text-xs">输出</span>
                    <span>{formatTokens(agg.outputTokens)}</span>
                  </div>
                  <div>
                    <span className="block text-xs">缓存写入</span>
                    <span>{formatTokens(agg.cacheWriteTokens)}</span>
                  </div>
                  <div>
                    <span className="block text-xs">缓存读取</span>
                    <span>{formatTokens(agg.cacheReadTokens)}</span>
                  </div>
                </div>
              </div>
            ))}
            {modelsWithUsage.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                暂无用量数据
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

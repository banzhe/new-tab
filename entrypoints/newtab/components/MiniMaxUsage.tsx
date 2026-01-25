import { useRequest } from "ahooks"
import { useEffect } from "react"
import { onMessage, sendMessage } from "webext-bridge/content-script"
import { Progress } from "@/components/ui/progress"
import { fillDefaults } from "@/lib/utils"
import { MessageType } from "@/types/messages"
import { SmallCard } from "./SmallCard"

function formatTime(ms: number): string {
  if (ms <= 0) return "即将重置"
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天${hours % 24}小时后重置`
  }
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟后重置`
  }
  if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒后重置`
  }
  return `${seconds}秒后重置`
}

const defaultValue = {
  model_remains: [],
}

interface ModelRemain {
  start_time: number
  end_time: number
  remains_time: number
  current_interval_total_count: number
  current_interval_usage_count: number
  model_name: string
}

interface ModelRemainCardProps {
  model: ModelRemain
}

function ModelRemainCard({ model }: ModelRemainCardProps) {
  const remaining = model.current_interval_usage_count
  const total = model.current_interval_total_count
  const usagePercent = total > 0 ? ((total - remaining) / total) * 100 : 0

  const startDate = new Date(model.start_time)
  const endDate = new Date(model.end_time)
  const periodText = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")} - ${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h4 className="font-medium text-sm">{model.model_name}</h4>
        <p className="text-lg font-medium">{periodText}</p>
        <p className="text-xs text-muted-foreground">
          {formatTime(model.remains_time)}
        </p>
      </div>

      <Progress value={usagePercent} className="h-2" />
      <div className="text-xs text-right text-muted-foreground">
        已使用 {usagePercent.toFixed(1)}%
      </div>
    </div>
  )
}

export function MiniMaxUsage() {
  const cardTitle = "MiniMax 周期用量"
  const externalLink = "https://www.minimaxi.com"

  const {
    data: remainsData = { ...defaultValue },
    loading,
    error,
    refresh: fetchRemains,
  } = useRequest(
    async () => {
      const response = await sendMessage(
        MessageType.FETCH_MINIMAX_REMAINS,
        null,
        "background",
      )

      if (response.success && response.data) {
        return fillDefaults(response.data, defaultValue)
      }

      throw new Error(response.error || "获取数据失败")
    },
    {
      onError: (err) => {
        console.error("Failed to fetch MiniMax remains:", err)
      },
    },
  )

  useEffect(() => {
    // 监听配置更新
    onMessage(MessageType.APP_CONFIG_UPDATED, () => {
      fetchRemains()
    })
  }, [fetchRemains])

  if (error) {
    return (
      <SmallCard title={cardTitle} externalLink={externalLink}>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">{error.message}</p>
        </div>
      </SmallCard>
    )
  }

  return (
    <SmallCard loading={loading} title={cardTitle} externalLink={externalLink}>
      <div className="space-y-4">
        {remainsData.model_remains.length === 0 ? (
          <p className="text-muted-foreground text-center">暂无用量数据</p>
        ) : (
          remainsData.model_remains.map((model: ModelRemain) => (
            <ModelRemainCard key={model.model_name} model={model} />
          ))
        )}
      </div>
    </SmallCard>
  )
}

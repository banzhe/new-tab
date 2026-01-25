import { useRequest } from "ahooks"
import { sendMessage } from "webext-bridge/options"
import { Progress } from "@/components/ui/progress"
import { formatCountdownTime } from "@/lib/utils"
import { MessageType, type PackyCodexUserInfo } from "@/types/messages"
import { SmallCard } from "./SmallCard"

const defaultValue: PackyCodexUserInfo = {
  daily_budget_usd: "0",
  daily_spent_usd: "0",
  weekly_budget_usd: "0",
  weekly_spent_usd: "0",
  weekly_window_end: "",
}

function formatCountdown(weeklyWindowEnd: string): {
  absoluteTime: string
  countdown: string
} {
  const endTime = new Date(weeklyWindowEnd).getTime()

  // Handle invalid date
  if (Number.isNaN(endTime)) {
    return { absoluteTime: "N/A", countdown: "N/A" }
  }

  const now = Date.now()
  const diff = endTime - now

  const absoluteTime = new Date(weeklyWindowEnd).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return {
    absoluteTime,
    countdown: formatCountdownTime(diff),
  }
}

function UsageProgress({
  label,
  spent,
  budget,
}: {
  label: string
  spent: string
  budget: string
}) {
  const spentNum = Number.isNaN(Number.parseFloat(spent))
    ? 0
    : Number.parseFloat(spent)
  const budgetNum = Number.parseFloat(budget || "0")

  const isBudgetValid = !Number.isNaN(budgetNum) && budgetNum > 0
  const percent = isBudgetValid
    ? Math.min(Math.max((spentNum / budgetNum) * 100, 0), 100)
    : 0

  const displaySpent = Number.isFinite(spentNum) ? spentNum.toFixed(2) : "0.00"
  const displayBudget = isBudgetValid ? budgetNum.toFixed(2) : "N/A"
  const displayPercent = isBudgetValid ? `${percent.toFixed(1)}%` : "N/A"

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{displayPercent}</p>
      </div>
      <Progress value={percent} className="h-2" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">已使用: ${displaySpent}</span>
        <span className="text-muted-foreground">限额: ${displayBudget}</span>
      </div>
    </div>
  )
}

export function PackyCodexUsage() {
  const cardTitle = "PackyCodex 使用量"
  const externalLink = "https://codex.packycode.com"

  const {
    data: userInfo = { ...defaultValue },
    loading,
    error,
  } = useRequest(
    async () => {
      const response = await sendMessage(
        MessageType.FETCH_PACKYCODEX_USER_INFO,
        null,
        "background",
      )

      if (response.success && response.data) {
        return { ...defaultValue, ...response.data }
      }

      throw new Error(response.error || "获取数据失败")
    },
    {
      onError: (err) => {
        console.error("Failed to fetch PackyCodex user info:", err)
      },
    },
  )

  if (error) {
    return (
      <SmallCard title={cardTitle} externalLink={externalLink}>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">{error.message}</p>
        </div>
      </SmallCard>
    )
  }

  const { absoluteTime, countdown } = userInfo.weekly_window_end
    ? formatCountdown(userInfo.weekly_window_end)
    : { absoluteTime: "N/A", countdown: "N/A" }

  return (
    <SmallCard loading={loading} title={cardTitle} externalLink={externalLink}>
      <div className="space-y-4">
        <UsageProgress
          label="每日使用情况"
          spent={userInfo.daily_spent_usd}
          budget={userInfo.daily_budget_usd}
        />

        <UsageProgress
          label="每周使用情况"
          spent={userInfo.weekly_spent_usd}
          budget={userInfo.weekly_budget_usd}
        />

        <div className="space-y-1 pt-2">
          <p className="text-sm text-muted-foreground">每周重置时间</p>
          <p className="text-sm font-medium">{absoluteTime}</p>
          <p className="text-xs text-muted-foreground">{countdown}</p>
        </div>
      </div>
    </SmallCard>
  )
}

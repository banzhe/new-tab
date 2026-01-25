import { useRequest } from "ahooks"
import { useEffect } from "react"
import { onMessage, sendMessage } from "webext-bridge/options"
import { Progress } from "@/components/ui/progress"
import { fillDefaults } from "@/lib/utils"
import { MessageType } from "@/types/messages"
import { SmallCard } from "./SmallCard"

const defaultValue = {
  subscription_balance: 0,
  weekly_spent_balance: 0,
  weekly_limit: 0,
  total_balance: 0,
  pay_as_you_go_balance: 0,
  balance: 0,
}

export function YesCodeBalance() {
  const cardTitle = "YesCode 余额统计"
  const externalLink = "https://co.yes.vg/dashboard"
  // Fetch balance using useRequest
  const {
    data: balanceData = { ...defaultValue },
    loading,
    error,
    refresh: fetchBalance,
  } = useRequest(
    async () => {
      const response = await sendMessage(
        MessageType.FETCH_BALANCE,
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
        console.error("Failed to fetch balance:", err)
      },
    },
  )

  useEffect(() => {
    // Listen for config updates from background script
    onMessage(MessageType.APP_CONFIG_UPDATED, () => {
      fetchBalance()
    })
  }, [fetchBalance])

  if (error) {
    return (
      <SmallCard title={cardTitle} externalLink={externalLink}>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">{error.message}</p>
        </div>
      </SmallCard>
    )
  }

  const weeklyUsagePercent =
    (balanceData.weekly_spent_balance / balanceData.weekly_limit) * 100

  return (
    <SmallCard loading={loading} title={cardTitle} externalLink={externalLink}>
      {/* Subscription Balance */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">订阅余额</p>
        <p className="text-3xl font-bold">
          ${balanceData.subscription_balance.toFixed(2)}
        </p>
      </div>

      {/* Weekly Usage Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">本周使用情况</h3>
          <p className="text-sm text-muted-foreground">
            {weeklyUsagePercent.toFixed(1)}%
          </p>
        </div>
        <Progress value={weeklyUsagePercent} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            已使用: ${balanceData.weekly_spent_balance.toFixed(2)}
          </span>
          <span className="text-muted-foreground">
            限额: ${balanceData.weekly_limit.toFixed(2)}
          </span>
        </div>
      </div>
    </SmallCard>
  )
}

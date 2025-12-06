import { useRequest } from "ahooks"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  type BalanceResponse,
  type ConfigUpdatedMessage,
  MessageType,
} from "@/types/messages"

export function YesCodeBalance() {
  // Fetch balance using useRequest
  const {
    data: balanceData,
    loading,
    error,
    refresh: fetchBalance,
  } = useRequest(
    async () => {
      const response: BalanceResponse = await browser.runtime.sendMessage({
        type: MessageType.FETCH_BALANCE,
      })

      if (response.success && response.data) {
        return response.data
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
    const handleMessage = (message: ConfigUpdatedMessage) => {
      if (message.type === MessageType.CONFIG_UPDATED) {
        fetchBalance()
      }
    }

    browser.runtime.onMessage.addListener(handleMessage)

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage)
    }
  }, [fetchBalance])

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>YesCode 余额统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
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
          <CardTitle>YesCode 余额统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!balanceData) {
    return null
  }

  const weeklyUsagePercent =
    (balanceData.weekly_spent_balance / balanceData.weekly_limit) * 100

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>YesCode 余额统计</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  )
}

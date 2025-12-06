import { useEffect, useState } from "react"
import {
  type ConfigResponse,
  type ConfigUpdatedMessage,
  MessageType,
} from "@/types/messages"
import { SearchBar } from "./components/SearchBar"
import { SettingsDrawer } from "./components/SettingsDrawer"
import { YesCodeBalance } from "./components/YesCodeBalance"

function App() {
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    // Load initial config
    browser.runtime
      .sendMessage({ type: MessageType.GET_CONFIG })
      .then((response: ConfigResponse) => {
        if (response.success && response.data) {
          setShowBalance(response.data.showBalance)
        }
      })
      .catch((error) => {
        console.error("Failed to load config:", error)
      })

    // Listen for config updates
    const handleMessage = (message: ConfigUpdatedMessage) => {
      if (message.type === MessageType.CONFIG_UPDATED) {
        browser.runtime
          .sendMessage({ type: MessageType.GET_CONFIG })
          .then((response: ConfigResponse) => {
            if (response.success && response.data) {
              setShowBalance(response.data.showBalance)
            }
          })
          .catch((error) => {
            console.error("Failed to reload config:", error)
          })
      }
    }

    browser.runtime.onMessage.addListener(handleMessage)

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-8">
      <SettingsDrawer />

      {/* 搜索栏 */}
      <SearchBar placeholder="搜索 Google..." />

      {/* YesCode 余额统计 */}
      {showBalance && <YesCodeBalance />}
    </div>
  )
}

export default App

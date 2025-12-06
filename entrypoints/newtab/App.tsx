import { useEffect, useState } from "react"
import {
  type Bookmark,
  type ConfigResponse,
  type ConfigUpdatedMessage,
  MessageType,
} from "@/types/messages"
import { BookmarkGrid } from "./components/BookmarkGrid"
import { CursorUsage } from "./components/CursorUsage"
import { SearchBar } from "./components/SearchBar"
import { SettingsDrawer } from "./components/SettingsDrawer"
import { YesCodeBalance } from "./components/YesCodeBalance"

function App() {
  const [showBalance, setShowBalance] = useState(true)
  const [showCursorUsage, setShowCursorUsage] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    // Load initial config
    browser.runtime
      .sendMessage({ type: MessageType.GET_CONFIG })
      .then((response: ConfigResponse) => {
        if (response.success && response.data) {
          setShowBalance(response.data.showBalance)
          setShowCursorUsage(response.data.showCursorUsage)
          setBookmarks(response.data.bookmarks || [])
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
              setShowCursorUsage(response.data.showCursorUsage)
              setBookmarks(response.data.bookmarks || [])
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
    <div className="h-dvh w-dvw">
      <SettingsDrawer />

      <div className="absolute top-[40%] left-0 w-full flex flex-col items-center justify-center gap-8">
        {/* 搜索栏 */}
        <div className="w-full max-w-2xl">
          <SearchBar placeholder="搜索 Google..." />
        </div>

        <div className="w-full flex justify-center">
          <div className="w-2xl overflow-auto grid grid-cols-2 max-h-128 gap-8 no-scroll">
            {/* 快捷书签 */}
            <BookmarkGrid
              bookmarks={bookmarks}
              className="w-full max-w-2xl col-span-2 overflow-auto"
            />

            {/* YesCode 余额统计 */}
            {showBalance && <YesCodeBalance />}

            {/* Cursor 每月用量 */}
            {showCursorUsage && <CursorUsage />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

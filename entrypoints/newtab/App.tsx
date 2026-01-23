import { useEffect, useState } from "react"
import { onMessage, sendMessage } from "webext-bridge/content-script"
import type { Bookmark } from "@/types/messages"
import { BookmarkGrid } from "./components/BookmarkGrid"
import { CursorUsage } from "./components/CursorUsage"
import { MiniMaxUsage } from "./components/MiniMaxUsage"
import { SearchBar } from "./components/SearchBar"
import { SettingsDrawer } from "./components/SettingsDrawer"
import { YesCodeBalance } from "./components/YesCodeBalance"

function App() {
  const [showBalance, setShowBalance] = useState(true)
  const [showCursorUsage, setShowCursorUsage] = useState(true)
  const [showMiniMaxUsage, setShowMiniMaxUsage] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    // Load initial config
    sendMessage("getConfig", null, "background")
      .then((response) => {
        if (response.success && response.data) {
          setShowBalance(response.data.showBalance)
          setShowCursorUsage(response.data.showCursorUsage)
          setBookmarks(response.data.bookmarks || [])
        }
      })
      .catch((error) => {
        console.error("Failed to load config:", error)
      })

    // Load MiniMax config
    sendMessage("getMiniMaxConfig", null, "background")
      .then((response) => {
        if (response.success && response.data) {
          setShowMiniMaxUsage(response.data.showUsage)
        }
      })
      .catch((error) => {
        console.error("Failed to load MiniMax config:", error)
      })

    // Listen for config updates
    onMessage("configUpdated", () => {
      sendMessage("getConfig", null, "background")
        .then((response) => {
          if (response.success && response.data) {
            setShowBalance(response.data.showBalance)
            setShowCursorUsage(response.data.showCursorUsage)
            setBookmarks(response.data.bookmarks || [])
          }
        })
        .catch((error) => {
          console.error("Failed to reload config:", error)
        })

      // Reload MiniMax config
      sendMessage("getMiniMaxConfig", null, "background")
        .then((response) => {
          if (response.success && response.data) {
            setShowMiniMaxUsage(response.data.showUsage)
          }
        })
        .catch((error) => {
          console.error("Failed to reload MiniMax config:", error)
        })
    })
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

            {/* MiniMax 周期用量 */}
            {showMiniMaxUsage && <MiniMaxUsage />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

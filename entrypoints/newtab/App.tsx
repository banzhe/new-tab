import { useEffect, useState } from "react"
import { onMessage, sendMessage } from "webext-bridge/options"
import { type Bookmark, MessageType } from "@/types/messages"
import { BookmarkGrid } from "./components/BookmarkGrid"
import { CursorUsage } from "./components/CursorUsage"
import { MiniMaxUsage } from "./components/MiniMaxUsage"
import { PackyCodexUsage } from "./components/PackyCodexUsage"
import { SearchBar } from "./components/SearchBar"
import { SettingsDrawer } from "./components/SettingsDrawer"
import { YesCodeBalance } from "./components/YesCodeBalance"

function App() {
  const [showYesCodeUsage, setShowYesCodeUsage] = useState(false)
  const [showCursorUsage, setShowCursorUsage] = useState(false)
  const [showMiniMaxUsage, setShowMiniMaxUsage] = useState(false)
  const [showPackyCodexUsage, setShowPackyCodexUsage] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    sendMessage(MessageType.GET_APP_CONFIG, null, "background")
      .then((response) => {
        if (response.success && response.data) {
          setShowYesCodeUsage(response.data.yesCode.showUsage)
          setShowCursorUsage(response.data.cursorSettings.showUsage)
          setBookmarks(response.data.bookmarks.items || [])
          setShowMiniMaxUsage(response.data.miniMax.showUsage)
          setShowPackyCodexUsage(response.data.packyCodex.showUsage)
        }
      })
      .catch((error) => {
        console.error("Failed to load config:", error)
      })

    onMessage(MessageType.APP_CONFIG_UPDATED, () => {
      sendMessage(MessageType.GET_APP_CONFIG, null, "background")
        .then((response) => {
          if (response.success && response.data) {
            setShowYesCodeUsage(response.data.yesCode.showUsage)
            setShowCursorUsage(response.data.cursorSettings.showUsage)
            setBookmarks(response.data.bookmarks.items || [])
            setShowMiniMaxUsage(response.data.miniMax.showUsage)
            setShowPackyCodexUsage(response.data.packyCodex.showUsage)
          }
        })
        .catch((error) => {
          console.error("Failed to reload config:", error)
        })
    })
  }, [])

  return (
    <div className="h-dvh w-dvw">
      <SettingsDrawer />

      <div className="absolute top-[40%] left-0 w-full flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-2xl">
          <SearchBar placeholder="搜索 Google..." />
        </div>

        <div className="w-full flex justify-center">
          <div className="w-2xl overflow-auto grid grid-cols-2 max-h-128 gap-8 no-scroll">
            <BookmarkGrid
              bookmarks={bookmarks}
              className="w-full max-w-2xl col-span-2 overflow-auto"
            />

            {showYesCodeUsage && <YesCodeBalance />}

            {showCursorUsage && <CursorUsage />}

            {showMiniMaxUsage && <MiniMaxUsage />}

            {showPackyCodexUsage && <PackyCodexUsage />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

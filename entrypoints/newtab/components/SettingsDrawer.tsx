import { useRequest } from "ahooks"
import { Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  type Bookmark,
  type ConfigResponse,
  MessageType,
  type SaveConfigMessage,
} from "@/types/messages"
import { BookmarkSettings } from "./BookmarkSettings"
import { YesCodeSettings } from "./YesCodeSettings"

export function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const [yesCodeApiKey, setYesCodeApiKey] = useState("")
  const [showBalance, setShowBalance] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  // Load config using useRequest
  const { refresh: reloadConfig } = useRequest(
    async () => {
      const response: ConfigResponse = await browser.runtime.sendMessage({
        type: MessageType.GET_CONFIG,
      })
      if (response.success && response.data) {
        setYesCodeApiKey(response.data.apiKey)
        setShowBalance(response.data.showBalance)
        setBookmarks(response.data.bookmarks || [])
      }
      return response
    },
    {
      onError: (error) => {
        console.error("Failed to load config:", error)
      },
    },
  )

  // Save config using useRequest
  const { loading: saving, run: saveConfig } = useRequest(
    async () => {
      const response = await browser.runtime.sendMessage<SaveConfigMessage>({
        type: MessageType.SAVE_CONFIG,
        payload: { apiKey: yesCodeApiKey, showBalance, bookmarks },
      })

      if (response.success) {
        setOpen(false)
        // Background script will automatically broadcast update notification
      } else {
        throw new Error(response.error || "Failed to save config")
      }

      return response
    },
    {
      manual: true,
      onError: (error) => {
        console.error("Failed to save config:", error)
      },
    },
  )

  const handleCancel = () => {
    // Reload settings from background script
    reloadConfig()
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      {/* Trigger button - fixed top-right */}
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50"
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        {/* Header with close button */}
        <DrawerHeader>
          <DrawerTitle>设置</DrawerTitle>
        </DrawerHeader>

        {/* Scrollable content area */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <YesCodeSettings
            apiKey={yesCodeApiKey}
            onApiKeyChange={setYesCodeApiKey}
            showBalance={showBalance}
            onShowBalanceChange={setShowBalance}
          />

          <BookmarkSettings
            bookmarks={bookmarks}
            onBookmarksChange={setBookmarks}
          />
        </div>

        {/* Footer with actions */}
        <DrawerFooter className="border-t">
          <Button className="w-full" onClick={saveConfig} disabled={saving}>
            {saving ? "保存中..." : "保存设置"}
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={saving}
            >
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

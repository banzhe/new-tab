import { useRequest } from "ahooks"
import { Plus, Settings, Trash2 } from "lucide-react"
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
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  type Bookmark,
  type ConfigResponse,
  MessageType,
  type SaveConfigMessage,
} from "@/types/messages"

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

  // 书签管理函数
  const addBookmark = () => {
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      title: "",
      url: "",
    }
    setBookmarks([...bookmarks, newBookmark])
  }

  const updateBookmark = (id: string, field: keyof Bookmark, value: string) => {
    setBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    )
  }

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id))
  }

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
          <FieldSet>
            <FieldLegend>YesCode</FieldLegend>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="showBalance">开启</FieldLabel>
                </FieldContent>
                <Switch
                  id="showBalance"
                  checked={showBalance}
                  onCheckedChange={setShowBalance}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="apiKey">API Key</FieldLabel>
                </FieldContent>
                <Input
                  id="apiKey"
                  type="password"
                  value={yesCodeApiKey}
                  onChange={(e) => setYesCodeApiKey(e.target.value)}
                  placeholder="输入 API Key"
                  className="w-64"
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* 书签管理 */}
          <FieldSet>
            <FieldLegend>快捷书签</FieldLegend>
            <FieldGroup>
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="flex items-center gap-2">
                  <Input
                    value={bookmark.title}
                    onChange={(e) =>
                      updateBookmark(bookmark.id, "title", e.target.value)
                    }
                    placeholder="标题"
                    className="w-24"
                  />
                  <Input
                    value={bookmark.url}
                    onChange={(e) =>
                      updateBookmark(bookmark.id, "url", e.target.value)
                    }
                    placeholder="网址 (https://...)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBookmark(bookmark.id)}
                    aria-label="删除书签"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBookmark}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加书签
              </Button>
            </FieldGroup>
          </FieldSet>
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

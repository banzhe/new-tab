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
  type ConfigResponse,
  MessageType,
  type SaveConfigMessage,
} from "@/types/messages"

export function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const [yesCodeApiKey, setYesCodeApiKey] = useState("")
  const [showBalance, setShowBalance] = useState(true)

  // Load config using useRequest
  const { refresh: reloadConfig } = useRequest(
    async () => {
      const response: ConfigResponse = await browser.runtime.sendMessage({
        type: MessageType.GET_CONFIG,
      })
      if (response.success && response.data) {
        setYesCodeApiKey(response.data.apiKey)
        setShowBalance(response.data.showBalance)
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
        payload: { apiKey: yesCodeApiKey, showBalance },
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
        <div className="flex-1 overflow-y-auto p-4">
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

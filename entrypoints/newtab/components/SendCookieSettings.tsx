import { Check, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import type { SendCookieConfigItem } from "@/types/messages"

interface SendCookieSettingsProps {
  configs: SendCookieConfigItem[]
  onConfigsChange: (configs: SendCookieConfigItem[]) => void
}

export function SendCookieSettings({
  configs,
  onConfigsChange,
}: SendCookieSettingsProps) {
  const addConfig = () => {
    const newConfig: SendCookieConfigItem = {
      id: crypto.randomUUID(),
      domain: "",
      apiUrl: "",
      interval: 300000, // 默认 5 分钟
      enabled: true,
    }
    onConfigsChange([...configs, newConfig])
  }

  const updateConfig = (
    id: string,
    field: keyof SendCookieConfigItem,
    value: string | number | boolean,
  ) => {
    onConfigsChange(
      configs.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    )
  }

  const removeConfig = (id: string) => {
    onConfigsChange(configs.filter((c) => c.id !== id))
  }

  return (
    <FieldSet>
      <FieldLegend>Cookie 自动发送</FieldLegend>
      <FieldGroup>
        {configs.map((config) => (
          <Card key={config.id}>
            <CardContent className="space-y-3">
              <Field className="w-full">
                <FieldLabel htmlFor={`domain-${config.id}`}>域名</FieldLabel>
                <FieldContent>
                  <Input
                    id={`domain-${config.id}`}
                    value={config.domain}
                    onChange={(e) =>
                      updateConfig(config.id, "domain", e.target.value)
                    }
                    placeholder="域名"
                  />
                </FieldContent>
              </Field>
              <Field className="w-full">
                <FieldLabel htmlFor={`apiUrl-${config.id}`}>
                  API 地址
                </FieldLabel>
                <Input
                  id={`apiUrl-${config.id}`}
                  value={config.apiUrl}
                  onChange={(e) =>
                    updateConfig(config.id, "apiUrl", e.target.value)
                  }
                  placeholder="API 地址"
                />
              </Field>
              <Field className="w-full">
                <FieldLabel htmlFor={`interval-${config.id}`}>
                  发送间隔（毫秒）
                </FieldLabel>
                <Input
                  id={`interval-${config.id}`}
                  type="number"
                  value={config.interval}
                  onChange={(e) =>
                    updateConfig(
                      config.id,
                      "interval",
                      parseInt(e.target.value, 10) || 0,
                    )
                  }
                  placeholder="300000"
                />
              </Field>
              <div className="flex items-center gap-3">
                <Toggle
                  id={`enabled-${config.id}`}
                  pressed={config.enabled}
                  onPressedChange={(pressed) =>
                    updateConfig(config.id, "enabled", pressed)
                  }
                  variant="outline"
                  className="w-1/2 "
                >
                  <Check />
                  启用
                </Toggle>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-1/2"
                  onClick={() => removeConfig(config.id)}
                  aria-label="删除配置"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">删除</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addConfig}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加配置
        </Button>
      </FieldGroup>
    </FieldSet>
  )
}

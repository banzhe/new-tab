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

interface MiniMaxSettingsProps {
  apiKey: string
  showUsage: boolean
  onApiKeyChange: (value: string) => void
  onShowUsageChange: (value: boolean) => void
}

export function MiniMaxSettings({
  apiKey,
  showUsage,
  onApiKeyChange,
  onShowUsageChange,
}: MiniMaxSettingsProps) {
  return (
    <FieldSet>
      <FieldLegend>MiniMax</FieldLegend>
      <FieldGroup>
        <Field orientation="vertical">
          <FieldLabel htmlFor="miniMaxApiKey">API Key</FieldLabel>
          <FieldContent>
            <Input
              id="miniMaxApiKey"
              type="password"
              placeholder="输入 MiniMax API Key"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="showMiniMaxUsage">开启</FieldLabel>
          </FieldContent>
          <Switch
            id="showMiniMaxUsage"
            checked={showUsage}
            onCheckedChange={onShowUsageChange}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

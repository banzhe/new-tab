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

interface YesCodeSettingsProps {
  apiKey: string
  onApiKeyChange: (value: string) => void
  showBalance: boolean
  onShowBalanceChange: (value: boolean) => void
}

export function YesCodeSettings({
  apiKey,
  onApiKeyChange,
  showBalance,
  onShowBalanceChange,
}: YesCodeSettingsProps) {
  return (
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
            onCheckedChange={onShowBalanceChange}
          />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="apiKey">API Key</FieldLabel>
          </FieldContent>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="输入 API Key"
            className="w-64"
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

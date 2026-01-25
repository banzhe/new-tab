import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface PackyCodexSettingsProps {
  showUsage: boolean
  onShowUsageChange: (value: boolean) => void
}

export function PackyCodexSettings({
  showUsage,
  onShowUsageChange,
}: PackyCodexSettingsProps) {
  return (
    <FieldSet>
      <FieldLegend>PackyCodex</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="packyCodexShowUsage">显示用量</FieldLabel>
          </FieldContent>
          <Switch
            id="packyCodexShowUsage"
            checked={showUsage}
            onCheckedChange={onShowUsageChange}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

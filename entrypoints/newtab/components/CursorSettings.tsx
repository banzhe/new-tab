import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface CursorSettingsProps {
  showUsage: boolean
  onShowUsageChange: (value: boolean) => void
}

export function CursorSettings({
  showUsage,
  onShowUsageChange,
}: CursorSettingsProps) {
  return (
    <FieldSet>
      <FieldLegend>Cursor</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="showUsage">显示每月用量</FieldLabel>
          </FieldContent>
          <Switch
            id="showUsage"
            checked={showUsage}
            onCheckedChange={onShowUsageChange}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

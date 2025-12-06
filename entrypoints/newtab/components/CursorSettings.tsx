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
  showCursorUsage: boolean
  onShowCursorUsageChange: (value: boolean) => void
}

export function CursorSettings({
  showCursorUsage,
  onShowCursorUsageChange,
}: CursorSettingsProps) {
  return (
    <FieldSet>
      <FieldLegend>Cursor</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="showCursorUsage">显示每月用量</FieldLabel>
          </FieldContent>
          <Switch
            id="showCursorUsage"
            checked={showCursorUsage}
            onCheckedChange={onShowCursorUsageChange}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

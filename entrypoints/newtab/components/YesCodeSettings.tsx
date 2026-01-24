import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface YesCodeSettingsProps {
  showUsage: boolean
  onShowUsageChange: (value: boolean) => void
}

export function YesCodeSettings({
  showUsage,
  onShowUsageChange,
}: YesCodeSettingsProps) {
  return (
    <FieldSet>
      <FieldLegend>YesCode</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="showUsage">开启</FieldLabel>
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

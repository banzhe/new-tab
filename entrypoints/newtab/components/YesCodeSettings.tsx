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
  showBalance: boolean
  onShowBalanceChange: (value: boolean) => void
}

export function YesCodeSettings({
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
      </FieldGroup>
    </FieldSet>
  )
}

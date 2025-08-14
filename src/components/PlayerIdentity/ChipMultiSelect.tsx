import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
export interface ChipMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  className?: string;
  showCounter?: boolean;
  addYourOwn?: boolean;
  onAddCustom?: (current: string[]) => Promise<string | null> | string | null;
}
export function ChipMultiSelect({
  options,
  value,
  onChange,
  max = 3,
  className,
  showCounter = true,
  addYourOwn = false,
  onAddCustom
}: ChipMultiSelectProps) {
  const handleValueChange = (next: string[]) => {
    if (next.length > max) return; // enforce max
    onChange(next);
  };
  const handleAddCustom = async () => {
    if (!addYourOwn) return;
    if (value.length >= max) return;
    let custom = onAddCustom ? await onAddCustom(value) : null;
    if (typeof custom === "string") {
      custom = custom.trim();
      if (custom && !options.includes(custom) && !value.includes(custom)) {
        onChange([...value, custom]);
      }
    }
  };
  return <div className={cn("space-y-2", className)}>
      <ToggleGroup type="multiple" value={value} onValueChange={handleValueChange} className="flex flex-wrap gap-2 justify-start bg-[#ff0066]">
        {options.map(opt => <ToggleGroupItem key={opt} value={opt} aria-label={opt} className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            {opt}
          </ToggleGroupItem>)}
        {addYourOwn && <button type="button" onClick={handleAddCustom} className={cn("px-3 py-1.5 rounded-md border text-sm", value.length >= max ? "opacity-50 cursor-not-allowed" : "hover:bg-accent")} aria-label="Add your own">
            + Add your own
          </button>}
      </ToggleGroup>
      {showCounter && <p className="text-xs text-muted-foreground">{value.length}/{max} selected (3 max)</p>}
    </div>;
}
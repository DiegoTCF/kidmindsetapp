import React from "react";
import type { MainRole } from "@/data/playerIdentityOptions";

type RoleItem = { value: MainRole; label: string };

interface RoleBoxSelectorProps {
  roles: RoleItem[];
  selected: MainRole | null;
  onSelect: (value: MainRole) => void;
}

export function RoleBoxSelector({ roles, selected, onSelect }: RoleBoxSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {roles.map((r) => {
        const isActive = selected === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onSelect(r.value)}
            aria-pressed={isActive}
            className={
              [
                "rounded-md border p-4 text-left transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-accent text-accent-foreground border-primary shadow"
                  : "hover:bg-muted",
              ].join(" ")
            }
          >
            <div className="font-medium">{r.label}</div>
            <div className="text-xs text-muted-foreground mt-1">Tap to select</div>
          </button>
        );
      })}
    </div>
  );
}

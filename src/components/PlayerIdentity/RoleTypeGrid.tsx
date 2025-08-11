import React from "react";
import type { RoleTypeOption } from "@/data/playerIdentityOptions";

interface RoleTypeGridProps {
  options: RoleTypeOption[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function RoleTypeGrid({ options, selected, onSelect, disabled }: RoleTypeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {options.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onSelect(opt.value)}
            aria-pressed={isActive}
            disabled={disabled}
            className={[
              "rounded-md border p-3 text-left transition relative",
              disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-muted",
              isActive ? "bg-accent text-accent-foreground border-primary shadow" : "",
            ].join(" ")}
          >
            {opt.image && (
              <img
                src={opt.image}
                alt={`Role example - ${opt.label.split(" (")[0]}`}
                className="w-full h-28 object-cover rounded mb-2 border"
                loading="lazy"
              />
            )}
            <div className="font-medium leading-snug">{opt.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{opt.subtitle}</div>
          </button>
        );
      })}
    </div>
  );
}

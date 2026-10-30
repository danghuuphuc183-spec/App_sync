import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export function Switch({
  className,
  checked = false,
  onCheckedChange,
  disabled,
  id,
  label,
  ...props
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none min-h-[44px]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only peer"
        {...props}
      />
      <div
        className={cn(
          "relative h-6 w-11 rounded-full bg-input transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-checked:bg-primary",
          className
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow-md transition-transform duration-200",
            checked && "translate-x-5"
          )}
        />
      </div>
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
}

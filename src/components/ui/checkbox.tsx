import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  error?: boolean;
}

export function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  disabled,
  id,
  label,
  error,
  ...props
}: CheckboxProps) {
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
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-input transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",
          error && "border-destructive",
          className
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </div>
      {label && <span className="text-sm font-medium leading-none">{label}</span>}
    </label>
  );
}

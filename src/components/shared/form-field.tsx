import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (props: {
    id: string;
    error?: boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="Bắt buộc">*</span>}
        </label>
      </div>

      {children({
        id,
        error: !!error,
        "aria-describedby": describedBy,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground leading-normal">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive leading-normal">
          {error}
        </p>
      )}
    </div>
  );
}

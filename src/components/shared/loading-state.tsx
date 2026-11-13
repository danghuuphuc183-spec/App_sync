import * as React from "react";
import { Loader2 } from "lucide-react";
import { t } from "@/lib/i18n";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = t("common.loading") }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <Loader2 className="h-9 w-9 animate-spin text-foreground mb-3" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(!src);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs min-h-[32px] min-w-[32px]",
    md: "h-11 w-11 text-sm min-h-[44px] min-w-[44px]",
    lg: "h-16 w-16 text-lg min-h-[64px] min-w-[64px]",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-muted items-center justify-center font-medium uppercase text-muted-foreground select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{fallback.slice(0, 2)}</span>
      )}
    </div>
  );
}

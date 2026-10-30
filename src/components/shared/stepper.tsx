import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full py-4", className)} aria-label="Tiến trình hoàn thành">
      {/* Mobile view: Thanh tiến trình gọn + số bước */}
      <div className="sm:hidden mb-4">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
          <span className="font-semibold text-foreground">
            Bước {currentStep + 1}/{steps.length}
          </span>
          <span>{steps[currentStep]?.title}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet view: Các vòng tròn bước nối nhau */}
      <ol className="hidden sm:flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li
              key={index}
              className={cn(
                "flex items-center relative",
                index !== steps.length - 1 ? "w-full" : ""
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold border-2 transition-colors select-none",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary bg-primary/10 ring-4 ring-primary/20",
                    isUpcoming && "border-border bg-card text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium mt-1.5 whitespace-nowrap",
                    isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3 mt-[-1rem] transition-colors",
                    index < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

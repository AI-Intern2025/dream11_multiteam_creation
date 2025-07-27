"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        success: "bg-green-200",
        warning: "bg-yellow-200",
        danger: "bg-red-200",
        info: "bg-blue-200",
        cricket: "bg-gradient-to-r from-green-100 to-blue-100",
      },
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
        info: "bg-blue-500",
        cricket: "bg-gradient-to-r from-green-500 to-blue-500",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  indicatorVariant?: VariantProps<typeof progressIndicatorVariants>["variant"]
  showValue?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, size, indicatorVariant, showValue = false, ...props }, ref) => (
  <div className="relative">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ variant, size, className }))}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressIndicatorVariants({ variant: indicatorVariant || variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {showValue && (
      <div className="absolute -top-6 right-0 text-xs font-medium text-muted-foreground">
        {value}%
      </div>
    )}
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info" | "warning"
  message?: string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", message, children, ...props }, ref) => {
    let bgClass = "bg-blue-50 border-blue-100 text-blue-700"
    let iconClass = "ti ti-info-circle"

    if (variant === "error") {
      bgClass = "bg-red-50 border-red-100 text-red-600"
      iconClass = "ti ti-alert-circle"
    } else if (variant === "success") {
      bgClass = "bg-emerald-50 border-emerald-100 text-emerald-700"
      iconClass = "ti ti-circle-check"
    } else if (variant === "warning") {
      bgClass = "bg-amber-50 border-amber-100 text-amber-700"
      iconClass = "ti ti-alert-triangle"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "p-3 rounded-lg text-xs font-semibold border flex items-center gap-2 animate-fade-in",
          bgClass,
          className
        )}
        {...props}
      >
        <i className={cn("text-base flex-shrink-0", iconClass)} />
        <span className="leading-tight">{message || children}</span>
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert }

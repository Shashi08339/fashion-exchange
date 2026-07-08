// frontend/src/components/ui/button.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-5 py-2.5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variant === 'primary' && "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
          variant === 'secondary' && "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
          variant === 'outline' && "border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700",
          variant === 'ghost' && "bg-transparent hover:bg-gray-100 text-gray-700",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
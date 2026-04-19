import * as React from "react"
import { cn } from "../lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onChange, min = 1, max = 10, step = 1, ...props }, ref) => {
    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

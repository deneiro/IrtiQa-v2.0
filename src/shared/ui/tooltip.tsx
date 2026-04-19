"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/shared/lib/utils"

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type as any).displayName === "TooltipTrigger") {
          return React.cloneElement(child as any, { isOpen })
        }
        if (React.isValidElement(child) && (child.type as any).displayName === "TooltipContent") {
          return <AnimatePresence>{isOpen && child}</AnimatePresence>
        }
        return child
      })}
    </div>
  )
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

export const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  TooltipTriggerProps
>(({ className, asChild, children, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      ref,
      className: cn(className, (children as any).props.className),
      ...props,
    })
  }

  return (
    <div ref={ref} className={cn("cursor-default", className)} {...props}>
      {children}
    </div>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, scale: 0.95, y: 5 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 5 }}
    transition={{ duration: 0.1 }}
    className={cn(
      "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap",
      className
    )}
    {...props as any}
  />
))
TooltipContent.displayName = "TooltipContent"

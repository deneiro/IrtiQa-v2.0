"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../lib/utils"

interface AlertDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const AlertDialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function AlertDialog({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (val: boolean) => {
    setUncontrolledOpen(val)
    onOpenChange?.(val)
  }

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e)
        setOpen(true)
      }
    })
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(AlertDialogContext)

  // Escape key handler
  React.useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]"
          />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[201] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "bg-card border w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden p-6",
                className
              )}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-2 mb-6", className)}>{children}</div>
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-xl font-display font-bold uppercase", className)}>{children}</h3>
}

export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground leading-relaxed", className)}>{children}</p>
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex justify-end gap-3 mt-8", className)}>{children}</div>
}

export function AlertDialogAction({ 
  children, 
  onClick, 
  className 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string 
}) {
  const { setOpen } = React.useContext(AlertDialogContext)
  return (
    <button
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
      className={cn(
        "px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 bg-primary text-black hover:opacity-90",
        className
      )}
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpen } = React.useContext(AlertDialogContext)
  return (
    <button
      onClick={() => setOpen(false)}
      className={cn(
        "px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 bg-white/5 hover:bg-white/10 text-foreground",
        className
      )}
    >
      {children || "Cancel"}
    </button>
  )
}

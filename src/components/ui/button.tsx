import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-neon-pink text-neon-pink-foreground hover:bg-neon-pink/90 shadow-lg hover:shadow-neon-pink/25 hover:scale-105 active:scale-95",
        destructive:
          "bg-danger-red text-danger-red-foreground hover:bg-danger-red/90 shadow-lg hover:shadow-red-500/25",
        outline:
          "border-2 border-neon-pink bg-transparent text-neon-pink hover:bg-neon-pink hover:text-neon-pink-foreground shadow-lg hover:shadow-neon-pink/25",
        secondary:
          "bg-bright-blue text-bright-blue-foreground hover:bg-bright-blue/90 shadow-lg hover:shadow-blue-500/25 hover:scale-105",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-bright-blue underline-offset-4 hover:underline font-bold",
        success: "bg-deep-green text-deep-green-foreground hover:bg-deep-green/90 shadow-lg hover:shadow-green-500/25 hover:scale-105",
        warning: "bg-electric-yellow text-electric-yellow-foreground hover:bg-electric-yellow/90 shadow-lg hover:shadow-yellow-500/25",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

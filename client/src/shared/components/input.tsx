import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const inputVariants = cva(
  "flex w-full transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring md:text-sm",
        "premium-hero": "h-20 bg-[#f8f8f6] rounded-3xl px-8 text-xl font-bold font-poppins focus:ring-4 focus:ring-orange-500/10 placeholder:text-black/5 border-none outline-none",
        "premium-code": "h-32 bg-[#f8f8f7] rounded-2xl text-center text-[80px] font-bebas tracking-[0.2em] text-black placeholder:text-black/5 border-none outline-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
